import React, { useState, useEffect, useRef } from 'react';
import styles, { paymentStyles } from '../utils/style';
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
import PaymentModal from '../components/PaymentModal';
import apiClient from '../server/apiClient';
import {
  getEmiSchedule,
  initiatePayment,
  verifyPayment,
  PaymentStatus,
} from '../services/paymentService';
import { formatCurrency, formatDate } from '../utils/paymentHelpers';

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
  const shouldCancelPollingRef = useRef(false);

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
    shouldCancelPollingRef.current = false;
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
          if (shouldCancelPollingRef.current) {
            setPaymentState('IDLE');
            break;
          }
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
    shouldCancelPollingRef.current = false;
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

      if (shouldCancelPollingRef.current) {
        isProcessing.current = false;
        setIsSubmitting(false);
        return;
      }

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
    shouldCancelPollingRef.current = true;
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
