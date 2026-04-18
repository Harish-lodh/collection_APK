import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { lightGreenTheme } from '../utils/customerThemes';
import { getCustomerPaymentHistory } from '../services/customerApi';
import Loader from '../../components/loader';

export default function CustomerPaymentHistoryScreen() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPaymentHistory();
  }, []);

  const loadPaymentHistory = async () => {
    try {
      const result = await getCustomerPaymentHistory();
      if (result.success) {
        const sortedPayments = [...result.data].sort((a, b) => 
          new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt)
        );
        setPayments(sortedPayments);
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPaymentHistory();
    setRefreshing(false);
  };

  const formatCurrency = amount => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusStyle = status => {
    switch (status) {
      case 'Paid':
      case 'APPROVED':
        return styles.statusApproved;
      case 'PENDING':
        return styles.statusPending;
      default:
        return styles.statusDefault;
    }
  };

  const renderPaymentItem = ({ item }) => {
    const emiAmount = Number(item.emiAmount || 0);
    const displayDate = item.paymentDate;
    const status = item.status || 'Unknown';
    const statusStyle = getStatusStyle(status);

    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <Text style={styles.paymentDate}>
            {formatDate(displayDate)}
          </Text>
          <Text style={[styles.statusBadge, statusStyle]}>
            {status}
          </Text>
        </View>
        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>EMI Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(emiAmount)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <Loader visible />;
  }

  const uiTheme = lightGreenTheme;

  return (
    <View style={styles.container}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderPaymentItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No payment history available</Text>
          </View>
        }
      />
    </View>
  );
}

const uiTheme = lightGreenTheme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiTheme.bg,
  },
  listContent: {
    padding: 20,
  },
  paymentCard: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiTheme.border,
  },
  paymentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: uiTheme.textPrimary,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusApproved: {
    backgroundColor: `${uiTheme.success}20`,
    color: uiTheme.success,
  },
  statusPending: {
    backgroundColor: `${uiTheme.warning}20`,
    color: uiTheme.warning,
  },
  statusDefault: {
    backgroundColor: `${uiTheme.textSecondary}20`,
    color: uiTheme.textSecondary,
  },
  paymentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textSecondary,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '600',
    color: uiTheme.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: uiTheme.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
  },
});
