import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCustomerProfile } from '../services/customerApi';
import { darkBlueTheme } from '../utils/customerThemes';
import Loader from '../../components/loader';

export default function CustomerProfileScreen({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('CustomerProfileScreen mounted');
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Calling getCustomerProfile...');
      const result = await getCustomerProfile();
      console.log('Profile API result:', result);
      if (result?.success) {
        setProfile(result.data);
        console.log('Profile data set:', result.data);
      } else {
        console.log('Profile API failed:', result);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            if (onLogout) {
              onLogout();
            }
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
      },
    ]);
  };

  const formatDate = date => {
    if (!date) return 'N/A';
    const datePart = date.split('T')[0];
    const [year, month, day] = datePart.split('-').map(Number);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${day} ${monthNames[month - 1]} ${year}`;
  };

  const getMaskedAadhaar = aadhaar => {
    if (!aadhaar) return 'N/A';
    const str = String(aadhaar);
    if (str.length <= 4) return str;
    return '*'.repeat(str.length - 4) + str.slice(-4);
  };

  console.log('Profile state:', profile);
  if (loading) {
    return <Loader visible />;
  }
  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          No profile data available. Check logs.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(profile?.fullName || 'C').charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.fullName || 'Customer'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profile?.fullName || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Aadhaar</Text>
            <Text style={styles.value}>
              {getMaskedAadhaar(profile?.aadhaar)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PAN Card</Text>
            <Text style={styles.value}>{profile?.panCard || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{formatDate(profile?.dateOfBirth)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Address Information</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Full Address</Text>
            <Text style={styles.value} numberOfLines={3}>
              {profile?.address || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Loan Details</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>LAN</Text>
            <Text style={styles.value}>{profile?.lan || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Partner Loan ID</Text>
            <Text style={styles.value}>{profile?.partnerLoanId || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Loan Amount</Text>
            <Text style={styles.value}>
              ₹{Number(profile?.loanAmount || 0).toLocaleString()}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>EMI Amount</Text>
            <Text style={styles.value}>
              ₹
              {parseFloat(profile?.emiAmount || 0).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tenure</Text>
            <Text style={styles.value}>{profile?.tenure || 'N/A'} months</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    profile?.status === 'Disbursed' ? darkBlueTheme.success : darkBlueTheme.warning,
                },
              ]}
            >
              {profile?.status || 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{profile?.accountNumber || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>IFSC</Text>
            <Text style={styles.value}>{profile?.ifsc || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const uiTheme = darkBlueTheme;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: uiTheme.bg,
  },
  content: {
    padding: 20,
  },
  headerCard: {
    backgroundColor: uiTheme.primary,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: uiTheme.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    flex: 1,
    textAlign: 'right',
  },
  statusValue: {
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: uiTheme.error,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: uiTheme.textSecondary,
    marginTop: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: uiTheme.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
