import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { BACKEND_BASE_URL } from '@env';
import Button from '../components/Button';
import styles from '../utils/style';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import Loader from '../components/loader';
// Enhanced Table Component
const LoanDetailsTable = ({ userData }) => {
  if (!userData) return null;

  // Field labels mapping for better display
  const fieldLabels = {
    partnerLoanId: 'Partner Loan ID',
    lan: 'LAN',
    dpd: 'DPD',
    pos: 'POS',
    overdue: 'Overdue',
    customerName: 'Customer Name',
    mobileNumber: 'Mobile Number',
    panNumber: 'PAN Number',
    approvedLoanAmount: 'Approved Loan Amount',
    emiAmount: 'EMI Amount',
    address: 'Address',
    city: 'City',
    state: 'State',
  };

  // Format values for better display
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Format monetary values
    if (key === 'pos' || key === 'overdue' || key === 'approvedLoanAmount' || key === 'emiAmount') {
      return `₹${parseFloat(value).toFixed(2)}`;
    }
    
    // Format PAN number
    if (key === 'panNumber') {
      return String(value).toUpperCase();
    }
    
    return String(value);
  };

  // Group fields logically
  const fieldGroups = [
    {
      title: 'Loan Information',
      fields: ['partnerLoanId', 'lan', 'approvedLoanAmount', 'emiAmount']
    },
    {
      title: 'Payment Status',
      fields: ['DPD', 'POS', 'Overdue']
    },
    {
      title: 'Customer Details',
      fields: ['customerName', 'mobileNumber', 'panNumber']
    },
    {
      title: 'Address Information',
      fields: ['Address', 'City', 'State']
    }
  ];

  return (
    <View style={tableStyles.container}>
      <Text style={tableStyles.tableTitle}>Loan Details</Text>
      
      {fieldGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={tableStyles.section}>
          <Text style={tableStyles.sectionTitle}>{group.title}</Text>
          <View style={tableStyles.table}>
            {group.fields.map((field) => {
              if (userData.hasOwnProperty(field)) {
                return (
                  <View key={field} style={tableStyles.row}>
                    <View style={tableStyles.labelCell}>
                      <Text style={tableStyles.cellLabel}>
                        {fieldLabels[field] || field}
                      </Text>
                    </View>
                    <View style={tableStyles.valueCell}>
                      <Text style={tableStyles.cellValue}>
                        {formatValue(field, userData[field])}
                      </Text>
                    </View>
                  </View>
                );
              }
              return null;
            })}
          </View>
        </View>
      ))}

      {/* Show any additional fields not in the groups */}
      {Object.keys(userData).some(key => !fieldGroups.some(group => group.fields.includes(key))) && (
        <View style={tableStyles.section}>
          <Text style={tableStyles.sectionTitle}>Additional Information</Text>
          <View style={tableStyles.table}>
            {Object.entries(userData).map(([key, value]) => {
              // Skip if already shown in groups above
              if (fieldGroups.some(group => group.fields.includes(key))) {
                return null;
              }
              
              return (
                <View key={key} style={tableStyles.row}>
                  <View style={tableStyles.labelCell}>
                    <Text style={tableStyles.cellLabel}>
                      {fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)}
                    </Text>
                  </View>
                  <View style={tableStyles.valueCell}>
                    <Text style={tableStyles.cellValue}>
                      {formatValue(key, value)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

export default function LoanDetailsScreen() {
  const [searchType, setSearchType] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const searchOptions = [
    { label: 'Mobile Number', value: 'mobileNumber' },
    { label: 'PAN Number', value: 'panNumber' },
    { label: 'Partner LoanId', value: 'partnerLoanId' },
  ];

  const handleSearch = async () => {
    if (!searchType || !searchValue.trim()) {
      alert('Please select a search type and enter a value');
      return;
    }

    setIsLoading(true);
    setUserData(null);

    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/embifi/user-Details`, {
        params: {
          [searchType]: searchValue.trim(),
        },
      });

      console.log(response.data.data);

      if (response.data?.data?.length) {
        setUserData(response.data.data[0]);
      } else {
        alert('No data found');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        alert('No data found');
      } else {
        console.error('API error:', error);
        alert('Failed to fetch user data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

return (
  <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Loan Details Search</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Search By</Text>
        <Dropdown
          style={styles.dropdown}
          data={searchOptions}
          labelField="label"
          valueField="value"
          placeholder="Select search type"
          value={searchType}
          onChange={(item) => {
            setSearchType(item.value);
            setSearchValue('');
          }}
        />
      </View>

      {searchType && (
        <View style={styles.field}>
          <Text style={styles.label}>
            Enter {searchOptions.find(o => o.value === searchType)?.label}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${searchOptions.find(o => o.value === searchType)?.label}`}
            value={searchValue}
            onChangeText={setSearchValue}
            keyboardType={searchType === 'mobileNumber' ? 'number-pad' : 'default'}
            autoCapitalize={searchType === 'panNumber' ? 'characters' : 'none'}
          />
        </View>
      )}

      <Button label="Search" onPress={handleSearch} />

      <LoanDetailsTable userData={userData} />
    </ScrollView>

    {/* 👇 Overlay loader on top of everything */}
    <Loader visible={isLoading} />
  </View>
);

}

const tableStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#007bff',
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#e9ecef',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
  },
  table: {
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    minHeight: 40,
  },
  labelCell: {
    flex: 2,
    backgroundColor: '#f8f9fa',
    padding: 12,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  valueCell: {
    flex: 3,
    padding: 12,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  cellLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    textTransform: 'capitalize',
  },
  cellValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
  },
})