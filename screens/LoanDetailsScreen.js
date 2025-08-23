import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import Button from '../components/Button';

export default function LoanDetailsScreen() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      alert("Please enter Loan ID or Customer Name");
      return;
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
});
