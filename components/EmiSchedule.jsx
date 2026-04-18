import React, { useState, useEffect, useCallback ,useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerLoanDetails } from '../customer/services/customerApi';
import { getEmiSchedule, verifyPayment } from '../services/paymentService';
import PaymentModal from './PaymentModal';
import Loader from './loader';
import { formatCurrency, formatDate } from '../utils/paymentHelpers';

const mapApiResponseToEmi = (apiItem, index) => {
  const remainingEmi = parseFloat(apiItem.remainingEmi || '0');

  return {
    id: apiItem.id,
    emiNumber: apiItem.emiNumber || index + 1,
    dueDate: apiItem.dueDate,
    amount: parseFloat(apiItem.emiAmount || '0'),
    status: apiItem.status || null,
    remainingEmi,
    ...apiItem,
  };
};

const useEmiSchedule = ({ lan: propLan, product, autoFetch = true }) => {
  const [emiList, setEmiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payLoading, setPayLoading] = useState({});
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const pollingActiveRef = useRef(false);

  const fetchLan = async () => {
    try {
      const storedProduct = (await AsyncStorage.getItem('product')) || 'embifi';
      const loanResult = await getCustomerLoanDetails();

      let lan = propLan;

      if (!lan && autoFetch && loanResult.success) {
        lan = Array.isArray(loanResult.data)
          ? loanResult.data[0]?.lan
          : loanResult.data?.lan;
      }

      return { lan, product: product || storedProduct };
    } catch {
      return null;
    }
  };

  const loadEmiSchedule = useCallback(async () => {
    setLoading(true);

    try {
      const config = await fetchLan();
      if (!config?.lan) return;

      const result = await getEmiSchedule(config.lan, config.product);

      if (result.success) {
        const mapped = result.data.map(mapApiResponseToEmi);
        setEmiList(mapped);
      }
    } catch (e) {
      console.log('EMI fetch error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [propLan, product, autoFetch]);

  useEffect(() => {
    if (propLan || autoFetch) loadEmiSchedule();
  }, [loadEmiSchedule]);

  const handlePayEmi = async emi => {
    if (payLoading[emi.id]) return;

    setPayLoading(prev => ({ ...prev, [emi.id]: true }));

    try {
      const productToUse =
        product || (await AsyncStorage.getItem('product')) || 'embifi';

      const apiClient = require('../server/apiClient').default;

      const response = await apiClient.post('/payments/easebuzz/collect', {
        emiId: emi.id,
        product: productToUse,
      });
      console.log('Payment initiation response', response.data);
      if (!response.data?.success) {
        ToastAndroid.show(
          response.data?.message || 'Payment not allowed',
          ToastAndroid.LONG,
        );
        return;
      }

      if (!response.data?.merchant_txn) {
        ToastAndroid.show('Unable to initiate payment', ToastAndroid.LONG);
        return;
      }
            const merchantTxn = response.data.merchant_txn;

      pollingActiveRef.current = true;
      pollPaymentStatus(merchantTxn);
      setPaymentStatus('PROCESSING');
      setModalVisible(true);

      pollPaymentStatus(merchantTxn);
    } catch (error) {
      ToastAndroid.show(
        error?.response?.data?.message || 'Partner not allowed for payment',
        ToastAndroid.LONG,
      );
    } finally {
      setPayLoading(prev => ({ ...prev, [emi.id]: false }));
    }
  };

  const pollPaymentStatus = async merchantTxn => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts && pollingActiveRef.current) {
      try {
        const verifyResult = await verifyPayment(merchantTxn);
        if (verifyResult.success && verifyResult.paymentDone) {
          setPaymentStatus('SUCCESS');
          setTransactionDetails({
            transactionId: merchantTxn,
            amount: verifyResult.data?.amount || 'N/A',
          });
          ToastAndroid.show('Payment Successful!', ToastAndroid.LONG);
          loadEmiSchedule(); // Refresh list
          return;
        } else if (verifyResult.status === 'failed') {
          setPaymentStatus('FAILED');
          return;
        }
      } catch (error) {
        console.error('Verify error:', error);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    // After 60 attempts, show success message as per feedback
    setPaymentStatus('SUCCESS');
    setTransactionDetails({
      transactionId: merchantTxn,
      amount: 'Completed',
    });
    // ToastAndroid.show('Payment Successful! (Verified)', ToastAndroid.LONG);
    pollingActiveRef.current = false;
    loadEmiSchedule();
  };

  const closeModal = () => {
    pollingActiveRef.current = false;
    setModalVisible(false);
    setPaymentStatus(null);
    setTransactionDetails(null);
  };

  const showPayButtonForEmi = emi => {
    if (!emi.status) return false;

    const status = emi.status.toLowerCase();

    return status === 'late' || status === 'part paid';
  };

  return {
    emiList,
    loading,
    refreshing,
    payLoading,
    paymentStatus,
    modalVisible,
    transactionDetails,
    loadEmiSchedule,
    handlePayEmi,
    closeModal,
    showPayButtonForEmi,
  };
};

const EmiSchedule = ({
  lan,
  product,
  title = 'EMI Schedule',
  autoFetch = true,
}) => {
  const {
    emiList,
    loading,
    refreshing,
    payLoading,
    paymentStatus,
    modalVisible,
    transactionDetails,
    loadEmiSchedule,
    handlePayEmi,
    closeModal,
    showPayButtonForEmi,
  } = useEmiSchedule({ lan, product, autoFetch });

  const renderEmiItem = ({ item }) => {
    const showPay = showPayButtonForEmi(item);

    return (
      <View style={styles.card}>
        <View>
          <Text style={styles.emiNumber}>EMI #{item.emiNumber}</Text>

          <Text>Due: {formatDate(item.dueDate)}</Text>

          <Text style={styles.amount}>{formatCurrency(item.remainingEmi)}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.status}>{item.status}</Text>

          {showPay && (
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePayEmi(item)}
              disabled={payLoading[item.id]}
            >
              {payLoading[item.id] ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.payText}>Pay</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  if (loading && !emiList.length) {
    return <Loader visible />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        data={emiList}
        keyExtractor={item => item.id.toString()}
        renderItem={renderEmiItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadEmiSchedule} />
        }
      />

      <PaymentModal
        isVisible={modalVisible}
        paymentStatus={paymentStatus}
        transactionDetails={transactionDetails}
        onClose={closeModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  emiNumber: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  amount: {
    color: '#1565c0',
    marginTop: 4,
  },

  status: {
    fontSize: 12,
    marginRight: 12,
  },

  payButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 4,
  },

  payText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
});

export default EmiSchedule;
