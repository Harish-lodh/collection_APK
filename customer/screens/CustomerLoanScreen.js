import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { getCustomerLoanDetails } from '../services/customerApi';
import { lightGreenTheme } from '../utils/customerThemes';
import Loader from '../../components/loader';

export default function CustomerLoanScreen() {
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadLoanData();
  }, []);

  const loadLoanData = async () => {
    try {
      const result = await getCustomerLoanDetails();
      if (result.success) {
        setLoanData(result.data);
      }
    } catch (error) {
      console.error('Error loading loan details:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLoanData();
    setRefreshing(false);
  };

  const formatCurrency = amount => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader visible />;
  }

  const uiTheme = lightGreenTheme;

  if (!loanData) {
    return (
      <View style={styles.container}>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No loan details available</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Information</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Loan Amount</Text>
            <Text style={styles.value}>
              {formatCurrency(loanData.approvedLoanAmount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EMI Amount</Text>
            <Text style={styles.value}>
              {formatCurrency(loanData.emiAmount)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tenure</Text>
            <Text style={styles.value}>{loanData.tenure || 'N/A'} months</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Status</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>POS (Outstanding)</Text>
            <Text style={styles.value}>{formatCurrency(loanData.pos)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Overdue Amount</Text>
            <Text
              style={[
                styles.value,
                loanData.overdue > 0 && styles.overdueValue,
              ]}
            >
              {formatCurrency(loanData.overdue)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>DPD (Days Past Due)</Text>
            <Text
              style={[styles.value, loanData.dpd > 0 && styles.overdueValue]}
            >
              {loanData.dpd || 0} days
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Details</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Product</Text>
            <Text style={styles.value}>
              {loanData.product || loanData.productType || 'N/A'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Loan Status</Text>
            <Text style={[styles.value, styles.statusValue]}>
              {loanData.status || 'Active'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const uiTheme = lightGreenTheme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiTheme.bg,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: uiTheme.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: uiTheme.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    color: uiTheme.textPrimary,
  },
  overdueValue: {
    color: uiTheme.error,
  },
  statusValue: {
    color: uiTheme.success,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: uiTheme.textSecondary,
    fontWeight: '400',
  },
});
