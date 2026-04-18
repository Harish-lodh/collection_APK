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
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../components/loader';
import PaymentModal from '../components/PaymentModal';
import apiClient from '../server/apiClient';
import EmiSchedule from '../components/EmiSchedule';
import {
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

    setIsLoading(false); // EMI load handled by component
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

        <EmiSchedule
          lan={loanData?.lan}
          product={loanData?.product}
          isRM={true}
          title="EMI Schedule"
          styleOverrides={{
            container: { flexGrow: 1 },
            list: { paddingBottom: 100 }, // Space for payment form
            card: [paymentStyles.emiRow || styles.emiCard], // Use RM styles if avail
          }}
        />
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
