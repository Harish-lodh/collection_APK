

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';

import debounce from 'lodash.debounce';

import { selectFromGallery } from '../utils/index.js'
import { captureFromCamera } from '../utils/index.js'
import { getCurrentLocation } from '../components/function.js'
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { getAuthToken } from '../components/authToken';
import { BACKEND_BASE_URL } from '@env';
import { fetchAutoData } from '../utils/autofetch.js'
// import * as ImagePicker from 'expo-image-picker';

export default function CashReceiptScreen() {
  const [location, setLocation] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [panNumber, setPanNumber] = useState('');

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [loanId, setLoanId] = useState('');
  const [paymentDate, setPaymentDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [paymentRef, setPaymentRef] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [amount, setAmount] = useState('');
  const [amountInWords, setAmountInWords] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    panNumber: '',
    customerName: '',
    vehicleNumber: '',
    contactNumber: '',
    loanId: '',
    paymentDate: '',
    amount: '',
    amountInWords: '',
  });

  const data = [
    { label: 'Cash', value: 'Cash' },
    { label: 'Cheque', value: 'Cheque' },
    { label: 'UPI', value: 'UPI' },
  ];

  const formatDate = (d) => {
    if (!d) return '';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDateChange = (_e, selected) => {
    setShowDatePicker(false);
    if (selected) {
      setPaymentDate(selected);
      setErrors(prev => ({ ...prev, paymentDate: '' }));
    }
  };
  const [image, setImage] = useState(null);

  const onSelectFromGallery = async () => {
    const asset = await selectFromGallery();
    console.log(asset) // should return { uri, fileName, type, ... }
    if (asset) setImage(asset);
  };

  const onCaptureFromCamera = async () => {
    const asset = await captureFromCamera();
    if (asset) setImage(asset);
  };
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      panNumber: '',
      customerName: '',
      vehicleNumber: '',
      contactNumber: '',
      loanId: '',
      paymentDate: '',
      amount: '',

    };
    if (!panNumber.trim()) {
      newErrors.panNumber = 'PanNumber is required'
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
      isValid = false;
    }
    if (!vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle Number is required';
      isValid = false;
    }
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact Number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(contactNumber)) {
      newErrors.contactNumber = 'Enter a valid 10-digit phone number';
      isValid = false;
    }
    if (!loanId.trim()) {
      newErrors.loanId = 'Loan ID is required';
      isValid = false;
    }
    if (!paymentDate) {
      newErrors.paymentDate = 'Payment Date is required';
      isValid = false;
    }
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
      isValid = false;
    } else if (isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };
  const debouncedFetch = debounce((key, value, setters) => {
    if (value && value.length >= 10) {
      fetchAutoData(key, value, setters);
    }
  }, 500);


  const handleSave = async () => {
    if (!validateForm()) return;
    console.log('entered api')
    setIsLoading(true);

    try {

      const locationCoords = await getCurrentLocation();
      if (!locationCoords) {
        setIsLoading(false);
        return;
      }
      const formatDateForSQL = (d) => {
        if (!d) return null;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const form = new FormData();
      form.append('loanId', loanId);
      form.append('customerName', customerName);
      form.append('vehicleNumber', vehicleNumber);
      form.append('contactNumber', contactNumber);
      form.append('panNumber', panNumber);
      form.append('paymentDate', formatDateForSQL(paymentDate));
      if (selectedValue) form.append('paymentMode', selectedValue);
      if (paymentRef) form.append('paymentRef', paymentRef);
      if (collectedBy) form.append('collectedBy', collectedBy);
      form.append('amount', String(amount)); // numbers must be strings in multipart
      if (amountInWords) form.append('amountInWords', amountInWords);
      form.append('latitude', String(locationCoords.latitude));
      form.append('longitude', String(locationCoords.longitude));

      if (image?.uri) {
        form.append('image', {
          uri: image.uri,
          name: image.fileName || `receipt_${Date.now()}.jpg`,
          type: image.type || 'image/jpeg',
        });
      }

      console.log(form);
      const token = await getAuthToken();
      console.log(BACKEND_BASE_URL)
      const res = await axios.post(
        `${BACKEND_BASE_URL}/loanDetails/save-loan`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert('Success', 'Loan details saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setPanNumber('');
            setCustomerName('');
            setVehicleNumber('');
            setContactNumber('');
            setLoanId('');
            setPaymentDate(null);
            setSelectedValue(null);
            setPaymentRef('');
            setCollectedBy('');
            setAmount('');
            setAmountInWords('');
            setImage(null)
            setErrors({
              panNumber: '',
              customerName: '',
              vehicleNumber: '',
              contactNumber: '',
              loanId: '',
              paymentDate: '',
              amount: '',
              amountInWords: '',
            });
          }
        }
      ]);

    } catch (error) {
      console.error("Save Error:", error);
      if (error.response) {
        Alert.alert('API Error', `${error.response.status}: ${error.response.data?.message || 'Server error'}`);
      } else if (error.request) {
        Alert.alert('Network Error', 'No response from server. Check base URL / network.');
      } else {
        Alert.alert('Error', 'Unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.field}>
        <Text style={styles.label}>Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Contact Number"
          keyboardType="phone-pad"
          value={contactNumber}
          onChangeText={(text) => {
            setContactNumber(text);
            if (text.length === 10) {
              debouncedFetch('phoneNumber', text, {
                setCustomerName,
                setLoanId,
                setContactNumber,
                setPanNumber
              });
            }
            setErrors(prev => ({ ...prev, contactNumber: '' }));
          }}
        />
        {errors.contactNumber ? <Text style={styles.errorText}>{errors.contactNumber}</Text> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Pan Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Pan Number"
          value={panNumber}
          onChangeText={(text) => {
            setPanNumber(text);
            if (text.length === 10) {
              debouncedFetch('panNumber', text, {
                setCustomerName,
                setLoanId,
                setContactNumber,
                setPanNumber
              });
            }
            setErrors(prev => ({ ...prev, panNumber: '' }));
          }}
        />
        {errors.panNumber ? <Text style={styles.errorText}>{errors.panNumber}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Customer Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Customer Name"
          value={customerName}
          onChangeText={(text) => {
            setCustomerName(text);
            debouncedFetch('customerName', text);
            setErrors(prev => ({ ...prev, customerName: '' }));
          }}
        />
        {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Vehicle Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Vehicle Number"
          value={vehicleNumber}
          onChangeText={(text) => {
            setVehicleNumber(text);
            setErrors(prev => ({ ...prev, vehicleNumber: '' }));
          }}
        />
        {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
      </View>



      <View style={styles.field}>
        <Text style={styles.label}>Loan ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Loan ID"
          value={loanId}
          onChangeText={(text) => {
            setLoanId(text);
            setErrors(prev => ({ ...prev, loanId: '' }));
          }}
        />
        {errors.loanId ? <Text style={styles.errorText}>{errors.loanId}</Text> : null}
      </View>

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

      <View style={styles.field}>
        <Text style={styles.label}>Cash/Cheque/UPI Ref. No.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Reference Number"
          value={paymentRef}
          onChangeText={setPaymentRef}
        />
      </View>
      {/* <view style={styles.field}>
        <Pressable onPress={pickImage} style={{ marginVertical: 10, padding: 12, backgroundColor: '#eee', borderRadius: 10 }}>
          <Text>Select Screenshot or Photo</Text>
        </Pressable>

        {image && (
          <Image
            source={{ uri: image.uri }}
            style={{ width: 200, height: 200, marginBottom: 10 }}
          />
        )}

      </view> */}
      <View style={styles.field}>
        <Text style={styles.label}>Payment Collected By</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter RM Name"
          value={collectedBy}
          onChangeText={setCollectedBy}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount (₹) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={(text) => {
            setAmount(text);
            setErrors(prev => ({ ...prev, amount: '' }));
          }}
        />
        {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Amount in Words</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount in Words"
          value={amountInWords}
          onChangeText={(text) => {
            setAmountInWords(text);
            setErrors(prev => ({ ...prev, amountInWords: '' }));
          }}
        />
        {errors.amountInWords ? <Text style={styles.errorText}>{errors.amountInWords}</Text> : null}
      </View>
      <View style={styles.field}>
        <Pressable
          onPress={onSelectFromGallery}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10, marginBottom: 8 }}
        >
          <Text>Select from Gallery</Text>
        </Pressable>
        <Pressable
          onPress={onCaptureFromCamera}
          style={{ padding: 12, backgroundColor: '#eee', borderRadius: 10 }}
        >
          <Text>Capture from Camera</Text>
        </Pressable>

        {image?.uri && (
          <View style={{ alignItems: 'center', marginTop: 10 }}>
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: image.uri }}
                style={{ width: 200, height: 200, borderRadius: 8 }}
              />
              <Pressable
                onPress={() => setImage(null)}
                style={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderRadius: 12,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18 }}>✕</Text>
              </Pressable>

            </View>
          </View>
        )}

      </View>




      <Button
        label={isLoading ? 'Saving...' : 'Save Loan'}
        onPress={handleSave}
        disabled={isLoading}
      />
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
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


  loaderContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});