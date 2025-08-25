// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   ScrollView,
//   Pressable,
//   Platform,
//   Alert,
//   Image,
// } from 'react-native';
// import Button from '../components/Button';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Dropdown } from 'react-native-element-dropdown';
// import axios from 'axios';
// import { getAuthToken } from '../components/authToken';
// import { BACKEND_BASE_URL } from '@env';
// export default function CashReceiptScreen() {
//   const [customerName, setCustomerName] = useState('');
//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [contactNumber, setContactNumber] = useState('');
//   const [loanId, setLoanId] = useState('');

//   const [paymentDate, setPaymentDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [selectedValue, setSelectedValue] = useState(null); // for payment mode
//   const [paymentRef, setPaymentRef] = useState('');
//   const [collectedBy, setCollectedBy] = useState('');
//   const [amount, setAmount] = useState('');
//   const [amountInWords, setAmountInWords] = useState('');

//   const [errors, setErrors] = useState({
//     customerName: '',
//     vehicleNumber: '',
//     contactNumber: '',
//     loanId: '',
//     paymentDate: '',
//     amount: '',
//   });

//   // Options for payment mode
//   const data = [
//     { label: 'Cash', value: 'Cash' },
//     { label: 'Cheque', value: 'Cheque' },
//     { label: 'UPI', value: 'UPI' },
//   ];

//   const formatDate = (d) => {
//     if (!d) return '';
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   const handleDateChange = (_e, selected) => {
//     setShowDatePicker(false);
//     if (selected) setPaymentDate(selected);
//   };

// const handleSave = async () => {
//   try {
//     const formatDateForSQL = (d) => {
//       if (!d) return null;
//       const day = String(d.getDate()).padStart(2, '0');
//       const month = String(d.getMonth() + 1).padStart(2, '0');
//       const year = d.getFullYear();
//       return `${year}-${month}-${day}`;
//     };

//     const payload = {
//       loanId: loanId || null,
//       customerName: customerName || null,
//       vehicleNumber: vehicleNumber || null,
//       contactNumber: contactNumber || null,
//       paymentDate: formatDateForSQL(paymentDate),
//       paymentMode: selectedValue || null,
//       paymentRef: paymentRef || null,
//       collectedBy: collectedBy || null,
//       amount: amount ? Number(amount) : null,
//       amountInWords: amountInWords || null,
//     };

   
//     const token = await getAuthToken();
//     console.log("Token retrieved:", token);
//    console.log("base_url",BACKEND_BASE_URL)
//     const res = await axios.post(
//       `${BACKEND_BASE_URL}/save-loan`,
//       payload,
//       {
//         timeout: 10000,
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     Alert.alert('Success', 'Loan details saved successfully!');
//   } catch (error) {
//     console.error("Save Error:", error);
//     if (error.response) {
//       Alert.alert('API Error', `${error.response.status}: ${error.response.data?.message || 'Server error'}`);
//     } else if (error.request) {
//       Alert.alert('Network Error', 'No response from server. Check base URL / network.');
//     } else {
//       Alert.alert('Error', 'Unexpected error occurred.');
//     }
//   }
// };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       {/* Customer Name */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Customer Name *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Customer Name"
//           value={customerName}
//           onChangeText={setCustomerName}
//         />
//         {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
//       </View>

//       {/* Vehicle Number */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Vehicle Number *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Vehicle Number"
//           value={vehicleNumber}
//           onChangeText={setVehicleNumber}
//         />
//         {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
//       </View>

//       {/* Contact Number */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Customer Phone Number *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Contact Number"
//           keyboardType="phone-pad"
//           value={contactNumber}
//           onChangeText={setContactNumber}
//         />
//         {errors.contactNumber ? <Text style={styles.errorText}>{errors.contactNumber}</Text> : null}
//       </View>

//       {/* Loan ID */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Loan ID *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Loan ID"
//           value={loanId}
//           onChangeText={setLoanId}
//         />
//         {errors.loanId ? <Text style={styles.errorText}>{errors.loanId}</Text> : null}
//       </View>

//       {/* Payment Date */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Payment Date *</Text>
//         <Pressable style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
//           <Text style={[styles.valueText, !paymentDate && styles.placeholder]}>
//             {paymentDate ? formatDate(paymentDate) : 'Select date'}
//           </Text>
//         </Pressable>
//         {errors.paymentDate ? <Text style={styles.errorText}>{errors.paymentDate}</Text> : null}
//         {showDatePicker && (
//           <DateTimePicker
//             value={paymentDate || new Date()}
//             mode="date"
//             display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//             onChange={handleDateChange}
//           />
//         )}
//       </View>

//       {/* Payment Mode */}
//       <View style={{ zIndex: 1000, elevation: 3, marginBottom: 12 }}>
//         <Text style={styles.label}>Payment Mode *</Text>
//         <Dropdown
//           style={styles.dropdown}
//           containerStyle={{ borderRadius: 8 }}
//           placeholderStyle={{ color: '#888' }}
//           selectedTextStyle={{ color: '#000' }}
//           data={data}
//           labelField="label"
//           valueField="value"
//           placeholder="Select an option"
//           value={selectedValue}
//           onChange={item => setSelectedValue(item.value)}
//         />
//         {selectedValue && <Text style={{ marginTop: 4 }}>Selected: {selectedValue}</Text>}
//       </View>

//       {/* Ref No */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Cash/Cheque/UPI Ref. No.</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Reference Number"
//           value={paymentRef}
//           onChangeText={setPaymentRef}
//         />
//       </View>

//       {/* Collected By */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Payment Collected By</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter RM Name"
//           value={collectedBy}
//           onChangeText={setCollectedBy}
//         />
//       </View>

//       {/* Amount */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Amount (₹) *</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Amount"
//           keyboardType="numeric"
//           value={amount}
//           onChangeText={setAmount}
//         />
//         {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
//       </View>

//       {/* Amount in Words */}
//       <View style={styles.field}>
//         <Text style={styles.label}>Amount in Words</Text>
//         <TextInput
//           style={styles.input}
//           placeholder="Enter Amount in Words"
//           value={amountInWords}
//           onChangeText={setAmountInWords}
//         />
//       </View>

//        <View style={styles.container}>
//       <Text style={styles.title}>Scan to Pay</Text>

//       <View style={styles.qrContainer}>
//         <Image
//           source={require("../assets/images/Scanner.png")} // 👈 make sure file exists
//           style={styles.qrImage}
//           resizeMode="contain"
//         />
//       </View>

//       <Text style={styles.note}>Use any UPI app to scan this QR</Text>
//     </View>

//       <Button label="Save Loan" onPress={handleSave} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, gap: 12 },
//   title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
//   field: { marginBottom: 12 },
//   label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     padding: 12,
//     fontSize: 16,
//     backgroundColor: '#fff',
//   },
//   inputRow: {
//     height: 48,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   valueText: { fontSize: 16, color: '#111' },
//   placeholder: { color: '#888' },
//   errorText: { color: 'red', fontSize: 12, marginTop: 4 },
//   row: { flexDirection: 'row', gap: 12 },
//   half: { flex: 1 },
//   helper: { color: '#666', marginTop: 12 },
//   dropdown: {
//     height: 50,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 12,
//     backgroundColor: '#fff',
//   },

//    qrContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginVertical: 20,
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   qrImage: {
//     width: 220,
//     height: 220,
//   },
//   note: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginTop: 8,
//   },   
// });

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
  
  Alert,
} from 'react-native';

import {getCurrentLocation} from '../components/function.js'
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { getAuthToken } from '../components/authToken';
import { BACKEND_BASE_URL } from '@env';

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
    panNumber:'',
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      panNumber:'',
      customerName: '',
      vehicleNumber: '',
      contactNumber: '',
      loanId: '',
      paymentDate: '',
      amount: '',
      amountInWords: '',
    };
    if(!panNumber.trim()){
      newErrors.panNumber='PanNumber is required'
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
    if (!amountInWords.trim()) {
      newErrors.amountInWords = 'Amount in words is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

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

      const payload = {
        loanId: loanId || null,
        customerName: customerName || null,
        vehicleNumber: vehicleNumber || null,
        contactNumber: contactNumber || null,
        panNumber:panNumber||null,
        paymentDate: formatDateForSQL(paymentDate),
        paymentMode: selectedValue || null,
        paymentRef: paymentRef || null,
        collectedBy: collectedBy || null,
        amount: amount ? Number(amount) : null,
        amountInWords: amountInWords || null,
         latitude: locationCoords.latitude,
      longitude: locationCoords.longitude,
      };

      const token = await getAuthToken();
      const res = await axios.post(
        `${BACKEND_BASE_URL}/save-loan`,
        payload,
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
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
            setErrors({
              panNumber:'',
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
        <Text style={styles.label}>Amount in Words *</Text>
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

      {/* <View style={styles.container}>
        <Text style={styles.title}>Scan to Pay</Text>
        <View style={styles.qrContainer}>
          <Image
            source={require("../assets/images/Scanner.png")}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.note}>Use any UPI app to scan this QR</Text>
      </View> */}

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