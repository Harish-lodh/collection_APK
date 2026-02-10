// // src/screens/RepossessionScreen.jsx
// import React, { useMemo, useState, useRef, useEffect, Suspense, lazy } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   Pressable,
//   ActivityIndicator,
//   Image,
//   Alert,
//   Platform,
//   Keyboard,
// } from 'react-native';
// import axios from 'axios';
// import Loader from '../components/loader';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Dropdown } from 'react-native-element-dropdown';
// import DateTimePicker from '@react-native-community/datetimepicker';
// import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
// import styles from '../utils/RepoStyle';

// import { getAuthToken } from '../components/authToken';
// import { getCurrentLocation } from '../components/function';
// import { BACKEND_BASE_URL } from '@env';

// // utils
// import {
//   REPO_REASONS, VEHICLE_CONDITION, PLACES,
//   MIN_REQUIRED_PHOTOS, MAX_ALLOWED_PHOTOS,
//   PAN_REGEX, PHONE_REGEX, MIN_PARTNER_ID_LENGTH,
//   detectType, photoCount as countPhotos, canAddMore,
//   useDebouncedCallback, buildRepoFormData, createResetForm
// } from '../utils/index';

// const LabeledPhotoTile = lazy(() => import('../components/LabeledPhotoTile'));

// export default function RepossessionScreen() {
//   const [submitting, setSubmitting] = useState(false);
//   const [autoFetching, setAutoFetching] = useState(false);
//   const [editingId, setEditingId] = useState(null);

//   // Search fields
//   const [mobile, setMobile] = useState('');
//   const [panNumber, setPanNumber] = useState('');
//   const [partnerLoanId, setPartnerLoanId] = useState('');
//   const [vehicleNumber, setVehicleNumber] = useState('');
//   const [customerName, setCustomerName] = useState('');

//   // Vehicle info
//   const [makeModel, setMakeModel] = useState('');
//   const [regNo, setRegNo] = useState('');
//   const [chassisNo, setChassisNo] = useState('');
//   const [engineNo, setEngineNo] = useState('');
//   const [batteryNo, setBatteryNo] = useState('');

//   // Repo info
//   const [repoDate, setRepoDate] = useState(new Date());
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [showTimePicker, setShowTimePicker] = useState(false);
//   const [repoReason, setRepoReason] = useState(null);
//   const [agency, setAgency] = useState('');
//   const [fieldOfficer, setFieldOfficer] = useState('');

//   // Details
//   const [repoPlace, setRepoPlace] = useState(null);
//   const [vehicleCondition, setVehicleCondition] = useState(null);
//   const [inventory, setInventory] = useState('');
//   const [remarks, setRemarks] = useState('');

//   // Post repo
//   const [yardLocation, setYardLocation] = useState('');
//   const [yardIncharge, setYardIncharge] = useState('');
//   const [yardContact, setYardContact] = useState('');
//   const [yardReceipt, setYardReceipt] = useState('');
//   const [postRemarks, setPostRemarks] = useState('');

//   // GPS
//   const [latitude, setLatitude] = useState(null);
//   const [longitude, setLongitude] = useState(null);

//   // Photos: { [id]: { uri, type, fileName, label } }
//   const [photos, setPhotos] = useState({});

//   // refs
//   const scrollRef = useRef(null);
//   const lastFetchRef = useRef({ phone: '', pan: '', pli: '' });

//   // helpers
//   const photoCount = () => countPhotos(photos);
//   const canAdd = () => canAddMore(photos);

//   const captureLocation = async () => {
//     try {
//       const loc = await getCurrentLocation();
//       const lat = loc?.latitude ?? loc?.coords?.latitude;
//       const lon = loc?.longitude ?? loc?.coords?.longitude;
//       if (typeof lat === 'number' && typeof lon === 'number') {
//         setLatitude(lat); setLongitude(lon);
//         return true;
//       }
//     } catch { }
//     return false;
//   };

//   const askPhotoSource = (id) => {
//     Alert.alert('Add Photo', '', [
//       { text: 'Camera', onPress: () => takePhoto(id) },
//       { text: 'Gallery', onPress: () => pickPhoto(id) },
//       { text: 'Cancel', style: 'cancel' },
//     ]);
//   };

//   const takePhoto = async (id) => {
//     try {
//       const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
//       if (res?.assets?.length) {
//         const a = res.assets[0];
//         setPhotos((p) => ({
//           ...p,
//           [id]: {
//             ...(p[id] || {}),
//             uri: a.uri,
//             type: a.type || 'image/jpeg',
//             fileName: a.fileName || `${id}.jpg`,
//             label: p[id]?.label ?? '',
//           },
//         }));
//       }
//     } catch { }
//   };

//   const pickPhoto = async (id) => {
//     try {
//       const currentCount = Object.values(photos).filter((p) => p?.uri).length;
//       const remaining = Math.max(0, MAX_ALLOWED_PHOTOS - currentCount);
//       if (remaining <= 0) {
//         return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
//       }

//       const res = await launchImageLibrary({
//         mediaType: 'photo',
//         quality: 0.8,
//         selectionLimit: remaining,        // allow picking many at once
//         includeBase64: false,
//       });

//       if (res?.didCancel) return;
//       const assets = res?.assets || [];
//       if (!assets.length) return;

//       setPhotos((prev) => {
//         const next = { ...prev };
//         const prefix = id.startsWith('pre_') ? 'pre' : 'post';

//         assets.forEach((a, idx) => {
//           const targetId = idx === 0 ? id : `${prefix}_${Date.now()}_${idx}`;
//           next[targetId] = {
//             ...(prev[targetId] || {}),
//             uri: a.uri,
//             type: a.type || 'image/jpeg',
//             fileName: a.fileName || `${targetId}.jpg`,
//             label: prev[targetId]?.label ?? '',
//           };
//         });

//         return next;
//       });
//     } catch (err) {
//       console.warn('pickPhoto multi-select error', err);
//     }
//   };


//   const handleDateChange = (_e, selectedDate) => {
//     setShowDatePicker(false);
//     if (selectedDate) {
//       const d = new Date(repoDate);
//       d.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
//       setRepoDate(d);
//       if (Platform.OS === 'android') setShowTimePicker(true);
//     }
//   };

//   const handleTimeChange = (_e, selectedTime) => {
//     setShowTimePicker(false);
//     if (selectedTime) {
//       const d = new Date(repoDate);
//       d.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
//       setRepoDate(d);
//     }
//   };

//   const validateBasics = () => {
//     const errors = [];
//     if (!partnerLoanId && !vehicleNumber) errors.push('Enter Partner Loan ID or Vehicle No');
//     if (!repoReason) errors.push('Select repossession reason');
//     if (!repoPlace) errors.push('Select place of repossession');
//     if (!vehicleCondition) errors.push('Select vehicle condition');

//     const preCount = Object.entries(photos).filter(([id, f]) => detectType(id) === 'PRE' && f?.uri).length;
//     const postCount = Object.entries(photos).filter(([id, f]) => detectType(id) === 'POST' && f?.uri).length;

//     if (preCount < MIN_REQUIRED_PHOTOS) errors.push(`At least ${MIN_REQUIRED_PHOTOS} Pre-Repossession photos are required`);
//     if (postCount < 2) errors.push('At least 2 Post-Repossession photos are required');

//     const unlabeled = Object.entries(photos).filter(([_, f]) => f?.uri && !f?.label?.trim());
//     if (unlabeled.length) errors.push('Please provide labels for all uploaded photos');

//     if (errors.length) {
//       Alert.alert('Missing info', errors.join('\n'));
//       return false;
//     }
//     return true;
//   };

//   // reset form (from utils)
//   const resetForm = createResetForm({
//     Keyboard,
//     lastFetchRef,
//     scrollRef,
//     setters: {
//       setMobile, setPanNumber, setPartnerLoanId, setVehicleNumber, setCustomerName,
//       setMakeModel, setRegNo, setChassisNo, setEngineNo, setBatteryNo,
//       setRepoDate, setShowDatePicker, setShowTimePicker, setRepoReason, setAgency, setFieldOfficer,
//       setRepoPlace, setVehicleCondition, setInventory, setRemarks,
//       setYardLocation, setYardIncharge, setYardContact, setYardReceipt, setPostRemarks,
//       setLatitude, setLongitude, setPhotos, setEditingId, setAutoFetching,
//     },
//   });

//   // const handleSubmit = async () => {
//   //   if (!validateBasics()) return;
//   //   setSubmitting(true);
//   //   try {
//   //     await captureLocation();
//   //     const token = await getAuthToken();

//   //     const fd = buildRepoFormData({
//   //       base: {
//   //         mobile, panNumber, partnerLoanId, vehicleNumber, customerName,
//   //       },
//   //       vehicle: { makeModel, regNo, chassisNo, engineNo, batteryNo },
//   //       meta: { repoDate, repoReason, agency, fieldOfficer, repoPlace, vehicleCondition, inventory, remarks },
//   //       post: { yardLocation, yardIncharge, yardContact, yardReceipt, postRemarks },
//   //       coords: { latitude, longitude },
//   //       photos,
//   //     });

//   //     await axios.post(`${BACKEND_BASE_URL}/repossession`, fd, {
//   //       headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
//   //     });

//   //     Alert.alert('Success', '✅Repossession details submitted.');
//   //     resetForm(); // stay on page, clear form
//   //   } catch (e) {
//   //     const msg = e?.response?.data?.error || e?.response?.data?.message || (typeof e?.message === 'string' ? e.message : 'Failed to submit');
//   //     Alert.alert('Error', String(msg));
//   //   } finally {
//   //     setSubmitting(false);
//   //   }
//   // };


//   const handleSubmit = async () => {
//     if (!validateBasics()) return;
//     setSubmitting(true);

//     try {
//       // prepare payload before async work
//       const payload = {
//         base: { mobile, panNumber, partnerLoanId, vehicleNumber, customerName },
//         vehicle: { makeModel, regNo, chassisNo, engineNo, batteryNo },
//         meta: { repoDate, repoReason, agency, fieldOfficer, repoPlace, vehicleCondition, inventory, remarks },
//         post: { yardLocation, yardIncharge, yardContact, yardReceipt, postRemarks },
//         coords: { latitude, longitude },
//         photos,
//       };

//       // run location + token fetching in parallel
//       const [_, token] = await Promise.all([
//         captureLocation(),    // updates latitude/longitude in state
//         getAuthToken(),
//       ]);

//       const fd = buildRepoFormData(payload);

//       await axios.post(`${BACKEND_BASE_URL}/repossession`, fd, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "multipart/form-data",
//         },
//         timeout: 20000, // optional: fail faster if backend hangs
//       });

//       Alert.alert("Success", "✅ Repossession details submitted.");
//       resetForm();
//     } catch (e) {
//       const msg =
//         e?.response?.data?.error ||
//         e?.response?.data?.message ||
//         (typeof e?.message === "string" ? e.message : "Failed to submit");
//       Alert.alert("Error", String(msg));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ------- Auto Fetch -------
//   const [autoFetchBusyKey, setAutoFetchBusyKey] = useState(null); // track which key triggered

//   const autoFetch = async (params, key) => {
//     if (autoFetching) return;
//     try {
//       setAutoFetching(true);
//       setAutoFetchBusyKey(key || null);
//       const token = await getAuthToken();

//       const resp = await axios.get(`${BACKEND_BASE_URL}/embifi/auto-fetch`, {
//         headers: { Authorization: `Bearer ${token}` },
//         params,
//       });

//       const rows = resp?.data?.data || [];
//       if (!rows.length) return;

//       const r = rows[0];
//       setCustomerName(r.customerName || '');
//       setMobile(r.mobileNumber || '');
//       setPanNumber(r.panNumber || '');
//       setPartnerLoanId(r.partnerLoanId || '');
//     } catch { } finally {
//       setAutoFetching(false);
//       setAutoFetchBusyKey(null);
//     }
//   };

//   const debouncedFetchPhone = useDebouncedCallback((phone) => {
//     if (PHONE_REGEX.test(phone) && lastFetchRef.current.phone !== phone) {
//       lastFetchRef.current.phone = phone;
//       autoFetch({ phoneNumber: phone }, 'phone');
//     }
//   }, 350);

//   const debouncedFetchPAN = useDebouncedCallback((panClean) => {
//     if (panClean.length === 10 && PAN_REGEX.test(panClean) && lastFetchRef.current.pan !== panClean) {
//       lastFetchRef.current.pan = panClean;
//       autoFetch({ panNumber: panClean }, 'pan');
//     }
//   }, 350);

//   const debouncedFetchPartnerId = useDebouncedCallback((pli) => {
//     const v = (pli || '').trim();
//     if (v.length >= MIN_PARTNER_ID_LENGTH && lastFetchRef.current.pli !== v) {
//       lastFetchRef.current.pli = v;
//       autoFetch({ partnerLoanId: v }, 'pli');
//     }
//   }, 350);

//   // PRE / POST entries
//   const prePhotoEntries = useMemo(
//     () => Object.entries(photos).filter(([id]) => id.startsWith('pre_')),
//     [photos]
//   );
//   const postPhotoEntries = useMemo(
//     () => Object.entries(photos).filter(([id]) => id.startsWith('post_')),
//     [photos]
//   );

//   const addPre = () => {
//     if (!canAdd()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
//     const id = `pre_${Date.now()}`;
//     setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
//     setTimeout(() => askPhotoSource(id), 0);
//   };

//   const addPost = () => {
//     if (!canAdd()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
//     const id = `post_${Date.now()}`;
//     setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
//     setTimeout(() => askPhotoSource(id), 0);
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <ScrollView
//         ref={scrollRef}
//         contentContainerStyle={styles.scrollContent}
//         keyboardShouldPersistTaps="always"
//         keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
//         nestedScrollEnabled
//         removeClippedSubviews={false}
//       >
//         <Text style={styles.h1}>Vehicle Repossession</Text>

//         {/* Basic Search */}
//         <View style={styles.card}>
//           <Text style={styles.section}>Enter Customer Details</Text>

//           <Text style={styles.label}>Mobile</Text>
//           <TextInput
//             style={styles.input}
//             value={mobile}
//             onChangeText={(t) => {
//               const digits = t.replace(/[^\d]/g, '').slice(0, 10);
//               setMobile(digits);
//               if (digits.length === 10) debouncedFetchPhone(digits);
//             }}
//             keyboardType="phone-pad"
//             placeholder="10-digit mobile"
//             maxLength={10}
//           />
//           {autoFetchBusyKey === 'phone' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

//           <Text style={styles.label}>PAN</Text>
//           <TextInput
//             style={styles.input}
//             value={panNumber}
//             onChangeText={(t) => {
//               const cleaned = t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
//               setPanNumber(cleaned);
//               if (cleaned.length === 10) debouncedFetchPAN(cleaned);
//             }}
//             autoCapitalize="characters"
//             placeholder="ABCDE1234F"
//             maxLength={10}
//           />
//           {autoFetchBusyKey === 'pan' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

//           <Text style={styles.label}>Partner Loan ID</Text>
//           <TextInput
//             style={styles.input}
//             value={partnerLoanId}
//             onChangeText={(v) => {
//               setPartnerLoanId(v);
//               if ((v || '').trim().length >= MIN_PARTNER_ID_LENGTH) {
//                 debouncedFetchPartnerId(v);
//               }
//             }}
//             placeholder="Partner Loan ID"
//           />
//           {autoFetchBusyKey === 'pli' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

//           <Text style={styles.label}>Vehicle Number</Text>
//           <TextInput
//             style={styles.input}
//             value={vehicleNumber}
//             onChangeText={setVehicleNumber}
//             autoCapitalize="characters"
//             placeholder="Enter vehicle number"
//           />

//           <Text style={styles.label}>Customer Name</Text>
//           <TextInput
//             style={styles.input}
//             value={customerName}
//             onChangeText={setCustomerName}
//             placeholder="Auto-filled"
//             autoCapitalize="words"
//           />
//         </View>

//         {/* Vehicle Info */}
//         <View style={styles.card}>
//           <Text style={styles.section}>Vehicle</Text>
//           <TextInput style={styles.input} placeholder="Make / Model / Variant" value={makeModel} onChangeText={setMakeModel} />
//           <TextInput style={styles.input} placeholder="Registration No." value={regNo} onChangeText={setRegNo} />
//           <TextInput style={styles.input} placeholder="Chassis No." value={chassisNo} onChangeText={setChassisNo} />
//           <TextInput style={styles.input} placeholder="Engine No." value={engineNo} onChangeText={setEngineNo} />
//           <TextInput style={styles.input} placeholder="Battery No." value={batteryNo} onChangeText={setBatteryNo} />
//         </View>

//         {/* Repossession Meta */}
//         <View style={styles.card}>
//           <Text style={styles.section}>Repossession</Text>

//           <Text style={styles.label}>Date & Time</Text>
//           <View style={styles.row}>
//             <Pressable style={styles.btn} onPress={() => setShowDatePicker(true)}>
//               <Text style={styles.btnText}>Pick Date</Text>
//             </Pressable>
//             <View style={{ width: 8 }} />
//             <Pressable
//               style={styles.btn}
//               onPress={() => (Platform.OS === 'android' ? setShowTimePicker(true) : setShowDatePicker(true))}
//             >
//               <Text style={styles.btnText}>Pick Time</Text>
//             </Pressable>
//             <Text style={styles.dateText}>
//               {repoDate.toLocaleDateString()} {repoDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//             </Text>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker value={repoDate} mode="date" is24Hour display="default" onChange={handleDateChange} />
//           )}
//           {showTimePicker && (
//             <DateTimePicker value={repoDate} mode="time" is24Hour display="default" onChange={handleTimeChange} />
//           )}

//           <Text style={styles.label}>Reason</Text>
//           <AppDropdown data={REPO_REASONS} value={repoReason} onChange={setRepoReason} placeholder="Select reason" />

//           <Text style={styles.label}>Agency</Text>
//           <TextInput style={styles.input} value={agency} onChangeText={setAgency} placeholder="Agency name" />

//           <Text style={styles.label}>Field Officer</Text>
//           <TextInput style={styles.input} value={fieldOfficer} onChangeText={setFieldOfficer} placeholder="Field officer" />

//           <Text style={styles.label}>Place</Text>
//           <AppDropdown data={PLACES} value={repoPlace} onChange={setRepoPlace} placeholder="Select place" />

//           <Text style={styles.label}>Vehicle Condition</Text>
//           <AppDropdown data={VEHICLE_CONDITION} value={vehicleCondition} onChange={setVehicleCondition} placeholder="Select condition" />

//           <Text style={styles.label}>Inventory</Text>
//           <TextInput
//             style={[styles.input, styles.textarea]}
//             value={inventory}
//             onChangeText={setInventory}
//             placeholder="Items inside vehicle..."
//             multiline
//           />

//           <Text style={styles.label}>Remarks</Text>
//           <TextInput
//             style={[styles.input, styles.textarea]}
//             value={remarks}
//             onChangeText={setRemarks}
//             placeholder="Any additional remarks..."
//             multiline
//           />
//         </View>

//         {/* Post-Repo Info */}
//         <View style={styles.card}>
//           <Text style={styles.section}>Post-Repossession</Text>
//           <TextInput style={styles.input} value={yardLocation} onChangeText={setYardLocation} placeholder="Yard Location" />
//           <TextInput style={styles.input} value={yardIncharge} onChangeText={setYardIncharge} placeholder="Yard In-charge" />
//           <TextInput style={styles.input} value={yardContact} onChangeText={setYardContact} placeholder="Yard Contact" keyboardType="numeric" />
//           <TextInput style={styles.input} value={yardReceipt} onChangeText={setYardReceipt} placeholder="Yard Receipt No." />

//           <Text style={styles.label}>Post-Repossession Remarks</Text>
//           <TextInput
//             style={[styles.input, styles.textarea]}
//             value={postRemarks}
//             onChangeText={setPostRemarks}
//             placeholder="Notes after vehicle moved to yard, inventory at yard, condition, etc."
//             multiline
//           />
//         </View>

//         {/* Photos */}
//         <View style={styles.card}>
//           <Text style={styles.section}>Photos ({photoCount()}/{MAX_ALLOWED_PHOTOS})</Text>

//           <Text style={styles.subsection}>Pre-Repossession</Text>
//           <View style={styles.grid3}>
//             <Suspense fallback={<ActivityIndicator style={{ margin: 10 }} />}>
//               {prePhotoEntries.map(([id, file]) => (
//                 <View key={id} style={styles.tileWrapper3}>
//                   <LabeledPhotoTile
//                     id={id}
//                     file={file}
//                     styles={styles}
//                     editingId={editingId}
//                     setEditingId={setEditingId}
//                     askPhotoSource={askPhotoSource}
//                     setPhotos={setPhotos}
//                   />
//                 </View>
//               ))}
//             </Suspense>
//             <View style={styles.tileWrapper3}>
//               <Pressable style={styles.photoTile} onPress={addPre} disabled={!canAdd()}>
//                 <Text style={styles.photoPlaceholder}>+ Add</Text>
//               </Pressable>
//             </View>
//           </View>

//           <Text style={[styles.subsection, { marginTop: 12 }]}>Post-Repossession</Text>
//           <View style={styles.grid3}>
//             <Suspense fallback={<ActivityIndicator style={{ margin: 10 }} />}>
//               {postPhotoEntries.map(([id, file]) => (
//                 <View key={id} style={styles.tileWrapper3}>
//                   <LabeledPhotoTile
//                     id={id}
//                     file={file}
//                     styles={styles}
//                     editingId={editingId}
//                     setEditingId={setEditingId}
//                     askPhotoSource={askPhotoSource}
//                     setPhotos={setPhotos}
//                   />
//                 </View>
//               ))}
//             </Suspense>
//             <View style={styles.tileWrapper3}>
//               <Pressable style={styles.photoTile} onPress={addPost} disabled={!canAdd()}>
//                 <Text style={styles.photoPlaceholder}>+ Add</Text>
//               </Pressable>
//             </View>
//           </View>

//           <Text style={styles.helper}>
//             Minimum {MIN_REQUIRED_PHOTOS} Pre-Repossession photos and 2 Post-Repossession photos are required.
//           </Text>
//         </View>

//         {/* Submit */}
//         <Pressable
//           style={[styles.btnPrimary, submitting && { opacity: 0.7 }]}
//           onPress={handleSubmit}
//           disabled={submitting}
//         >
//           <Text style={styles.btnPrimaryText}>
//             {submitting ? 'Submitting...' : 'Submit'}
//           </Text>
//         </Pressable>

//         <View style={{ height: 24 }} />
//       </ScrollView>
//       <Loader visible={submitting} />
//     </SafeAreaView>
//   );
// }

// function AppDropdown({ data, value, onChange, placeholder = 'Select' }) {
//   return (
//     <Dropdown
//       data={data}
//       labelField="label"
//       valueField="value"
//       value={value}
//       placeholder={placeholder}
//       style={styles.dropdown}
//       placeholderStyle={styles.dropdownPlaceholder}
//       selectedTextStyle={styles.dropdownSelected}
//       onChange={(item) => onChange(item?.value ?? null)}
//       renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
//     />
//   );
// }





// src/screens/RepossessionScreen.jsx
import React, { useMemo, useState, useRef, useEffect, Suspense, lazy } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loader from '../components/loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import styles from '../utils/RepoStyle';

import { getAuthToken } from '../components/authToken';
import { getCurrentLocation } from '../components/function';
import { BACKEND_BASE_URL } from '@env';

// Constants & helpers
import {
  REPO_REASONS,
  VEHICLE_CONDITION,
  PLACES,
  MIN_REQUIRED_PHOTOS,
  MAX_ALLOWED_PHOTOS,
  PAN_REGEX,
  PHONE_REGEX,
  MIN_PARTNER_ID_LENGTH,
  detectType,
  photoCount as countPhotos,
  canAddMore,
  useDebouncedCallback,
  buildRepoFormData,
  createResetForm,
} from '../utils/index';
import apiClient from '../server/apiClient';

const LabeledPhotoTile = lazy(() => import('../components/LabeledPhotoTile'));

export default function RepossessionScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [autoFetching, setAutoFetching] = useState(false);
  const [autoFetchBusyKey, setAutoFetchBusyKey] = useState(null);
  const [editingId, setEditingId] = useState(null);

  // Product selection
  const [product, setProduct] = useState(null);
  const [permissions, setPermissions] = useState([]);

  // Search fields
  const [mobile, setMobile] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [lanId, setLanId] = useState('');           // ← NEW FIELD
  const [partnerLoanId, setPartnerLoanId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Vehicle info
  const [makeModel, setMakeModel] = useState('');
  const [regNo, setRegNo] = useState('');
  const [chassisNo, setChassisNo] = useState('');
  const [engineNo, setEngineNo] = useState('');
  const [batteryNo, setBatteryNo] = useState('');

  // Repo info
  const [repoDate, setRepoDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repoReason, setRepoReason] = useState(null);
  const [agency, setAgency] = useState('');
  const [fieldOfficer, setFieldOfficer] = useState('');

  // Details
  const [repoPlace, setRepoPlace] = useState(null);
  const [vehicleCondition, setVehicleCondition] = useState(null);
  const [inventory, setInventory] = useState('');
  const [remarks, setRemarks] = useState('');

  // Post repo
  const [yardLocation, setYardLocation] = useState('');
  const [yardIncharge, setYardIncharge] = useState('');
  const [yardContact, setYardContact] = useState('');
  const [yardReceipt, setYardReceipt] = useState('');
  const [postRemarks, setPostRemarks] = useState('');

  // GPS
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Photos
  const [photos, setPhotos] = useState({});

  // Refs
  const scrollRef = useRef(null);
  const lastFetchRef = useRef({ phone: '', pan: '', lan: '', pli: '' });

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setPermissions(user.permissions || []);
        }
      } catch (e) {
        console.error('Failed to load permissions', e);
      }
    };
    loadPermissions();
  }, []);

  const productOptions = useMemo(
    () =>
      permissions
        .map((p) => ({
          label: p.charAt(0).toUpperCase() + p.slice(1),
          value: p,
        }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    [permissions]
  );

  // Helpers
  const photoCount = () => countPhotos(photos);
  const canAdd = () => canAddMore(photos);

  const captureLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      const lat = loc?.latitude ?? loc?.coords?.latitude;
      const lon = loc?.longitude ?? loc?.coords?.longitude;

      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        setLatitude(lat);
        setLongitude(lon);
        return { latitude: lat, longitude: lon }; // ✅ IMPORTANT
      }
    } catch (e) {
      console.log('Location error:', e);
    }
    return null;
  };


  const askPhotoSource = (id) => {
    Alert.alert('Add Photo', '', [
      { text: 'Camera', onPress: () => takePhoto(id) },
      { text: 'Gallery', onPress: () => pickPhoto(id) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const takePhoto = async (id) => {
    try {
      const res = await launchCamera({ mediaType: 'photo', quality: 0.8 });
      if (res?.assets?.length) {
        const a = res.assets[0];
        setPhotos((p) => ({
          ...p,
          [id]: {
            ...(p[id] || {}),
            uri: a.uri,
            type: a.type || 'image/jpeg',
            fileName: a.fileName || `${id}.jpg`,
            label: p[id]?.label ?? '',
          },
        }));
      }
    } catch { }
  };

  const pickPhoto = async (id) => {
    try {
      const currentCount = Object.values(photos).filter((p) => p?.uri).length;
      const remaining = Math.max(0, MAX_ALLOWED_PHOTOS - currentCount);
      if (remaining <= 0) {
        return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
      }

      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: remaining,
        includeBase64: false,
      });

      if (res?.didCancel) return;
      const assets = res?.assets || [];
      if (!assets.length) return;

      setPhotos((prev) => {
        const next = { ...prev };
        const prefix = id.startsWith('pre_') ? 'pre' : 'post';
        assets.forEach((a, idx) => {
          const targetId = idx === 0 ? id : `${prefix}_${Date.now()}_${idx}`;
          next[targetId] = {
            ...(prev[targetId] || {}),
            uri: a.uri,
            type: a.type || 'image/jpeg',
            fileName: a.fileName || `${targetId}.jpg`,
            label: prev[targetId]?.label ?? '',
          };
        });
        return next;
      });
    } catch (err) {
      console.warn('pickPhoto error', err);
    }
  };

  const handleDateChange = (_e, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const d = new Date(repoDate);
      d.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setRepoDate(d);
      if (Platform.OS === 'android') setShowTimePicker(true);
    }
  };

  const handleTimeChange = (_e, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const d = new Date(repoDate);
      d.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      setRepoDate(d);
    }
  };

  const validateBasics = () => {
    const errors = [];
    if (!product) errors.push('Select product');
    if (!partnerLoanId && !lanId && !vehicleNumber) {
      errors.push('Enter LAN ID or Partner Loan ID or Vehicle No');
    }
    if (!repoReason) errors.push('Select repossession reason');
    if (!repoPlace) errors.push('Select place of repossession');
    if (!vehicleCondition) errors.push('Select vehicle condition');

    const preCount = Object.entries(photos).filter(([id, f]) => detectType(id) === 'PRE' && f?.uri).length;
    const postCount = Object.entries(photos).filter(([id, f]) => detectType(id) === 'POST' && f?.uri).length;

    if (preCount < MIN_REQUIRED_PHOTOS) errors.push(`At least ${MIN_REQUIRED_PHOTOS} Pre-Repossession photos required`);
    if (postCount < 2) errors.push('At least 2 Post-Repossession photos required');

    const unlabeled = Object.entries(photos).filter(([_, f]) => f?.uri && !f?.label?.trim());
    if (unlabeled.length) errors.push('Please label all uploaded photos');

    if (errors.length) {
      Alert.alert('Missing Information', errors.join('\n'));
      return false;
    }
    return true;
  };

  const resetForm = createResetForm({
    Keyboard,
    lastFetchRef,
    scrollRef,
    setters: {
      setProduct,
      setMobile,
      setPanNumber,
      setLanId,              // ← added
      setPartnerLoanId,
      setVehicleNumber,
      setCustomerName,
      setMakeModel,
      setRegNo,
      setChassisNo,
      setEngineNo,
      setBatteryNo,
      setRepoDate,
      setShowDatePicker,
      setShowTimePicker,
      setRepoReason,
      setAgency,
      setFieldOfficer,
      setRepoPlace,
      setVehicleCondition,
      setInventory,
      setRemarks,
      setYardLocation,
      setYardIncharge,
      setYardContact,
      setYardReceipt,
      setPostRemarks,
      setLatitude,
      setLongitude,
      setPhotos,
      setEditingId,
      setAutoFetching,
    },
  });

  // const handleSubmit = async () => {
  //   if (!validateBasics()) return;
  //   setSubmitting(true);

  //   try {
  //     const payload = {
  //       product,
  //       base: { mobile, panNumber, lanId, partnerLoanId, vehicleNumber, customerName }, // ← added lanId
  //       vehicle: { makeModel, regNo, chassisNo, engineNo, batteryNo },
  //       meta: { repoDate, repoReason, agency, fieldOfficer, repoPlace, vehicleCondition, inventory, remarks },
  //       post: { yardLocation, yardIncharge, yardContact, yardReceipt, postRemarks },
  //       coords: { latitude, longitude },
  //       photos,
  //     };

  //     const [_, token] = await Promise.all([captureLocation(), getAuthToken()]);

  //     const fd = buildRepoFormData(payload);

  //     await apiClient.post(`/repossession`, fd, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'multipart/form-data',
  //       },
  //       timeout: 20000,
  //     });

  //     Alert.alert('Success', '✅Repossession details submitted successfully.');
  //     resetForm();
  //   } catch (e) {
  //     const msg =
  //       e?.response?.data?.error ||
  //       e?.response?.data?.message ||
  //       e.message ||
  //       'Failed to submit repossession';
  //     Alert.alert('Error', msg);
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  const handleSubmit = async () => {
    if (!validateBasics()) return;
    setSubmitting(true);

    try {
      // 1️⃣ Get location
      const coords = await captureLocation();

      if (!coords) {
        Alert.alert('Location Error', 'Unable to fetch GPS location');
        return;
      }

      // 2️⃣ Token
      const token = await getAuthToken();

      // 3️⃣ Build payload using RETURNED coords (not state)
      const payload = {
        product,
        base: { mobile, panNumber, lanId, partnerLoanId, vehicleNumber, customerName },
        vehicle: { makeModel, regNo, chassisNo, engineNo, batteryNo },
        meta: { repoDate, repoReason, agency, fieldOfficer, repoPlace, vehicleCondition, inventory, remarks },
        post: { yardLocation, yardIncharge, yardContact, yardReceipt, postRemarks },
        coords, // ✅ FIXED
        photos,
      };

      const fd = buildRepoFormData(payload);

      // 🔍 DEBUG (optional but recommended once)
      console.log('Submitting lat/lon:', coords);

      await apiClient.post(`/repossession`, fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 20000,
      });

      Alert.alert('Success', '✅Repossession details submitted successfully.');

      resetForm();
      setLanId('');
      lastFetchRef.current.lan = '';
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to submit repossession');
    } finally {
      setSubmitting(false);
    }
  };


  // ────────────────────────────────────────────────
  //  Auto Fetch – single endpoint
  // ────────────────────────────────────────────────
  const performAutoFetch = async (searchParams, fieldKey) => {
    if (!product) {
      console.log('[AUTO-FETCH] No product selected');
      return;
    }

    if (autoFetching) {
      console.log('[AUTO-FETCH] Already fetching — skipping');
      return;
    }

    setAutoFetching(true);
    setAutoFetchBusyKey(fieldKey);

    try {
      const token = await getAuthToken();

      const url = `${BACKEND_BASE_URL}/lms/user-Details`;

      const params = {
        ...searchParams,
        product: product.toLowerCase().trim(),
      };

      console.log(`[AUTO-FETCH] → ${url}?${new URLSearchParams(params).toString()}`);
      console.log('[AUTO-FETCH] Params:', params);

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log('[AUTO-FETCH] Status:', response.status);

      const data = response.data?.data || response.data?.result || response.data || [];
      const records = Array.isArray(data) ? data : [data];

      if (!records.length) {
        console.log('[AUTO-FETCH] No matching record found');
        return;
      }

      const record = records[0];
      console.log('[AUTO-FETCH] Record found:', record);

      setCustomerName(record.customerName || record.name || record.fullName || '');
      setPanNumber(record.panNumber || record.pan || '');
      setLanId(record.lan || record.lanId || record.loanAccountNumber || '');   // ← fill LAN ID
      setPartnerLoanId(record.partnerLoanId || record.partnerLan || '');
      setMobile(record.mobileNumber || record.mobile || record.phone || '');

      if (record.vehicleNumber || record.vehicleNo || record.regNo) {
        setVehicleNumber(record.vehicleNumber || record.vehicleNo || record.regNo || '');
      }
    } catch (err) {
      console.log('[AUTO-FETCH] Failed:', err.message);
      if (err.response) {
        console.log('Response data:', err.response.data);
        console.log('Status:', err.response.status);
      }
    } finally {
      setAutoFetching(false);
      setAutoFetchBusyKey(null);
    }
  };

  const debouncedFetchPhone = useDebouncedCallback((value) => {
    if (value.length !== 10 || !PHONE_REGEX.test(value)) return;
    if (lastFetchRef.current.phone === value) return;

    console.log('[PHONE] Debounced fetch:', value);
    lastFetchRef.current.phone = value;
    performAutoFetch({ mobileNumber: value }, 'phone');
  }, 450);

  const debouncedFetchPAN = useDebouncedCallback((value) => {
    if (value.length !== 10 || !PAN_REGEX.test(value)) return;
    if (lastFetchRef.current.pan === value) return;

    console.log('[PAN] Debounced fetch:', value);
    lastFetchRef.current.pan = value;
    performAutoFetch({ panNumber: value }, 'pan');
  }, 450);

  const debouncedFetchLAN = useDebouncedCallback((value) => {
    const trimmed = (value || '').trim();
    if (trimmed.length < 6) return; // adjust min length as needed
    if (lastFetchRef.current.lan === trimmed) return;

    console.log('[LAN] Debounced fetch:', trimmed);
    lastFetchRef.current.lan = trimmed;
    performAutoFetch({ lan: trimmed }, 'lan'); // change to loanId / lanId if backend expects different key
  }, 500);

  const debouncedFetchPartnerId = useDebouncedCallback((value) => {
    const trimmed = (value || '').trim();
    if (trimmed.length < MIN_PARTNER_ID_LENGTH) return;
    if (lastFetchRef.current.pli === trimmed) return;

    console.log('[PARTNER ID] Debounced fetch:', trimmed);
    lastFetchRef.current.pli = trimmed;
    performAutoFetch({ partnerLoanId: trimmed }, 'pli');
  }, 500);

  // ────────────────────────────────────────────────
  //  Photo Sections
  // ────────────────────────────────────────────────
  const prePhotoEntries = useMemo(
    () => Object.entries(photos).filter(([id]) => id.startsWith('pre_')),
    [photos]
  );

  const postPhotoEntries = useMemo(
    () => Object.entries(photos).filter(([id]) => id.startsWith('post_')),
    [photos]
  );

  const addPre = () => {
    if (!canAdd()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
    const id = `pre_${Date.now()}`;
    setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
    setTimeout(() => askPhotoSource(id), 0);
  };

  const addPost = () => {
    if (!canAdd()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
    const id = `post_${Date.now()}`;
    setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
    setTimeout(() => askPhotoSource(id), 0);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'none'}
        nestedScrollEnabled
      >
        <Text style={styles.h1}>Vehicle Repossession</Text>

        {/* CUSTOMER SEARCH */}
        <View style={styles.card}>
          <Text style={styles.section}>Enter Customer Details</Text>

          <Text style={styles.label}>Product</Text>
          <Dropdown
            data={productOptions}
            labelField="label"
            valueField="value"
            value={product}
            placeholder="Select product"
            style={styles.dropdown}
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelected}
            onChange={(item) => setProduct(item?.value ?? null)}
            renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, 10);
              setMobile(cleaned);
              if (cleaned.length === 10) {
                debouncedFetchPhone(cleaned);
              } else if (lastFetchRef.current.phone) {
                lastFetchRef.current.phone = '';
              }
            }}
            keyboardType="phone-pad"
            placeholder="10-digit mobile"
            maxLength={10}
          />
          {autoFetchBusyKey === 'phone' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

          <Text style={styles.label}>PAN</Text>
          <TextInput
            style={styles.input}
            value={panNumber}
            onChangeText={(text) => {
              const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
              setPanNumber(cleaned);
              if (cleaned.length === 10 && PAN_REGEX.test(cleaned)) {
                debouncedFetchPAN(cleaned);
              } else if (lastFetchRef.current.pan) {
                lastFetchRef.current.pan = '';
              }
            }}
            autoCapitalize="characters"
            placeholder="ABCDE1234F"
            maxLength={10}
          />
          {autoFetchBusyKey === 'pan' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

          <Text style={styles.label}>LAN ID</Text> {/* ← NEW FIELD */}
          <TextInput
            style={styles.input}
            value={lanId}
            onChangeText={(text) => {
              const trimmed = text.trim();
              setLanId(trimmed);
              debouncedFetchLAN(trimmed);
            }}
            placeholder="Enter LAN ID"
            autoCapitalize="characters"
          />
          {autoFetchBusyKey === 'lan' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

          <Text style={styles.label}>Partner Loan ID</Text>
          <TextInput
            style={styles.input}
            value={partnerLoanId}
            onChangeText={(text) => {
              setPartnerLoanId(text);
              debouncedFetchPartnerId(text);
            }}
            placeholder="Partner Loan ID"
          />
          {autoFetchBusyKey === 'pli' && <ActivityIndicator size="small" style={{ marginTop: 6 }} />}

          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
            placeholder="Enter vehicle number"
          />

          <Text style={styles.label}>Customer Name</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Auto-filled or manual"
            autoCapitalize="words"
          />
        </View>

        {/* VEHICLE INFO */}
        <View style={styles.card}>
          <Text style={styles.section}>Vehicle</Text>
          <TextInput
            style={styles.input}
            placeholder="Make / Model / Variant"
            value={makeModel}
            onChangeText={setMakeModel}
          />
          <TextInput
            style={styles.input}
            placeholder="Registration No."
            value={regNo}
            onChangeText={setRegNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Chassis No."
            value={chassisNo}
            onChangeText={setChassisNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Engine No."
            value={engineNo}
            onChangeText={setEngineNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Battery No."
            value={batteryNo}
            onChangeText={setBatteryNo}
          />
        </View>

        {/* REPOSSESSION DETAILS */}
        <View style={styles.card}>
          <Text style={styles.section}>Repossession</Text>

          <Text style={styles.label}>Date & Time</Text>
          <View style={styles.row}>
            <Pressable style={styles.btn} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.btnText}>Pick Date</Text>
            </Pressable>
            <View style={{ width: 8 }} />
            <Pressable
              style={styles.btn}
              onPress={() => (Platform.OS === 'android' ? setShowTimePicker(true) : setShowDatePicker(true))}
            >
              <Text style={styles.btnText}>Pick Time</Text>
            </Pressable>
            <Text style={styles.dateText}>
              {repoDate.toLocaleDateString()} {repoDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={repoDate}
              mode="date"
              is24Hour
              display="default"
              onChange={handleDateChange}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={repoDate}
              mode="time"
              is24Hour
              display="default"
              onChange={handleTimeChange}
            />
          )}

          <Text style={styles.label}>Reason</Text>
          <Dropdown
            data={REPO_REASONS}
            labelField="label"
            valueField="value"
            value={repoReason}
            placeholder="Select reason"
            style={styles.dropdown}
            onChange={(item) => setRepoReason(item?.value ?? null)}
            renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
          />

          <Text style={styles.label}>Agency</Text>
          <TextInput style={styles.input} value={agency} onChangeText={setAgency} placeholder="Agency name" />

          <Text style={styles.label}>Field Officer</Text>
          <TextInput style={styles.input} value={fieldOfficer} onChangeText={setFieldOfficer} placeholder="Field officer" />

          <Text style={styles.label}>Place</Text>
          <Dropdown
            data={PLACES}
            labelField="label"
            valueField="value"
            value={repoPlace}
            placeholder="Select place"
            style={styles.dropdown}
            onChange={(item) => setRepoPlace(item?.value ?? null)}
            renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
          />

          <Text style={styles.label}>Vehicle Condition</Text>
          <Dropdown
            data={VEHICLE_CONDITION}
            labelField="label"
            valueField="value"
            value={vehicleCondition}
            placeholder="Select condition"
            style={styles.dropdown}
            onChange={(item) => setVehicleCondition(item?.value ?? null)}
            renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
          />

          <Text style={styles.label}>Inventory</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={inventory}
            onChangeText={setInventory}
            placeholder="Items inside vehicle..."
            multiline
          />

          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Any additional remarks..."
            multiline
          />
        </View>

        {/* POST REPO */}
        <View style={styles.card}>
          <Text style={styles.section}>Post-Repossession</Text>
          <TextInput style={styles.input} value={yardLocation} onChangeText={setYardLocation} placeholder="Yard Location" />
          <TextInput style={styles.input} value={yardIncharge} onChangeText={setYardIncharge} placeholder="Yard In-charge" />
          <TextInput
            style={styles.input}
            value={yardContact}
            onChangeText={setYardContact}
            placeholder="Yard Contact"
            keyboardType="numeric"
          />
          <TextInput style={styles.input} value={yardReceipt} onChangeText={setYardReceipt} placeholder="Yard Receipt No." />

          <Text style={styles.label}>Post-Repossession Remarks</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={postRemarks}
            onChangeText={setPostRemarks}
            placeholder="Notes after vehicle moved to yard..."
            multiline
          />
        </View>

        {/* PHOTOS */}
        <View style={styles.card}>
          <Text style={styles.section}>Photos ({photoCount()}/{MAX_ALLOWED_PHOTOS})</Text>

          <Text style={styles.subsection}>Pre-Repossession</Text>
          <View style={styles.grid3}>
            <Suspense fallback={<ActivityIndicator style={{ margin: 10 }} />}>
              {prePhotoEntries.map(([id, file]) => (
                <View key={id} style={styles.tileWrapper3}>
                  <LabeledPhotoTile
                    id={id}
                    file={file}
                    styles={styles}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    askPhotoSource={askPhotoSource}
                    setPhotos={setPhotos}
                  />
                </View>
              ))}
            </Suspense>
            <View style={styles.tileWrapper3}>
              <Pressable style={styles.photoTile} onPress={addPre} disabled={!canAdd()}>
                <Text style={styles.photoPlaceholder}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          <Text style={[styles.subsection, { marginTop: 12 }]}>Post-Repossession</Text>
          <View style={styles.grid3}>
            <Suspense fallback={<ActivityIndicator style={{ margin: 10 }} />}>
              {postPhotoEntries.map(([id, file]) => (
                <View key={id} style={styles.tileWrapper3}>
                  <LabeledPhotoTile
                    id={id}
                    file={file}
                    styles={styles}
                    editingId={editingId}
                    setEditingId={setEditingId}
                    askPhotoSource={askPhotoSource}
                    setPhotos={setPhotos}
                  />
                </View>
              ))}
            </Suspense>
            <View style={styles.tileWrapper3}>
              <Pressable style={styles.photoTile} onPress={addPost} disabled={!canAdd()}>
                <Text style={styles.photoPlaceholder}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.helper}>
            Minimum {MIN_REQUIRED_PHOTOS} Pre-Repossession and 2 Post-Repossession photos required.
          </Text>
        </View>

        {/* SUBMIT */}
        <Pressable
          style={[styles.btnPrimary, submitting && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.btnPrimaryText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Loader visible={submitting || autoFetching} />
    </SafeAreaView>
  );
}