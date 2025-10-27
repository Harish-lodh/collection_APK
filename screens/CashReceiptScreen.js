// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Pressable,
//   Platform,
//   Image,
//   Alert,
// } from 'react-native';
// import styles from '../utils/style.js'

// import debounce from 'lodash.debounce';

// import { selectFromGallery } from '../utils/index.js';
// import { captureFromCamera } from '../utils/index.js';
// import { getCurrentLocation } from '../components/function.js';
// import Button from '../components/Button';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { Dropdown } from 'react-native-element-dropdown';
// import axios from 'axios';
// import { getAuthToken } from '../components/authToken';
// import { BACKEND_BASE_URL } from '@env';
// import { fetchAutoData } from '../utils/autofetch.js';
// import Loader from '../components/loader';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // import * as ImagePicker from 'expo-image-picker';

// export default function CashReceiptScreen() {
//   const [location, setLocation] = useState(null);
//   const [users, setUsers] = useState([]);  // list of names
//   const [products, setProducts] = useState([]);     // dropdown options
//   const [selectedProduct, setSelectedProduct] = useState(null);

//   const [customerName, setCustomerName] = useState('');
//   const [panNumber, setPanNumber] = useState('');
//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [contactNumber, setContactNumber] = useState('');
//   const [partnerLoanId, setPartnerLoanId] = useState('');

//   const [loanId, setLoanId] = useState('');
//   const [paymentDate, setPaymentDate] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const [selectedValue, setSelectedValue] = useState(null); // Cash / Cheque / UPI
//   const [paymentRef, setPaymentRef] = useState('');
//   const [collectedBy, setCollectedBy] = useState('');
//   const [amount, setAmount] = useState('');
//   const [remark, setremark] = useState('');

//   const [isLoading, setIsLoading] = useState(false);

//   // Image picking UI
//   const [photoSource, setPhotoSource] = useState(null); // 'gallery' | 'camera' | null
//   const [photoError, setPhotoError] = useState('');
//   const [image, setImage] = useState(null);

//   // Selfie picking UI
//   const [selfieSource, setSelfieSource] = useState('camera');
//   const [selfieError, setSelfieError] = useState('');
//   const [selfie, setSelfie] = useState(null);

//   // Helper: treat anything except "Cash" as non-cash
//   const isNonCash = selectedValue === 'UPI' || selectedValue === 'Cheque';

//   const [errors, setErrors] = useState({
//     panNumber: '',
//     customerName: '',
//     vehicleNumber: '',
//     contactNumber: '',
//     partnerLoanId: '',
//     loanId: '',
//     paymentDate: '',
//     amount: '',
//     remark: '',
//     collectedBy: '',
//     paymentMode: '',
//     paymentRef: '',
//     image: '',
//     selfie: '',
//   });

//   const data = [
//     { label: 'Cash', value: 'Cash' },
//     { label: 'Cheque', value: 'Cheque' },
//     { label: 'UPI', value: 'UPI' },
//   ];

//   const formatDate = (d) => {
//     if (!d) return '';
//     const day = String(d.getDate()).padStart(2, '0');
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     const year = d.getFullYear();
//     return `${day}-${month}-${year}`;
//   };

//   const handleDateChange = (_e, selected) => {
//     setShowDatePicker(false);
//     if (selected) {
//       setPaymentDate(selected);
//       setErrors((prev) => ({ ...prev, paymentDate: '' }));
//     }
//   };

//   const onSelectFromGallery = async () => {
//     const asset = await selectFromGallery();
//     if (asset) {
//       console.log(asset)
//       setImage(asset);
//       setPhotoError('');
//       setErrors((p) => ({ ...p, image: '' }));
//     }
//   };

//   const onCaptureFromCamera = async () => {
//     const asset = await captureFromCamera();
//     if (asset) {
//       setImage(asset);
//       setPhotoError('');
//       setErrors((p) => ({ ...p, image: '' }));
//     }
//   };

//   const onCaptureSelfie = async () => {
//     const asset = await captureFromCamera();
//     if (asset) {
//       console.log(asset)
//       setSelfie(asset);
//       setSelfieError('');
//       setErrors((p) => ({ ...p, selfie: '' }));
//     }
//   };

//   const validateForm = () => {
//     let isValid = true;
//     const newErrors = {
//       panNumber: '',
//       customerName: '',
//       contactNumber: '',
//       partnerLoanId: '',
//       product: '',
//       loanId: '',
//       paymentDate: '',
//       amount: '',
//       remark: '',
//       collectedBy: '',
//       paymentMode: '',
//       paymentRef: '',
//       image: '',
//       selfie: '',
//     };

//     if (!panNumber.trim()) {
//       newErrors.panNumber = 'PanNumber is required';
//       isValid = false;
//     }
//     if (!customerName.trim()) {
//       newErrors.customerName = 'Customer Name is required';
//       isValid = false;
//     }
//     // if (!vehicleNumber.trim()) {
//     //   newErrors.vehicleNumber = 'Vehicle Number is required';
//     //   isValid = false;
//     // }

//     if (!contactNumber.trim()) {
//       newErrors.contactNumber = 'Contact Number is required';
//       isValid = false;
//     } else if (!/^\d{10}$/.test(contactNumber)) {
//       newErrors.contactNumber = 'Enter a valid 10-digit phone number';
//       isValid = false;
//     }

//     if (!loanId.trim()) {
//       newErrors.loanId = 'Loan ID is required';
//       isValid = false;
//     }
//     if (!partnerLoanId.trim()) {
//       newErrors.loanId = 'PartnerLoan ID is required';
//       isValid = false;
//     }
//     if (!paymentDate) {
//       newErrors.paymentDate = 'Payment Date is required';
//       isValid = false;
//     }
//     if (!selectedValue) {
//       newErrors.paymentMode = 'Payment Mode is required';
//       isValid = false;
//     }
//     if (!collectedBy.trim()) {
//       newErrors.collectedBy = 'Collected By is required';
//       isValid = false;
//     }


//     if (!amount.trim()) {
//       newErrors.amount = 'Amount is required';
//       isValid = false;
//     } else if (isNaN(amount) || Number(amount) <= 0) {
//       newErrors.amount = 'Enter a valid amount';
//       isValid = false;
//     }

//     // Conditional rules for non-cash
//     if (isNonCash) {
//       if (!paymentRef.trim()) {
//         newErrors.paymentRef = 'Reference number is required for UPI/Cheque';
//         isValid = false;
//       }
//       // if (!image?.uri) {
//       //   newErrors.image = 'Receipt photo is required for UPI/Cheque';
//       //   isValid = false;
//       // }
//     }
//     if (!image?.uri) {
//       newErrors.image = 'Receipt photo is required for UPI/Cheque/cash';
//       isValid = false;
//     }

//     if (!selfie?.uri) {
//       newErrors.selfie = 'Selfie photo is required';
//       isValid = false;
//     }

//     if (!selectedProduct) {
//       newErrors.product = 'Product is required';
//       isValid = false;
//     }



//     setErrors(newErrors);
//     return isValid;
//   };

//   const debouncedFetch = debounce((product, key, value, setters) => {
//     if (value && product) {
//       fetchAutoData(product, key, value, setters);
//     }
//   }, 500);

//   useEffect(() => {
//     // cleanup debounce on unmount
//     const fetchUser = async () => {
//       try {
//         const token = await getAuthToken();
//         const res = await axios.get(`${BACKEND_BASE_URL}/getUser`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         const formatted = res.data.map(u => ({
//           label: u.name,
//           value: u.name,
//         })

//         );
//         setUsers(formatted)
//       } catch (error) {
//         console.log(error.message);
//         console.error('Error fetching users:', error);
//       }
//     }
//     fetchUser();
//     return () => debouncedFetch.cancel();
//   }, []);

//   //product dropdown
//   useEffect(() => {
//     const loadProducts = async () => {
//       try {
//         const stored = await AsyncStorage.getItem('user');
//         const user = stored ? JSON.parse(stored) : {};
//         const permissions = Array.isArray(user.permissions) && user.permissions.length
//           ? user.permissions
//           : ['Embifi']; // fallback if no permissions
//         setProducts(permissions.map(p => ({ label: p, value: p })));
//       } catch (err) {
//         console.error('Error loading products:', err);
//         setProducts([{ label: 'Embifi', value: 'embifi' }]); // safety fallback
//       }
//     };
//     loadProducts();
//   }, []);



//   const handleSave = async () => {
//     if (!validateForm()) return;

//     setIsLoading(true);

//     // Only enforce image for non-cash
//     if (isNonCash && !image?.uri) {
//       setPhotoError('Receipt photo is required for UPI/Cheque/Cash.');
//       setIsLoading(false);
//       return;
//     } else {
//       setPhotoError('');
//     }

//     try {
//       const locationCoords = await getCurrentLocation();
//       console.log("location coords", locationCoords)
//       if (!locationCoords) {
//         setIsLoading(false);
//         return;
//       }
//       setLocation(locationCoords);

//       const formatDateForSQL = (d) => {
//         if (!d) return null;
//         const day = String(d.getDate()).padStart(2, '0');
//         const month = String(d.getMonth() + 1).padStart(2, '0');
//         const year = d.getFullYear();
//         return `${year}-${month}-${day}`;
//       };

//       const form = new FormData();
//       form.append('product', selectedProduct.toLowerCase());
//       form.append('loanId', loanId);
//       form.append('partnerLoanId', partnerLoanId);
//       form.append('customerName', customerName);
//       form.append('vehicleNumber', vehicleNumber);
//       form.append('contactNumber', contactNumber);
//       form.append('panNumber', panNumber);
//       form.append('paymentDate', formatDateForSQL(paymentDate));
//       if (selectedValue) form.append('paymentMode', selectedValue);
//       if (paymentRef) form.append('paymentRef', paymentRef);
//       if (collectedBy) form.append('collectedBy', collectedBy);
//       form.append('amount', String(amount)); // numbers must be strings in multipart
//       if (remark) form.append('remark', remark);
//       form.append('latitude', String(locationCoords.latitude));
//       form.append('longitude', String(locationCoords.longitude));

//       if (image?.uri) {
//         form.append('image', {
//           uri: image.uri,
//           name: image.fileName || `receipt_${Date.now()}.jpg`,
//           type: image.type || 'image/jpeg',
//         });
//       }

//       if (selfie?.uri) {
//         form.append('selfie', {
//           uri: selfie.uri,
//           name: selfie.fileName || `selfie_${Date.now()}.jpg`,
//           type: selfie.type || 'image/jpeg',
//         });
//       }

//       const token = await getAuthToken();
//       console.log("backend url", BACKEND_BASE_URL)
//       const res = await axios.post(
//         `${BACKEND_BASE_URL}/loanDetails/save-loan`,
//         form,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             // Let RN set multipart boundary automatically
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       Alert.alert('Success', '✅Receipt Submitted Successfully!', [
//         {
//           text: 'OK',
//           onPress: () => {
//             // Reset form
//             setPanNumber('');
//             setCustomerName('');
//             setVehicleNumber('');
//             setContactNumber('');
//             setPartnerLoanId('');
//             setLoanId('');
//             setPaymentDate(null);
//             setSelectedValue(null);
//             setPaymentRef('');
//             setCollectedBy('');
//             setAmount('');
//             setremark('');
//             setImage(null);
//             setSelfie(null);
//             setPhotoSource(null);
//             setSelfieSource('camera');
//             setPhotoError('');
//             setSelfieError('');
//             setErrors({
//               panNumber: '',
//               customerName: '',
//               vehicleNumber: '',
//               contactNumber: '',
//               partnerLoanId: '',
//               loanId: '',
//               paymentDate: '',
//               amount: '',
//               remark: '',
//               collectedBy: '',
//               paymentMode: '',
//               paymentRef: '',
//               image: '',
//               selfie: '',
//             });
//           },
//         },
//       ]);
//     } catch (error) {
//       console.error('Save Error:', error);
//       if (error.response) {
//         Alert.alert(
//           'API Error',
//           `${error.response.status}: ${error.response.data?.message || 'Server error'}`
//         );
//       } else if (error.request) {
//         Alert.alert('Network Error', 'No response from server. Check base URL / network.');
//       } else {
//         Alert.alert('Error', 'Unexpected error occurred.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

  


//   return (
//     <View style={{ flex: 1 }}>
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Phone */}
//         <View style={{ zIndex: 1000, marginBottom: 12 }}>
//           <Text style={styles.label}>
//             Product <Text style={styles.req}>*</Text>
//           </Text>
//           <Dropdown
//             style={styles.dropdown}
//             containerStyle={{ borderRadius: 8 }}
//             placeholderStyle={{ color: '#888' }}
//             selectedTextStyle={{ color: '#000' }}
//             data={products}
//             labelField="label"
//             valueField="value"
//             placeholder="Select product"
//             value={selectedProduct}
//             onChange={(item) => setSelectedProduct(item.value)}
//           />

//         </View>

//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Phone Number <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Contact Number"
//             keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
//             maxLength={10}
//             value={contactNumber}
//             onChangeText={(text) => {
//               if (!selectedProduct) {
//                 Alert.alert("Please select a product first");
//                 return;
//               }

//               setContactNumber(text);
//               if (text.length === 10) {
//                 debouncedFetch(selectedProduct, 'phoneNumber', text, {
//                   setCustomerName,
//                   setLoanId,
//                   setPartnerLoanId,
//                   setContactNumber,
//                   setPanNumber,
//                 });
//               }
//               setErrors((prev) => ({ ...prev, contactNumber: '' }));
//             }}
//           />
//           {errors.contactNumber ? <Text style={styles.errorText}>{errors.contactNumber}</Text> : null}
//         </View>

//         {/* PAN */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Pan Number <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Pan Number"
//             value={panNumber}
//             maxLength={10}
//             autoCapitalize="characters"
//             onChangeText={(text) => {
//               const t = text.toUpperCase();
//               setPanNumber(t);
//               if (t.length === 10) {
//                 debouncedFetch(selectedProduct, 'panNumber', t, {
//                   setCustomerName,
//                   setLoanId,
//                   setPartnerLoanId,
//                   setContactNumber,
//                   setPanNumber,
//                 });
//               }
//               setErrors((prev) => ({ ...prev, panNumber: '' }));
//             }}
//           />
//           {errors.panNumber ? <Text style={styles.errorText}>{errors.panNumber}</Text> : null}
//         </View>

//         {/* Customer Name */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Customer Name <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Customer Name"
//             value={customerName}
//             onChangeText={(text) => {
//               setCustomerName(text);
//               // debouncedFetch('customerName', text);
//               setErrors((prev) => ({ ...prev, customerName: '' }));
//             }}
//           />
//           {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
//         </View>

//         {/* Vehicle No */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Vehicle Number
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Vehicle Number"
//             value={vehicleNumber}
//             autoCapitalize="characters"
//             onChangeText={(text) => {
//               setVehicleNumber(text.toUpperCase());
//               setErrors((prev) => ({ ...prev, vehicleNumber: '' }));
//             }}
//           />
//           {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
//         </View>
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Partner Loan ID <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter PartnerLoan ID"
//             value={partnerLoanId}
//             onChangeText={(text) => {
//               setPartnerLoanId(text);
//               setErrors((prev) => ({ ...prev, partnerLoanId: '' }));
//             }}
//           />
//           {errors.partnerLoanId ? <Text style={styles.errorText}>{errors.partnerLoanId}</Text> : null}
//         </View>
//         {/* Loan ID */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Loan ID <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Loan ID"
//             value={loanId}
//             onChangeText={(text) => {
//               setLoanId(text);
//               setErrors((prev) => ({ ...prev, loanId: '' }));
//             }}
//           />
//           {errors.loanId ? <Text style={styles.errorText}>{errors.loanId}</Text> : null}
//         </View>

//         {/* Payment Date */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Payment Date <Text style={styles.req}>*</Text>
//           </Text>
//           <Pressable style={styles.inputRow} onPress={() => setShowDatePicker(true)}>
//             <Text style={[styles.valueText, !paymentDate && styles.placeholder]}>
//               {paymentDate ? formatDate(paymentDate) : 'Select date'}
//             </Text>
//           </Pressable>
//           {errors.paymentDate ? <Text style={styles.errorText}>{errors.paymentDate}</Text> : null}
//           {showDatePicker && (
//             <DateTimePicker
//               value={paymentDate || new Date()}
//               mode="date"
//               display={Platform.OS === 'ios' ? 'spinner' : 'default'}
//               onChange={handleDateChange}
//             />
//           )}
//         </View>

//         {/* Payment Mode */}
//         <View style={{ zIndex: 1000, elevation: 3, marginBottom: 12 }}>
//           <Text style={styles.label}>
//             Payment Mode <Text style={styles.req}>*</Text>
//           </Text>
//           <Dropdown
//             style={styles.dropdown}
//             containerStyle={{ borderRadius: 8 }}
//             placeholderStyle={{ color: '#888' }}
//             selectedTextStyle={{ color: '#000' }}
//             data={data}
//             labelField="label"
//             valueField="value"
//             placeholder="Select an option"
//             value={selectedValue}
//             onChange={(item) => {
//               setSelectedValue(item.value);
//               // clear mode-related errors when switching
//               setErrors((prev) => ({
//                 ...prev,
//                 paymentMode: '',
//                 ...(item.value === 'Cash' ? { paymentRef: '', image: '' } : {}),
//               }));
//             }}
//           />
//           {selectedValue ? <Text style={{ marginTop: 4 }}>Selected: {selectedValue}</Text> : null}
//           {errors.paymentMode ? <Text style={styles.errorText}>{errors.paymentMode}</Text> : null}
//         </View>

//         {/* Payment Ref (conditional asterisk) */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Cheque/UPI Ref. No. {isNonCash ? <Text style={styles.req}>*</Text> : null}
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder={
//               isNonCash
//                 ? 'Enter Reference Number (required for UPI/Cheque)'
//                 : 'Enter Reference Number (optional for Cash)'
//             }
//             value={paymentRef}
//             onChangeText={(t) => {
//               setPaymentRef(t);
//               if (t) setErrors((p) => ({ ...p, paymentRef: '' }));
//             }}
//           />
//           {errors.paymentRef ? <Text style={styles.errorText}>{errors.paymentRef}</Text> : null}
//         </View>

//         {/* Collected By */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Payment Collected By <Text style={styles.req}>*</Text>
//           </Text>
//           <Dropdown
//             style={styles.dropdown}
//             data={users}
//             labelField="label"
//             valueField="value"
//             placeholder="Select collector"
//             value={collectedBy}
//             onChange={item => {
//               setCollectedBy(item.value);
//               setErrors(prev => ({ ...prev, collectedBy: '' }));
//             }}
//           />
//           {errors.collectedBy ? <Text style={styles.errorText}>{errors.collectedBy}</Text> : null}
//         </View>

//         {/* Amount */}
//         <View style={styles.field}>
//           <Text style={styles.label}>
//             Amount (₹) <Text style={styles.req}>*</Text>
//           </Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Amount"
//             keyboardType="numeric"
//             value={amount}
//             onChangeText={(text) => {
//               setAmount(text);
//               setErrors((prev) => ({ ...prev, amount: '' }));
//             }}
//           />
//           {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
//         </View>

//         {/* Amount in Words */}
//         <View style={styles.field}>
//           <Text style={styles.label}>Remarks</Text>
//           <TextInput
//             style={styles.input}
//             placeholder="Enter Remarks"
//             value={remark}
//             onChangeText={(text) => {
//               setremark(text);
//               setErrors((prev) => ({ ...prev, remark: '' }));
//             }}
//           />
//           {errors.remark ? <Text style={styles.errorText}>{errors.remark}</Text> : null}
//         </View>

//         {/* --- Photo Source (required only for non-cash) --- */}
//         <View style={styles.field}>
//           <View style={styles.headerRow}>
//             <Text style={styles.label}>
//               Receipt Photo <Text style={styles.req}>*</Text>
//             </Text>
//             {image?.uri ? (
//               <Text style={styles.hintOk}>Selected</Text>
//             ) : (
//               <Text style={styles.hint}>image is required</Text>
//             )}
//           </View>

//           {/* Segmented cards */}
//           <View style={styles.segmentRow}>
//             <Pressable
//               onPress={() => setPhotoSource('gallery')}
//               style={[styles.segment, photoSource === 'gallery' && styles.segmentActive]}
//               hitSlop={8}
//             >
//               <Text style={[styles.segmentEmoji, photoSource === 'gallery' && styles.segmentEmojiActive]}>
//                 🖼️
//               </Text>
//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.segmentTitle, photoSource === 'gallery' && styles.segmentTitleActive]}>
//                   Gallery
//                 </Text>
//                 <Text style={styles.segmentSub}>Pick an existing photo</Text>
//               </View>
//               {photoSource === 'gallery' ? <Text style={styles.tick}>✓</Text> : null}
//             </Pressable>

//             <Pressable
//               onPress={() => setPhotoSource('camera')}
//               style={[styles.segment, photoSource === 'camera' && styles.segmentActive]}
//               hitSlop={8}
//             >
//               <Text style={[styles.segmentEmoji, photoSource === 'camera' && styles.segmentEmojiActive]}>
//                 📷
//               </Text>
//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.segmentTitle, photoSource === 'camera' && styles.segmentTitleActive]}>
//                   Camera
//                 </Text>
//                 <Text style={styles.segmentSub}>Capture a new photo</Text>
//               </View>
//               {photoSource === 'camera' ? <Text style={styles.tick}>✓</Text> : null}
//             </Pressable>
//           </View>

//           {/* Pick button */}
//           <Pressable
//             onPress={async () => {
//               setPhotoError('');
//               if (!photoSource) {
//                 setPhotoError('Please choose Gallery or Camera.');
//                 return;
//               }
//               if (photoSource === 'gallery') await onSelectFromGallery();
//               if (photoSource === 'camera') await onCaptureFromCamera();
//             }}
//             style={[styles.primaryBtn, !photoSource && { opacity: 0.6 }]}
//           >
//             <Text style={styles.primaryBtnText}>Pick Photo</Text>
//           </Pressable>

//           {/* Errors underneath */}
//           {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
//           {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

//           {/* Preview with custom close pill */}
//           {image?.uri && (
//             <View style={{ alignItems: 'center', marginTop: 12 }}>
//               <View style={{ position: 'relative' }}>
//                 <Image source={{ uri: image.uri }} style={{ width: 220, height: 220, borderRadius: 10 }} />
//                 <Pressable
//                   onPress={() => {
//                     setImage(null);
//                     if (isNonCash) {
//                       setPhotoError('Receipt photo is required.');
//                       setErrors((p) => ({ ...p, image: 'Receipt photo is required ' }));
//                     } else {
//                       setPhotoError('');
//                       setErrors((p) => ({ ...p, image: '' }));
//                     }
//                   }}
//                   accessibilityLabel="Remove image"
//                   hitSlop={8}
//                   style={styles.closePill}
//                 >
//                   <Text style={styles.closeText}>×</Text>
//                 </Pressable>
//               </View>
//               <Text style={styles.previewCaption}>Preview</Text>
//             </View>
//           )}
//         </View>

//         {/* --- Selfie Photo --- */}
//         <View style={styles.field}>
//           <View style={styles.headerRow}>
//             <Text style={styles.label}>
//               Selfie Photo <Text style={styles.req}>*</Text>
//             </Text>
//             {selfie?.uri ? (
//               <Text style={styles.hintOk}>Selected</Text>
//             ) : (
//               <Text style={styles.hint}>Selfie is required</Text>
//             )}
//           </View>

//           {/* Segmented cards - only camera */}
//           <View style={styles.segmentRow}>
//             <Pressable
//               onPress={() => setSelfieSource('camera')}
//               style={[styles.segment, selfieSource === 'camera' && styles.segmentActive]}
//               hitSlop={8}
//             >
//               <Text style={[styles.segmentEmoji, selfieSource === 'camera' && styles.segmentEmojiActive]}>
//                 📷
//               </Text>
//               <View style={{ flex: 1 }}>
//                 <Text style={[styles.segmentTitle, selfieSource === 'camera' && styles.segmentTitleActive]}>
//                   Camera
//                 </Text>
//                 <Text style={styles.segmentSub}>Capture a new selfie</Text>
//               </View>
//               {selfieSource === 'camera' ? <Text style={styles.tick}>✓</Text> : null}
//             </Pressable>
//           </View>

//           {/* Pick button */}
//           <Pressable
//             onPress={async () => {
//               setSelfieError('');
//               if (!selfieSource) {
//                 setSelfieError('Please choose Camera.');
//                 return;
//               }
//               if (selfieSource === 'camera') await onCaptureSelfie();
//             }}
//             style={[styles.primaryBtn, !selfieSource && { opacity: 0.6 }]}
//           >
//             <Text style={styles.primaryBtnText}>Capture Selfie</Text>
//           </Pressable>

//           {/* Errors underneath */}
//           {selfieError ? <Text style={styles.errorText}>{selfieError}</Text> : null}
//           {errors.selfie ? <Text style={styles.errorText}>{errors.selfie}</Text> : null}

//           {/* Preview with custom close pill */}
//           {selfie?.uri && (
//             <View style={{ alignItems: 'center', marginTop: 12 }}>
//               <View style={{ position: 'relative' }}>
//                 <Image source={{ uri: selfie.uri }} style={{ width: 220, height: 220, borderRadius: 10 }} />
//                 <Pressable
//                   onPress={() => {
//                     setSelfie(null);
//                     //  setSelfieError('Selfie photo is required.');
//                     setErrors((p) => ({ ...p, selfie: 'Selfie photo is required' }));
//                   }}
//                   accessibilityLabel="Remove selfie"
//                   hitSlop={8}
//                   style={styles.closePill}
//                 >
//                   <Text style={styles.closeText}>×</Text>
//                 </Pressable>
//               </View>
//               <Text style={styles.previewCaption}>Selfie Preview</Text>
//             </View>
//           )}
//         </View>

//         {/* Submit */}
//         <Button
//           label={isLoading ? 'Saving...' : 'Submit'}
//           onPress={handleSave}
//           disabled={isLoading}
//         />

//       </ScrollView>
//       <Loader visible={isLoading} />
//     </View>
//   );
// }






import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Platform,
  Image,
  Alert,
} from 'react-native';
import styles from '../utils/style.js'

import debounce from 'lodash.debounce';

import { selectFromGallery } from '../utils/index.js';
import { captureFromCamera } from '../utils/index.js';
import { getCurrentLocation } from '../components/function.js';
import Button from '../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import { getAuthToken } from '../components/authToken';
import { BACKEND_BASE_URL } from '@env';
import { fetchAutoData } from '../utils/autofetch.js';
import Loader from '../components/loader';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import * as ImagePicker from 'expo-image-picker';

export default function CashReceiptScreen() {
  const [location, setLocation] = useState(null);
  const [users, setUsers] = useState([]);  // list of names
  const [products, setProducts] = useState([]);     // dropdown options
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [customerName, setCustomerName] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [partnerLoanId, setPartnerLoanId] = useState('');

  const [loanId, setLoanId] = useState('');
  const [paymentDate, setPaymentDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedValue, setSelectedValue] = useState(null); // Cash / Cheque / UPI
  const [paymentRef, setPaymentRef] = useState('');
  const [collectedBy, setCollectedBy] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setremark] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // Image picking UI
  const [photoError, setPhotoError] = useState('');
  const [image, setImage] = useState(null);

  // Selfie picking UI
  const [selfieError, setSelfieError] = useState('');
  const [selfie, setSelfie] = useState(null);

  // Helper: treat anything except "Cash" as non-cash
  const isNonCash = selectedValue === 'UPI' || selectedValue === 'Cheque';

  const [errors, setErrors] = useState({
    panNumber: '',
    customerName: '',
    vehicleNumber: '',
    contactNumber: '',
    partnerLoanId: '',
    loanId: '',
    paymentDate: '',
    amount: '',
    remark: '',
    collectedBy: '',
    paymentMode: '',
    paymentRef: '',
    image: '',
    selfie: '',
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
      setErrors((prev) => ({ ...prev, paymentDate: '' }));
    }
  };

  const onSelectFromGallery = async () => {
    const asset = await selectFromGallery();
    if (asset) {
      console.log(asset)
      setImage(asset);
      setPhotoError('');
      setErrors((p) => ({ ...p, image: '' }));
    }
  };

  const onCaptureFromCamera = async () => {
    const asset = await captureFromCamera();
    if (asset) {
      setImage(asset);
      setPhotoError('');
      setErrors((p) => ({ ...p, image: '' }));
    }
  };

  const onCaptureSelfie = async () => {
    const asset = await captureFromCamera();
    if (asset) {
      console.log(asset)
      setSelfie(asset);
      setSelfieError('');
      setErrors((p) => ({ ...p, selfie: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      panNumber: '',
      customerName: '',
      contactNumber: '',
      partnerLoanId: '',
      product: '',
      loanId: '',
      paymentDate: '',
      amount: '',
      remark: '',
      collectedBy: '',
      paymentMode: '',
      paymentRef: '',
      image: '',
      selfie: '',
    };

    if (!panNumber.trim()) {
      newErrors.panNumber = 'PanNumber is required';
      isValid = false;
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Customer Name is required';
      isValid = false;
    }
    // if (!vehicleNumber.trim()) {
    //   newErrors.vehicleNumber = 'Vehicle Number is required';
    //   isValid = false;
    // }

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
    if (!partnerLoanId.trim()) {
      newErrors.loanId = 'PartnerLoan ID is required';
      isValid = false;
    }
    if (!paymentDate) {
      newErrors.paymentDate = 'Payment Date is required';
      isValid = false;
    }
    if (!selectedValue) {
      newErrors.paymentMode = 'Payment Mode is required';
      isValid = false;
    }
    if (!collectedBy.trim()) {
      newErrors.collectedBy = 'Collected By is required';
      isValid = false;
    }


    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
      isValid = false;
    } else if (isNaN(amount) || Number(amount) <= 0) {
      newErrors.amount = 'Enter a valid amount';
      isValid = false;
    }

    // Conditional rules for non-cash
    if (isNonCash) {
      if (!paymentRef.trim()) {
        newErrors.paymentRef = 'Reference number is required for UPI/Cheque';
        isValid = false;
      }
      // if (!image?.uri) {
      //   newErrors.image = 'Receipt photo is required for UPI/Cheque';
      //   isValid = false;
      // }
    }
    if (!image?.uri) {
      newErrors.image = 'Receipt photo is required for UPI/Cheque/cash';
      isValid = false;
    }

    if (!selfie?.uri) {
      newErrors.selfie = 'Selfie photo is required';
      isValid = false;
    }

    if (!selectedProduct) {
      newErrors.product = 'Product is required';
      isValid = false;
    }



    setErrors(newErrors);
    return isValid;
  };

  const debouncedFetch = debounce((product, key, value, setters) => {
    if (value && product) {
      fetchAutoData(product, key, value, setters);
    }
  }, 500);

  useEffect(() => {
    // cleanup debounce on unmount
    const fetchUser = async () => {
      try {
        const token = await getAuthToken();
        const res = await axios.get(`${BACKEND_BASE_URL}/getUser`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const formatted = res.data.map(u => ({
          label: u.name,
          value: u.name,
        })

        );
        setUsers(formatted)
      } catch (error) {
        console.log(error.message);
        console.error('Error fetching users:', error);
      }
    }
    fetchUser();
    return () => debouncedFetch.cancel();
  }, []);

  //product dropdown
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        const user = stored ? JSON.parse(stored) : {};
        const permissions = Array.isArray(user.permissions) && user.permissions.length
          ? user.permissions
          : ['Embifi']; // fallback if no permissions
        setProducts(permissions.map(p => ({ label: p, value: p })));
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([{ label: 'Embifi', value: 'embifi' }]); // safety fallback
      }
    };
    loadProducts();
  }, []);



  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Only enforce image for non-cash
    if (isNonCash && !image?.uri) {
      setPhotoError('Receipt photo is required for UPI/Cheque/Cash.');
      setIsLoading(false);
      return;
    } else {
      setPhotoError('');
    }

    try {
      const locationCoords = await getCurrentLocation();
      console.log("location coords", locationCoords)
      if (!locationCoords) {
        setIsLoading(false);
        return;
      }
      setLocation(locationCoords);

      const formatDateForSQL = (d) => {
        if (!d) return null;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${year}-${month}-${day}`;
      };

      const form = new FormData();
      form.append('product', selectedProduct.toLowerCase());
      form.append('loanId', loanId);
      form.append('partnerLoanId', partnerLoanId);
      form.append('customerName', customerName);
      form.append('vehicleNumber', vehicleNumber);
      form.append('contactNumber', contactNumber);
      form.append('panNumber', panNumber);
      form.append('paymentDate', formatDateForSQL(paymentDate));
      if (selectedValue) form.append('paymentMode', selectedValue);
      if (paymentRef) form.append('paymentRef', paymentRef);
      if (collectedBy) form.append('collectedBy', collectedBy);
      form.append('amount', String(amount)); // numbers must be strings in multipart
      if (remark) form.append('remark', remark);
      form.append('latitude', String(locationCoords.latitude));
      form.append('longitude', String(locationCoords.longitude));

      if (image?.uri) {
        form.append('image', {
          uri: image.uri,
          name: image.fileName || `receipt_${Date.now()}.jpg`,
          type: image.type || 'image/jpeg',
        });
      }

      if (selfie?.uri) {
        form.append('selfie', {
          uri: selfie.uri,
          name: selfie.fileName || `selfie_${Date.now()}.jpg`,
          type: selfie.type || 'image/jpeg',
        });
      }

      const token = await getAuthToken();
      console.log("backend url", BACKEND_BASE_URL)
      const res = await axios.post(
        `${BACKEND_BASE_URL}/loanDetails/save-loan`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let RN set multipart boundary automatically
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Alert.alert('Success', '✅Receipt Submitted Successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setPanNumber('');
            setCustomerName('');
            setVehicleNumber('');
            setContactNumber('');
            setPartnerLoanId('');
            setLoanId('');
            setPaymentDate(null);
            setSelectedValue(null);
            setPaymentRef('');
            setCollectedBy('');
            setAmount('');
            setremark('');
            setImage(null);
            setSelfie(null);
            setPhotoError('');
            setSelfieError('');
            setErrors({
              panNumber: '',
              customerName: '',
              vehicleNumber: '',
              contactNumber: '',
              partnerLoanId: '',
              loanId: '',
              paymentDate: '',
              amount: '',
              remark: '',
              collectedBy: '',
              paymentMode: '',
              paymentRef: '',
              image: '',
              selfie: '',
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Save Error:', error);
      if (error.response) {
        Alert.alert(
          'API Error',
          `${error.response.status}: ${error.response.data?.message || 'Server error'}`
        );
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
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Phone */}
        <View style={{ zIndex: 1000, marginBottom: 12 }}>
          <Text style={styles.label}>
            Product <Text style={styles.req}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            containerStyle={{ borderRadius: 8 }}
            placeholderStyle={{ color: '#888' }}
            selectedTextStyle={{ color: '#000' }}
            data={products}
            labelField="label"
            valueField="value"
            placeholder="Select product"
            value={selectedProduct}
            onChange={(item) => setSelectedProduct(item.value)}
          />

        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Phone Number <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Contact Number"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            maxLength={10}
            value={contactNumber}
            onChangeText={(text) => {
              if (!selectedProduct) {
                Alert.alert("Please select a product first");
                return;
              }

              setContactNumber(text);
              if (text.length === 10) {
                debouncedFetch(selectedProduct, 'phoneNumber', text, {
                  setCustomerName,
                  setLoanId,
                  setPartnerLoanId,
                  setContactNumber,
                  setPanNumber,
                });
              }
              setErrors((prev) => ({ ...prev, contactNumber: '' }));
            }}
          />
          {errors.contactNumber ? <Text style={styles.errorText}>{errors.contactNumber}</Text> : null}
        </View>

        {/* PAN */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Pan Number <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Pan Number"
            value={panNumber}
            maxLength={10}
            autoCapitalize="characters"
            onChangeText={(text) => {
              const t = text.toUpperCase();
              setPanNumber(t);
              if (t.length === 10) {
                debouncedFetch(selectedProduct, 'panNumber', t, {
                  setCustomerName,
                  setLoanId,
                  setPartnerLoanId,
                  setContactNumber,
                  setPanNumber,
                });
              }
              setErrors((prev) => ({ ...prev, panNumber: '' }));
            }}
          />
          {errors.panNumber ? <Text style={styles.errorText}>{errors.panNumber}</Text> : null}
        </View>

        {/* Customer Name */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Customer Name <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Customer Name"
            value={customerName}
            onChangeText={(text) => {
              setCustomerName(text);
              // debouncedFetch('customerName', text);
              setErrors((prev) => ({ ...prev, customerName: '' }));
            }}
          />
          {errors.customerName ? <Text style={styles.errorText}>{errors.customerName}</Text> : null}
        </View>

        {/* Vehicle No */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Vehicle Number
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Vehicle Number"
            value={vehicleNumber}
            autoCapitalize="characters"
            onChangeText={(text) => {
              setVehicleNumber(text.toUpperCase());
              setErrors((prev) => ({ ...prev, vehicleNumber: '' }));
            }}
          />
          {errors.vehicleNumber ? <Text style={styles.errorText}>{errors.vehicleNumber}</Text> : null}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>
            Partner Loan ID <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter PartnerLoan ID"
            value={partnerLoanId}
            onChangeText={(text) => {
              setPartnerLoanId(text);
              setErrors((prev) => ({ ...prev, partnerLoanId: '' }));
            }}
          />
          {errors.partnerLoanId ? <Text style={styles.errorText}>{errors.partnerLoanId}</Text> : null}
        </View>
        {/* Loan ID */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Loan ID <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Loan ID"
            value={loanId}
            onChangeText={(text) => {
              setLoanId(text);
              setErrors((prev) => ({ ...prev, loanId: '' }));
            }}
          />
          {errors.loanId ? <Text style={styles.errorText}>{errors.loanId}</Text> : null}
        </View>

        {/* Payment Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Payment Date <Text style={styles.req}>*</Text>
          </Text>
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
          <Text style={styles.label}>
            Payment Mode <Text style={styles.req}>*</Text>
          </Text>
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
            onChange={(item) => {
              setSelectedValue(item.value);
              // clear mode-related errors when switching
              setErrors((prev) => ({
                ...prev,
                paymentMode: '',
                ...(item.value === 'Cash' ? { paymentRef: '', image: '' } : {}),
              }));
            }}
          />
          {selectedValue ? <Text style={{ marginTop: 4 }}>Selected: {selectedValue}</Text> : null}
          {errors.paymentMode ? <Text style={styles.errorText}>{errors.paymentMode}</Text> : null}
        </View>

        {/* Payment Ref (conditional asterisk) */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Cheque/UPI Ref. No. {isNonCash ? <Text style={styles.req}>*</Text> : null}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              isNonCash
                ? 'Enter Reference Number (required for UPI/Cheque)'
                : 'Enter Reference Number (optional for Cash)'
            }
            value={paymentRef}
            onChangeText={(t) => {
              setPaymentRef(t);
              if (t) setErrors((p) => ({ ...p, paymentRef: '' }));
            }}
          />
          {errors.paymentRef ? <Text style={styles.errorText}>{errors.paymentRef}</Text> : null}
        </View>

        {/* Collected By */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Payment Collected By <Text style={styles.req}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            data={users}
            labelField="label"
            valueField="value"
            placeholder="Select collector"
            value={collectedBy}
            onChange={item => {
              setCollectedBy(item.value);
              setErrors(prev => ({ ...prev, collectedBy: '' }));
            }}
          />
          {errors.collectedBy ? <Text style={styles.errorText}>{errors.collectedBy}</Text> : null}
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Amount (₹) <Text style={styles.req}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Amount"
            keyboardType="numeric"
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              setErrors((prev) => ({ ...prev, amount: '' }));
            }}
          />
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        {/* Amount in Words */}
        <View style={styles.field}>
          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Remarks"
            value={remark}
            onChangeText={(text) => {
              setremark(text);
              setErrors((prev) => ({ ...prev, remark: '' }));
            }}
          />
          {errors.remark ? <Text style={styles.errorText}>{errors.remark}</Text> : null}
        </View>

        {/* --- Photo Source (required only for non-cash) --- */}
        <View style={styles.field}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>
              Receipt Photo <Text style={styles.req}>*</Text>
            </Text>
            {image?.uri ? (
              <Text style={styles.hintOk}>Selected</Text>
            ) : (
              <Text style={styles.hint}>image is required</Text>
            )}
          </View>

          {/* Segmented cards */}
          <View style={styles.segmentRow}>
            <Pressable
              onPress={async () => {
                setPhotoError('');
                await onSelectFromGallery();
              }}
              style={styles.segment}
              hitSlop={8}
            >
              <Text style={styles.segmentEmoji}>
                🖼️
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.segmentTitle}>
                  Gallery
                </Text>
                <Text style={styles.segmentSub}>Pick an existing photo</Text>
              </View>
            </Pressable>

            <Pressable
              onPress={async () => {
                setPhotoError('');
                await onCaptureFromCamera();
              }}
              style={styles.segment}
              hitSlop={8}
            >
              <Text style={styles.segmentEmoji}>
                📷
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.segmentTitle}>
                  Camera
                </Text>
                <Text style={styles.segmentSub}>Capture a new photo</Text>
              </View>
            </Pressable>
          </View>

          {/* Errors underneath */}
          {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}
          {errors.image ? <Text style={styles.errorText}>{errors.image}</Text> : null}

          {/* Preview with custom close pill */}
          {image?.uri && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: image.uri }} style={{ width: 220, height: 220, borderRadius: 10 }} />
                <Pressable
                  onPress={() => {
                    setImage(null);
                    if (isNonCash) {
                      setPhotoError('Receipt photo is required.');
                      setErrors((p) => ({ ...p, image: 'Receipt photo is required ' }));
                    } else {
                      setPhotoError('');
                      setErrors((p) => ({ ...p, image: '' }));
                    }
                  }}
                  accessibilityLabel="Remove image"
                  hitSlop={8}
                  style={styles.closePill}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
              <Text style={styles.previewCaption}>Preview</Text>
            </View>
          )}
        </View>

        {/* --- Selfie Photo --- */}
        <View style={styles.field}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>
              Selfie Photo <Text style={styles.req}>*</Text>
            </Text>
            {selfie?.uri ? (
              <Text style={styles.hintOk}>Selected</Text>
            ) : (
              <Text style={styles.hint}>Selfie is required</Text>
            )}
          </View>

          {/* Segmented cards - only camera */}
          <View style={styles.segmentRow}>
            <Pressable
              onPress={async () => {
                setSelfieError('');
                await onCaptureSelfie();
              }}
              style={styles.segment}
              hitSlop={8}
            >
              <Text style={styles.segmentEmoji}>
                📷
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.segmentTitle}>
                  Camera
                </Text>
                <Text style={styles.segmentSub}>Capture a new selfie</Text>
              </View>
            </Pressable>
          </View>

          {/* Errors underneath */}
          {selfieError ? <Text style={styles.errorText}>{selfieError}</Text> : null}
          {errors.selfie ? <Text style={styles.errorText}>{errors.selfie}</Text> : null}

          {/* Preview with custom close pill */}
          {selfie?.uri && (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: selfie.uri }} style={{ width: 220, height: 220, borderRadius: 10 }} />
                <Pressable
                  onPress={() => {
                    setSelfie(null);
                    //  setSelfieError('Selfie photo is required.');
                    setErrors((p) => ({ ...p, selfie: 'Selfie photo is required' }));
                  }}
                  accessibilityLabel="Remove selfie"
                  hitSlop={8}
                  style={styles.closePill}
                >
                  <Text style={styles.closeText}>×</Text>
                </Pressable>
              </View>
              <Text style={styles.previewCaption}>Selfie Preview</Text>
            </View>
          )}
        </View>

        {/* Submit */}
        <Button
          label={isLoading ? 'Saving...' : 'Submit'}
          onPress={handleSave}
          disabled={isLoading}
        />

      </ScrollView>
      <Loader visible={isLoading} />
    </View>
  );
}