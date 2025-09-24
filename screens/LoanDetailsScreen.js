import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
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
      const num = Number(value);
      return Number.isFinite(num) ? `₹${num.toFixed(2)}` : String(value);
    }

    // Format PAN number
    if (key === 'panNumber') {
      return String(value).toUpperCase();
    }

    return String(value);
  };

  // Group fields logically (use actual data keys - lowercase/camelCase)
  const fieldGroups = [
    {
      title: 'Loan Information',
      fields: ['partnerLoanId', 'lan', 'approvedLoanAmount', 'emiAmount'],
    },
    {
      title: 'Payment Status',
      fields: ['dpd', 'pos', 'overdue'],
    },
    {
      title: 'Customer Details',
      fields: ['customerName', 'mobileNumber', 'panNumber'],
    },
    {
      title: 'Address Information',
      fields: ['address', 'city', 'state'],
    },
  ];

  // Helper to render rows
  const renderRow = (key) => {
    // protect against nested objects
    const value = userData?.[key];
    return (
      <View key={key} style={tableStyles.row}>
        <View style={tableStyles.labelCell}>
          <Text style={tableStyles.cellLabel}>{fieldLabels[key] || (key.charAt(0).toUpperCase() + key.slice(1))}</Text>
        </View>
        <View style={tableStyles.valueCell}>
          <Text style={tableStyles.cellValue}>{formatValue(key, value)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={tableStyles.container}>
      <Text style={tableStyles.tableTitle}>Loan Details</Text>

      {fieldGroups.map((group, groupIndex) => (
        <View key={groupIndex} style={tableStyles.section}>
          <Text style={tableStyles.sectionTitle}>{group.title}</Text>
          <View style={tableStyles.table}>
            {group.fields.map((field) => userData && userData.hasOwnProperty(field) ? renderRow(field) : null)}
          </View>
        </View>
      ))}

      {/* Additional fields not in groups */}
      {Object.keys(userData).some((key) => !fieldGroups.some((g) => g.fields.includes(key))) && (
        <View style={tableStyles.section}>
          <Text style={tableStyles.sectionTitle}>Additional Information</Text>
          <View style={tableStyles.table}>
            {Object.entries(userData).map(([key]) => {
              if (fieldGroups.some((g) => g.fields.includes(key))) return null;
              return renderRow(key);
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

  // New states for multiple results
  const [searchResults, setSearchResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const searchOptions = [
    { label: 'Customer Name', value: 'customerName' },
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
    setSearchResults([]);
    setModalVisible(false);

    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/embifi/user-Details`, {
        params: {
          [searchType]: searchValue.trim(),
        },
      });

      const data = response.data?.data ?? [];

      if (data.length === 0) {
        alert('No data found');
      } else if (data.length === 1) {
        // Single match -> auto-select
        setUserData(data[0]);
      } else {
        // Multiple matches -> let user choose
        setSearchResults(data);
        setModalVisible(true);
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

  const selectResult = (item) => {
    setUserData(item);
    setModalVisible(false);
    setSearchResults([]);
  };

  const renderResultRow = ({ item }) => (
    <TouchableOpacity
      style={resultStyles.row}
      onPress={() => selectResult(item)}
    >
      <View style={{ flex: 1 }}>
        <Text style={resultStyles.name}>
          {item.customerName || item.name || 'Unknown name'}
        </Text>
        <Text style={resultStyles.sub}>
          {item.mobileNumber || item.mobile || 'No mobile'} • {item.lan ? `LAN: ${item.lan}` : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
              setUserData(null);
            }}
          />
        </View>

        {searchType && (
          <View style={styles.field}>
            <Text style={styles.label}>
              Enter {searchOptions.find((o) => o.value === searchType)?.label}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter ${searchOptions.find((o) => o.value === searchType)?.label}`}
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

      {/* Overlay loader */}
      <Loader visible={isLoading} />

      {/* Selection Modal for multiple results */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={resultStyles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={resultStyles.modalContainer}>
            <Text style={resultStyles.modalTitle}>Multiple matches found — select one</Text>

            <FlatList
              data={searchResults}
              keyExtractor={(item, idx) => (item.lan || item.partnerLoanId || item.mobileNumber || String(idx))}
              renderItem={renderResultRow}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
              style={{ maxHeight: 340 }}
            />

            <TouchableOpacity style={resultStyles.cancelBtn} onPress={() => setModalVisible(false)}>
              <Text style={resultStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
});

const resultStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontWeight: '700',
    fontSize: 16,
    paddingVertical: 10,
    textAlign: 'center',
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  sub: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  cancelBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#007bff',
    fontWeight: '600',
  },
});
