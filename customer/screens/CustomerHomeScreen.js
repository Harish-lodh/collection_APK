import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  getCustomerLoanDetails,
  getUpcomingEmi,
} from '../services/customerApi';
import { lightGreenTheme } from '../utils/customerThemes';
import Loader from '../../components/loader';

export default function CustomerHomeScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const [loanData, setLoanData] = useState(null);
  const [upcomingEmi, setUpcomingEmi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      console.log(storedUser)
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const loanResult = await getCustomerLoanDetails();
      console.log('Loan details result:', loanResult);
      if (loanResult.success) {
        setLoanData(loanResult.data || null);
      }

      const emiResult = await getUpcomingEmi();
      if (emiResult.success) {
        setUpcomingEmi(emiResult.data);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePayEmi = () => {
    navigation.navigate('EMI Schedule');
  };

  const formatCurrency = amount => {
    return `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return <Loader visible />;
  }

  const uiTheme = lightGreenTheme;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          Welcome, {loanData?.customerName || user?.firstName || 'Customer'}!
        </Text>
        <Text style={styles.welcomeSubtext}>Your loan summary at a glance</Text>
      </View>

      {loanData && (
        <>
          <View style={styles.loanSummaryCard}>
            <Text style={styles.cardTitle}>Loan Summary</Text>
            <View style={styles.loanInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>LAN</Text>
                <Text style={styles.infoValue}>{loanData.lan || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Loan Amount</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(loanData.approvedLoanAmount)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>EMI Amount</Text>
                <Text style={styles.infoValue}>
                  {formatCurrency(loanData.emiAmount)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tenure</Text>
                <Text style={styles.infoValue}>
                  {loanData.tenure ? `${loanData.tenure} months` : 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {upcomingEmi && (
            <View style={styles.upcomingEmiCard}>
              <Text style={styles.cardTitle}>Upcoming EMI</Text>
              <View style={styles.emiDetails}>
                <View style={styles.emiRow}>
                  <Text style={styles.emiLabel}>Amount</Text>
                  <Text style={styles.emiValue}>
                    {formatCurrency(upcomingEmi.amount)}
                  </Text>
                </View>
                <View style={styles.emiRow}>
                  <Text style={styles.emiLabel}>Due Date</Text>
                  <Text style={styles.emiValue}>
                    {formatDate(upcomingEmi.dueDate)}
                  </Text>
                </View>
                <View style={styles.emiRow}>
                  <Text style={styles.emiLabel}>EMI No.</Text>
                  <Text style={styles.emiValue}>
                    {upcomingEmi.emiNumber || 'N/A'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.payButton} onPress={handlePayEmi}>
                <Text style={styles.payButtonText}>Pay EMI Now</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Payments')}
            >
              <Text style={styles.actionText}>Payment History</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!loanData && !loading && (
        <View style={styles.noDataCard}>
          <Text style={styles.noDataText}>
            No active loan found. Please contact support.
          </Text>
        </View>
      )}
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
  welcomeCard: {
    backgroundColor: uiTheme.primary,
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  welcomeSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  loanSummaryCard: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: uiTheme.textPrimary,
    marginBottom: 16,
  },
  loanInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: uiTheme.border,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textPrimary,
  },
  upcomingEmiCard: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emiDetails: {
    marginBottom: 20,
  },
  emiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: uiTheme.border,
  },
  emiLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textSecondary,
  },
  emiValue: {
    fontSize: 14,
    fontWeight: '500',
    color: uiTheme.textPrimary,
  },
  payButton: {
    backgroundColor: uiTheme.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickActions: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 20,
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: uiTheme.textPrimary,
    marginBottom: 16,
  },
  actionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: uiTheme.border,
  },
  actionText: {
    fontSize: 14,
    color: uiTheme.primary,
    fontWeight: '500',
  },
  noDataCard: {
    backgroundColor: uiTheme.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: uiTheme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  noDataText: {
    fontSize: 16,
    color: uiTheme.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
});
