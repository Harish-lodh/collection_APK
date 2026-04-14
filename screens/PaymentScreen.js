import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/loader';
import PaymentModal from '../components/PaymentModal'; // Import your modal component
import apiClient from '../server/apiClient';
import {
  getEmiSchedule,
  initiatePayment,
  verifyPayment,
  PaymentStatus,
} from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/paymentHelpers';
import styles from '../utils/style';

export default function PaymentScreen({ navigation, route }) {
  console.log('PaymentScreen component rendered');
  console.log('route.params:', route.params);

  const { loanData } = route.params || {};
  console.log('loanData from params:', loanData);
  console.log('loanData.lan:', loanData?.lan);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [paymentState, setPaymentState] = useState('IDLE');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [emiList, setEmiList] = useState([]);
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [payingEmiId, setPayingEmiId] = useState(null);
  const [collectedBy, setCollectedBy] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  const isProcessing = useRef(false);
  const sessionPaidRef = useRef(false);
  const currentLanRef = useRef(loanData?.lan || null);
  const storedUserRef = useRef(null);

  const isPaymentLocked =
    paymentState === 'SUCCESS' || isSubmitting || sessionPaidRef.current;
  const canCollect =
    !isPaymentLocked &&
    paymentState !== 'SUCCESS' &&
    !isSubmitting &&
    !sessionPaidRef.current;
  const isPaid = paymentState === 'SUCCESS' || sessionPaidRef.current;

  useEffect(() => {
    console.log('useEffect triggered, lan:', loanData?.lan);

    loadStoredUser();

    if (loanData?.lan) {
      loadPaymentDetails();
    }
  }, [loanData?.lan]);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        storedUserRef.current = user;
        setCollectedBy(user.id || user.name || 'Unknown');
      }
    } catch (error) {
      console.log('Error loading user:', error);
    }
  };

  const loadPaymentDetails = async () => {
    console.log('loadPaymentDetails called');
    console.log('loanData:', loanData);
    console.log('loanData.lan:', loanData?.lan);

    if (!loanData?.lan) {
      Alert.alert('Error', 'Invalid loan account - No LAN found');
      console.log('No LAN - going back');
      navigation.goBack();
      return;
    }

    currentLanRef.current = loanData.lan;

    setIsLoading(true);
    try {
      console.log('Calling getEmiSchedule for LAN:', loanData.lan);
      const result = await getEmiSchedule(loanData.lan, loanData?.product);
      console.log('EMI schedule API result:', result);
      if (result.success && result.data && result.data.length > 0) {
        console.log('EMI data received:', result.data);
        const mappedEmis = result.data.map((emi, index) => ({
          ...emi,
          emiNumber: emi.emiNumber || index + 1,
          amount: emi.amount || emi.emiAmount || 0,
          emiAmount: emi.amount || emi.emiAmount || 0,
        }));
        console.log('Mapped EMIs:', mappedEmis);
        setEmiList(mappedEmis);
      } else {
        console.log('No EMI data or error:', result.error);
        if (result.error) {
          Alert.alert('Error', result.error);
        }
      }
    } catch (error) {
      console.error('Error loading EMI list:', error);
      Alert.alert('Error', 'Failed to load EMI schedule');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaySingleEmi = async emi => {
    if (!canCollect || payingEmiId) return;

    const isPaidStatus = emi.status === 'Paid';
    if (isPaidStatus) {
      Alert.alert('Info', 'This EMI is already paid');
      return;
    }

    const payAmount =
      Number(emi.remainingEmi) ||
      Number(emi.remainingAmount) ||
      Number(emi.emiAmount);
    if (!payAmount || payAmount <= 0) {
      Alert.alert('Info', 'No amount due for this EMI');
      return;
    }

    setPayingEmiId(emi.id);
    setSelectedEmi(emi);
    setAmount(String(payAmount));

    Alert.alert(
      'Pay EMI',
      `Pay EMI #${emi.emiNumber || emi.id} of ${formatCurrency(payAmount)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setPayingEmiId(null),
        },
        {
          text: 'Pay',
          onPress: async () => {
            await payEmi(emi, payAmount);
          },
        },
      ],
    );
  };

  const payEmi = async (emi, payAmount) => {
    if (isProcessing.current) return;

    isProcessing.current = true;
    setIsSubmitting(true);
    setPaymentState('PROCESSING');
    setIsModalVisible(true);

    const product = loanData?.product;
    const emiId = emi.id;

    try {
      const initiateResult = await initiatePayment(emiId, product);

      if (!initiateResult.success) {
        setPaymentState('FAILED');
        setTransactionDetails(null);
        setErrors({ general: initiateResult.error || 'Payment failed' });
        setPayingEmiId(null);
        isProcessing.current = false;
        setIsSubmitting(false);
        return;
      }

      const merchantTxn = initiateResult.merchantTxn;
      const paymentUrl = initiateResult.paymentUrl;

      if (merchantTxn) {
        const maxAttempts = 30;
        let attempts = 0;
        let paymentVerified = false;

        while (attempts < maxAttempts && !paymentVerified) {
          await new Promise(resolve => setTimeout(resolve, 2000));

          const verifyResult = await verifyPayment(merchantTxn);

          if (verifyResult.success && verifyResult.paymentDone) {
            paymentVerified = true;

            setPaymentState('SUCCESS');
            setTransactionDetails({
              transactionId: merchantTxn,
              amount: payAmount,
            });
            const now = new Date().toISOString();
            setEmiList(prev =>
              prev.map(e =>
                e.id === emi.id
                  ? {
                      ...e,
                      status: 'Paid',
                      paidDate: now,
                      transactionId: merchantTxn,
                    }
                  : e,
              ),
            );
            break;
          }

          attempts++;
        }

        if (!paymentVerified) {
          setPaymentState('FAILED');
          setTransactionDetails(null);
          setErrors({ general: 'Payment verification timed out' });
        }
      }
    } catch (error) {
      console.error('EMI payment error:', error);
      setPaymentState('FAILED');
      setTransactionDetails(null);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      setPayingEmiId(null);
      setSelectedEmi(null);
      isProcessing.current = false;
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (isProcessing.current) return;
    if (!canCollect) {
      Alert.alert('Info', 'Payment already collected for this account');
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setErrors({ general: 'Please enter a valid amount' });
      return;
    }

    if (isPaymentLocked || sessionPaidRef.current) {
      Alert.alert('Info', 'Payment already completed for this session');
      return;
    }

    isProcessing.current = true;
    setIsSubmitting(true);
    setPaymentState('PROCESSING'); // Show processing state
    setIsModalVisible(true);

    setErrors({});

    try {
      const paymentPayload = {
        lan: loanData.lan,
        amount: amount,
        collectedBy: collectedBy,
        product: loanData?.product,
      };

      const initiateResult = await initiatePayment(paymentPayload);

      if (!initiateResult.success) {
        setPaymentState('FAILED');
        setTransactionDetails(null);
        setErrors({ general: initiateResult.error || 'Payment failed' });
        isProcessing.current = false;
        setIsSubmitting(false);
        return;
      }

      const transactionData = initiateResult.data;
      setLastTransaction(transactionData);

      setPaymentState('PROCESSING');

      if (transactionData.status === PaymentStatus.COMPLETED) {
        const verifyResult = await verifyPayment(transactionData.transactionId);
        if (verifyResult.success && verifyResult.paymentDone) {
          sessionPaidRef.current = true;
          currentLanRef.current = loanData.lan;

          setPaymentState('SUCCESS');
          setTransactionDetails({
            transactionId: transactionData.transactionId,
            amount: amount,
          });
          showSuccessConfirmation(transactionData);
        } else {
          setPaymentState('FAILED');
          setTransactionDetails(null);
          setErrors({ general: 'Payment was not completed' });
        }
      } else {
        setPaymentState('FAILED');
        setTransactionDetails(null);
        setErrors({ general: 'Payment was not completed' });
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentState('FAILED');
      setTransactionDetails(null);
      setErrors({ general: 'Payment failed. Please try again.' });
    } finally {
      isProcessing.current = false;
      setIsSubmitting(false);
    }
  };

  const showSuccessConfirmation = transaction => {
    Alert.alert(
      'Payment Successful',
      `Transaction ID: ${transaction.transactionId}\nAmount: ${formatCurrency(
        amount,
      )}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setIsModalVisible(false);
            setTransactionDetails(null);
            setPaymentState('IDLE');
            loadPaymentDetails();
          },
        },
      ],
    );
  };

  const handleRetry = () => {
    if (paymentState === 'SUCCESS' || sessionPaidRef.current) {
      return;
    }
    if (isPaidFromDetails) {
      return;
    }
    setPaymentState('IDLE');
    setErrors({});
    setLastTransaction(null);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Loader visible={true} />
      </View>
    );
  }
  const closeModal = () => {
    const status = paymentState;
    setIsModalVisible(false);
    setTransactionDetails(null);
    setPaymentState('IDLE');
    if (status === 'SUCCESS') {
      loadPaymentDetails();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Payment Details</Text>

        {loanData?.customerName && (
          <View style={paymentStyles.customerInfo}>
            <Text style={paymentStyles.customerName}>
              {loanData.customerName}
            </Text>
            <Text style={paymentStyles.lanText}>LAN: {loanData.lan}</Text>
          </View>
        )}

        {emiList.length > 0 && (
          <View style={paymentStyles.emiCard}>
            <Text style={paymentStyles.cardTitle}>EMI Schedule</Text>
            {emiList.map(emi => {
              const isPaidStatus = emi.status === 'Paid';
              const dueAmount =
                emi.amount ||
                emi.emiAmount ||
                emi.remainingEmi ||
                emi.remainingAmount ||
                0;
              const displayAmount = isPaidStatus ? dueAmount : dueAmount;

              return (
                <View key={emi.id} style={paymentStyles.emiRow}>
                  <View style={paymentStyles.emiInfo}>
                    <Text style={paymentStyles.emiNumber}>
                      EMI #{emi.emiNumber || emi.id}
                    </Text>
                    <Text style={paymentStyles.emiDueDate}>
                      Due: {formatDate(emi.dueDate)}
                    </Text>
                    {!isPaidStatus && (
                      <Text style={paymentStyles.emiAmount}>
                        Due: {formatCurrency(dueAmount)}
                      </Text>
                    )}
                    {isPaidStatus && (
                      <Text
                        style={[
                          paymentStyles.emiAmount,
                          paymentStyles.emiAmountPaid,
                        ]}
                      >
                        Paid: {formatCurrency(dueAmount)}
                      </Text>
                    )}
                  </View>
                  <View style={paymentStyles.emiStatusContainer}>
                    <Text
                      style={[
                        paymentStyles.emiStatus,
                        isPaidStatus && paymentStyles.emiStatusPaid,
                        (emi.status === 'Due' || emi.status === 'Late') &&
                          paymentStyles.emiStatusDue,
                        emi.status === 'Part Paid' &&
                          paymentStyles.emiStatusPartPaid,
                      ]}
                    >
                      {emi.status}
                    </Text>
                    {!isPaidStatus && canCollect && (
                      <TouchableOpacity
                        style={paymentStyles.emiPayButton}
                        onPress={() => handlePaySingleEmi(emi)}
                        disabled={payingEmiId === emi.id}
                      >
                        <Text style={paymentStyles.emiPayButtonText}>
                          {payingEmiId === emi.id ? '...' : 'Pay'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <Loader visible={isSubmitting} />

      <PaymentModal
        isVisible={isModalVisible}
        paymentStatus={paymentState}
        onClose={closeModal}
        transactionDetails={transactionDetails}
      />
    </View>
  );
}

const paymentStyles = StyleSheet.create({
  customerInfo: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  lanText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
  },
  fieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#c8e6c9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  paidDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  errorCard: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: '#ff9800',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  auditInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  auditText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  emiCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  emiInfo: {
    flex: 1,
  },
  emiNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  emiDueDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  emiAmount: {
    fontSize: 12,
    color: '#1565c0',
    marginTop: 2,
  },
  emiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emiStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    color: '#666',
  },
  emiStatusPaid: {
    backgroundColor: '#c8e6c9',
    color: '#2e7d32',
  },
  emiStatusDue: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  emiStatusPartPaid: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  emiAmountPaid: {
    color: '#2e7d32',
  },
  emiPayButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  emiPayButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  paymentForm: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    padding: 16,
  },
  payButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
