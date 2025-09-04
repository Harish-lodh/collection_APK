import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { BACKEND_BASE_URL } from '@env';
import Button from '../components/Button';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';

export default function LoanDetailsScreen() {
  const [searchType, setSearchType] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const searchOptions = [
      { label: 'Mobile Number', value: 'mobileNumber' },
    { label: 'PAN Number', value: 'panNumber' },
    //  { label: 'Customer Name', value: 'customerName' },
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
          <Text style={styles.label}>Enter {searchOptions.find(o => o.value === searchType)?.label}</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${searchOptions.find(o => o.value === searchType)?.label}`}
            value={searchValue}
            onChangeText={setSearchValue}
            keyboardType={
              searchType === 'mobileNumber' ? 'number-pad' : 'default'
            }
            autoCapitalize={searchType === 'panNumber' ? 'characters' : 'none'}
          />
        </View>
      )}

      <Button label="Search" onPress={handleSearch} />

      {isLoading && (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      )}

      {userData && (
        <View style={styles.table}>
          {Object.entries(userData).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.cellLabel}>{key}</Text>
              <Text style={styles.cellValue}>{String(value)}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  field: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  table: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  cellLabel: {
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cellValue: {
    textAlign: 'right',
    color: '#555',
    flex: 1,
  },
});
