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
import isLoanId from '../components/function';

export default function LoanDetailsScreen() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleSearch = async () => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      alert('Please enter Loan ID or Customer Name');
      return;
    }

    setIsLoading(true);
    setUserData(null);

    const isLoan = isLoanId(trimmedSearch);

    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/user-data`, {
        params: isLoan
          ? { loanId: trimmedSearch }
          : { customerName: trimmedSearch },
      });

      if (response.data?.data?.length) {
        setUserData(response.data.data[0]);
      } else {
        alert('No data found');
      }
    } catch (error) {
      console.error('API error:', error);
      alert('Failed to fetch user data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Loan Details</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Search Loan</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Loan ID / Customer Name"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

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
