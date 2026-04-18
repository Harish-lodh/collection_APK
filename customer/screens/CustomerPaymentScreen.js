import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initiateCustomerPayment,
  verifyCustomerPayment,
} from '../services/customerApi';
import Loader from '../../components/loader';
import PaymentModal from '../../components/PaymentModal';

export default function CustomerPaymentScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const loanData = route.params?.loanData || {};
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [merchantTxn, setMerchantTxn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [amount, setAmount] = useState(
    String(loanData.amount || loanData.emiAmount || ''),
  );

  const defaultAmount = loanData.amount || loanData.emiAmount || 0;

  const formatCurrency = amt => {
    return `₹${Number(amt || 0).toFixed(2)}`;
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePayment = async () => {
    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    setIsModalVisible(true);
    setPaymentStatus('PROCESSING');
    try {
      const result = await initiateCustomerPayment({
        lan: loanData.lan,
        amount: payAmount,
      });

      if (result.success && result.data?.paymentUrl) {
        setMerchantTxn(result.data?.txnId);
        Linking.openURL(result.data.paymentUrl);
        setPaymentStatus('PROCESSING');
        checkPaymentStatus(result.data.txnId);
      } else if (result.success && result.data?.txnId) {
        setPaymentStatus('PROCESSING');
        setMerchantTxn(result.data.txnId);
        checkPaymentStatus(result.data.txnId);
      } else {
        setPaymentStatus('FAILED');
        setTransactionDetails(null);
        Alert.alert('Error', result.error || 'Payment initiation failed');
      }
    } catch (error) {
      setPaymentStatus('FAILED');
      setTransactionDetails(null);
      Alert.alert('Error', 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async txnId => {
    if (!txnId) {
      setPaymentStatus('FAILED');
      return;
    }

    setVerifying(true);
    try {
      const result = await verifyCustomerPayment(txnId);
      if (result.paymentDone) {
        setPaymentStatus('SUCCESS');
        setTransactionDetails({
          transactionId: txnId,
          amount: amount,
        });
      } else if (
        result.status === 'pending' ||
        result.status === 'processing'
      ) {
        setTimeout(() => checkPaymentStatus(txnId), 3000);
      } else {
        setPaymentStatus('FAILED');
        setTransactionDetails(null);
      }
    } catch (error) {
      setPaymentStatus('FAILED');
      setTransactionDetails(null);
    } finally {
      setVerifying(false);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setTransactionDetails(null);
    setPaymentStatus(null);
    if (paymentStatus === 'SUCCESS') {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Loader visible={loading || verifying} />

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Payment Details</Text>

        <View style={styles.row}>
          <Text style={styles.label}>LAN</Text>
          <Text style={styles.value}>{loanData.lan || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>EMI Number</Text>
          <Text style={styles.value}>
            #{loanData.emiNumber || loanData.emiId || 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Due Date</Text>
          <Text style={styles.value}>{formatDate(loanData.dueDate)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>EMI Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(defaultAmount)}</Text>
        </View>

        <View style={styles.amountInputRow}>
          <Text style={styles.label}>Enter Amount</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="Enter amount to pay"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Payment Information</Text>
        <Text style={styles.infoText}>
          You will be redirected to a secure payment gateway to complete your
          EMI payment.
        </Text>
        <Text style={styles.infoText}>
          After successful payment, your receipt will be available in the
          Payment History section.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.payButton, loading && styles.payButtonDisabled]}
        onPress={handlePayment}
        disabled={loading || verifying}
      >
        {loading || verifying ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payButtonText}>
            Pay {formatCurrency(amount)}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>

      <PaymentModal
        isVisible={isModalVisible}
        paymentStatus={paymentStatus}
        onClose={closeModal}
        transactionDetails={transactionDetails}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
  },
  amountInputRow: {
    marginTop: 16,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  successCard: {
    backgroundColor: '#c8e6c9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  successText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  errorCard: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c62828',
  },
  payButton: {
    backgroundColor: '#4caf50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#a5d6a7',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
  },
});
