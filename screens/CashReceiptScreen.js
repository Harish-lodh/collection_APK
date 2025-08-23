import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  Image,
} from 'react-native';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { getAuthToken } from '../components/authToken';
export default function CashReceiptScreen() {
  const [customerName, setCustomerName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loanId, setLoanId] = useState('');

  const [paymentDate, setPaymentDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedValue, setSelectedValue] = useState(null); // for payment mode
  const [paymentRef, setPaymentRef] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [amount, setAmount] = useState('');
  const [amountInWords, setAmountInWords] = useState('');

  const [errors, setErrors] = useState({
    customerName: '',
    vehicleNumber: '',
    contactNumber: '',
    loanId: '',
    paymentDate: '',
    amount: '',
  });

  // Options for payment mode
  const data = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'UPI', value: 'UPI' },
  ];

  const formatDate = (d) => {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (_e, selected) => {
    setShowDatePicker(false);
    if (selected) setPaymentDate(selected);
  };

const handleSave = async () => {
  try {
    const formatDateForSQL = (d) => {
      if (!d) return null;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${year}-${month}-${day}`;
    };

    const payload = {
      loanId: loanId || null,
      customerName: customerName || null,
      vehicleNumber: vehicleNumber || null,
      contactNumber: contactNumber || null,
      paymentDate: formatDateForSQL(paymentDate),
      paymentMode: selectedValue || null,
      paymentRef: paymentRef || null,
      collectedBy: collectedBy || null,
      amount: amount ? Number(amount) : null,
      amountInWords: amountInWords || null,
    };

    const base = "http://10.0.2.2:3000";
    const token = await getAuthToken();
    console.log("Token retrieved:", token);

    const res = await axios.post(
      `${base}/save-loan`,
      payload,
      {
        timeout: 10000,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    Alert.alert('Success', 'Loan details saved successfully!');
  } catch (error) {
    console.error("Save Error:", error);
    if (error.response) {
      Alert.alert('API Error', `${error.response.status}: ${error.response.data?.message || 'Server error'}`);
    } else if (error.request) {
      Alert.alert('Network Error', 'No response from server. Check base URL / network.');
    } else {
      Alert.alert('Error', 'Unexpected error occurred.');
    }
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Customer Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Customer Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Customer Name"
          value={customerName}
          onChangeText={setCustomerName}
        />
        {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
      </View>

      {/* Vehicle Number */}
      <View style={styles.field}>
        <Text style={styles.label}>Vehicle Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
        />
        {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
      </View>

      {/* Contact Number */}
      <View style={styles.field}>
        <Text style={styles.label}>Customer Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Contact Number"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={setContactNumber}
        />
        {errors.contactNumber ? <Text style={styles.errorText}>{errors.contactNumber}</Text> : null}
      </View>

      {/* Loan ID */}
      <View style={styles.field}>
        <Text style={styles.label}>Loan ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Loan ID"
          value={loanId}
          onChangeText={setLoanId}
        />
        {errors.loanId ? <Text style={styles.errorText}>{errors.loanId}</Text> : null}
      </View>

      {/* Payment Date */}
      <View style={styles.field}>
        <Text style={styles.label}>Payment Date *</Text>
        <Pressable style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
          <Text style={[styles.valueText, !paymentDate && styles.placeholder]}>
            {paymentDate ? formatDate(paymentDate) : 'Select date'}
          </Text>
        </Pressable>
        {errors.paymentDate ? <Text style={styles.errorText}>{errors.paymentDate}</Text> : null}
        {showDatePicker && (
          <DateTimePicker
            value={paymentDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Payment Mode */}
      <View style={{ zIndex: 1000, elevation: 3, marginBottom: 12 }}>
        <Text style={styles.label}>Payment Mode *</Text>
        <Dropdown
          style={styles.dropdown}
          containerStyle={{ borderRadius: 8 }}
          placeholderStyle={{ color: '#888' }}
          selectedTextStyle={{ color: '#000' }}
          data={data}
          labelField="label"
          valueField="value"
          placeholder="Select an option"
          value={selectedValue}
          onChange={item => setSelectedValue(item.value)}
        />
        {selectedValue && <Text style={{ marginTop: 4 }}>Selected: {selectedValue}</Text>}
      </View>

      {/* Ref No */}
      <View style={styles.field}>
        <Text style={styles.label}>Cash/Cheque/UPI Ref. No.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Reference Number"
          value={paymentRef}
          onChangeText={setPaymentRef}
        />
      </View>

      {/* Collected By */}
      <View style={styles.field}>
        <Text style={styles.label}>Payment Collected By</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter RM Name"
          value={collectedBy}
          onChangeText={setCollectedBy}
        />
      </View>

      {/* Amount */}
      <View style={styles.field}>
        <Text style={styles.label}>Amount (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
      </View>

      {/* Amount in Words */}
      <View style={styles.field}>
        <Text style={styles.label}>Amount in Words</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount in Words"
          value={amountInWords}
          onChangeText={setAmountInWords}
        />
      </View>

       <View style={styles.container}>
      <Text style={styles.title}>Scan to Pay</Text>

      <View style={styles.qrContainer}>
        <Image
          source={require("../assets/images/Scanner.png")} // 👈 make sure file exists
          style={styles.qrImage}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.note}>Use any UPI app to scan this QR</Text>
    </View>

      <Button label="Save Loan" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
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
  inputRow: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  valueText: { fontSize: 16, color: '#111' },
  placeholder: { color: '#888' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  helper: { color: '#666', marginTop: 12 },
  dropdown: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },

   qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  note: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },   
});
