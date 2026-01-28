import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { launchCamera } from 'react-native-image-picker';
import { getCurrentLocation } from '../components/function';
import { BACKEND_BASE_URL } from '@env';
import { NOT_PAID_REASONS } from '../utils';

const CustomerVisitScreen = () => {
  /* ---------------- PRODUCT ---------------- */
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [openProduct, setOpenProduct] = useState(false);

  /* ---------------- SEARCH INPUTS ---------------- */
  const [loanId, setLoanId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [customerName, setCustomerName] = useState('');

  /* ---------------- FETCHED DATA ---------------- */
  const [lender, setLender] = useState('');
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  /* ---------------- MULTI CUSTOMER MODAL ---------------- */
  const [customersList, setCustomersList] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  /* ---------------- NOT PAID REASON ---------------- */
  const [notPaidReason, setNotPaidReason] = useState(null);
  const [openReason, setOpenReason] = useState(false);

  const reasonItems = useMemo(() => NOT_PAID_REASONS, []);

  /* ---------------- VISIT ---------------- */
  const [location, setLocation] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  /* ---------------- LOAD PRODUCTS ---------------- */
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const stored = await AsyncStorage.getItem('permissions');
        const permissions = stored ? JSON.parse(stored) : ['Embifi'];

        const items = permissions.map((p) => ({
          label: p,
          value: p.toLowerCase(),
        }));

        setProducts(items);
        setProduct(items[0]?.value || 'embifi');
      } catch (err) {
        console.error('Error loading products:', err);
        setProducts([{ label: 'Embifi', value: 'embifi' }]);
        setProduct('embifi');
      }
    };

    loadProducts();
  }, []);

  /* ---------------- LOCATION ---------------- */
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setLoadingLocation(true);
    const loc = await getCurrentLocation();
    if (loc) setLocation(loc);
    setLoadingLocation(false);
  };

  /* ---------------- CLEAR FILLS ---------------- */
  const clearFetched = () => {
    setLender('');
    setNotPaidReason(null);
    // keep selfie + location as-is
  };

  /* ---------------- APPLY SELECTED CUSTOMER ---------------- */
  const applyCustomer = (data) => {
    setLoanId(data.lan || '');
    setCustomerName(data.customerName || '');
    setMobileNumber(data.mobileNumber || '');
    setLender(data.lender || '');
  };

  /* ---------------- FETCH CUSTOMER ---------------- */
  const fetchCustomer = async (params, fromName = false) => {
    if (!product) {
      Alert.alert('Validation', 'Please select product');
      return;
    }

    setLoadingCustomer(true);

    try {
      const query = new URLSearchParams({ product, ...params }).toString();
      const url = `${BACKEND_BASE_URL}/lms/user-Details?${query}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.data?.length) {
        Alert.alert('Not Found', 'No customer found');
        setLoadingCustomer(false);
        return;
      }

      // If name search, show modal for multiple results
      if (fromName && json.data.length > 1) {
        setCustomersList(json.data);
        setShowCustomerModal(true);
        setLoadingCustomer(false);
        return;
      }

      // Single result
      const data = json.data[0];
      applyCustomer(data);
    } catch (err) {
      console.log('❌ Fetch error:', err);
      Alert.alert('Error', 'Failed to fetch customer details');
    }

    setLoadingCustomer(false);
  };

  const getRmId  = async () => {
  const userStr = await AsyncStorage.getItem('user');
  if (!userStr) return null;

  const user = JSON.parse(userStr);
  return user?.id || null;
};


  /* ---------------- INPUT HANDLERS ---------------- */
  const onLoanIdChange = (v) => {
    setLoanId(v);
    setMobileNumber('');
    setCustomerName('');
    clearFetched();
  };

  const onMobileChange = (v) => {
    const digitsOnly = v.replace(/[^0-9]/g, '');
    setMobileNumber(digitsOnly);
    setLoanId('');
    setCustomerName('');
    clearFetched();

    if (digitsOnly.length === 10) {
      fetchCustomer({ mobileNumber: digitsOnly }, false);
    }
  };

  const onNameChange = (v) => {
    setCustomerName(v);
    setLoanId('');
    setMobileNumber('');
    clearFetched();
  };

  /* ---------------- SELFIE ---------------- */
  const takeSelfie = () => {
    launchCamera(
      { cameraType: 'front', mediaType: 'photo', saveToPhotos: false },
      (res) => {
        if (res.didCancel) return;
        if (res.errorCode) {
          Alert.alert('Camera Error', res.errorMessage);
          return;
        }
        setSelfie(res.assets?.[0] || null);
      }
    );
  };

  /* ---------------- SUBMIT ---------------- */
const submitVisit = async () => {
  if (!loanId) {
    return Alert.alert('Validation', 'Loan ID is required (fetch customer first)');
  }

  if (!location) {
    return Alert.alert('Validation', 'Location is required');
  }

  if (!selfie) {
    return Alert.alert('Validation', 'Selfie is required');
  }

  if (!notPaidReason) {
    return Alert.alert('Validation', 'Please select reason for not paid');
  }

  try {
    const rmId = await getRmId();

    if (!rmId) {
      return Alert.alert('Error', 'User not found. Please login again.');
    }

    const payload = {
      rmId, // ✅ user.id
      loanId,
      customerName,
      mobileNumber,
      lender,
      notPaidReason,
      latitude: location.latitude,
      longitude: location.longitude,
      selfieUri: selfie.uri,
      visitType: 'NOT_PAID',
      visitAt: new Date().toISOString(),
    };

    console.log('✅ FINAL PAYLOAD:', payload);

    await axios.post(
      `${BACKEND_BASE_URL}/customer-visits`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    Alert.alert('Success', 'Customer visit captured');
  } catch (err) {
    console.error('❌ Submit visit error:', err);
    Alert.alert(
      'Error',
      err.response?.data?.message || 'Failed to submit visit'
    );
  }
};


  return (
 <ScrollView
    style={{ flex: 1, backgroundColor: '#fff' }}
    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    keyboardShouldPersistTaps="handled"
    nestedScrollEnabled
  >        
      <Text style={styles.title}>Customer Visit</Text>

      {/* PRODUCT */}
      <DropDownPicker
        open={openProduct}
        value={product}
        items={products}
        setOpen={setOpenProduct}
        setValue={setProduct}
        setItems={setProducts}
        placeholder="Select Product"
        style={styles.input}
        zIndex={4000}
      />

      {/* LOAN ID + FETCH */}
      <TextInput
        style={styles.input}
        placeholder="Loan ID"
        value={loanId}
        onChangeText={onLoanIdChange}
        autoCapitalize="characters"
      />

      <TouchableOpacity
        style={styles.fetchBtn}
        onPress={() => {
          if (!loanId.trim()) {
            Alert.alert('Validation', 'Enter Loan ID');
            return;
          }
          fetchCustomer({ loanId: loanId.trim() }, false);
        }}
      >
        <Text style={styles.fetchText}>Fetch Details (Loan ID)</Text>
      </TouchableOpacity>

      {/* MOBILE (AUTO FETCH ON 10 DIGITS) */}
      <TextInput
        style={styles.input}
        placeholder="Mobile Number (10 digits auto fetch)"
        keyboardType="numeric"
        maxLength={10}
        value={mobileNumber}
        onChangeText={onMobileChange}
      />

      {/* CUSTOMER NAME + FETCH (MODAL FOR MULTIPLE) */}
      <TextInput
        style={styles.input}
        placeholder="Customer Name"
        value={customerName}
        onChangeText={onNameChange}
      />

      <TouchableOpacity
        style={styles.fetchBtn}
        onPress={() => {
          if (customerName.trim().length < 3) {
            Alert.alert('Validation', 'Enter at least 3 characters');
            return;
          }
          fetchCustomer({ customerName: customerName.trim() }, true);
        }}
      >
        <Text style={styles.fetchText}>Fetch Details (Name)</Text>
      </TouchableOpacity>

      {loadingCustomer && <Text style={styles.infoText}>🔍 Fetching customer…</Text>}

      {/* SHOW FETCHED DETAILS */}
      {lender ? (
        <View style={styles.detailsBox}>
          <Text>👤 {customerName}</Text>
          <Text>📞 {mobileNumber}</Text>
          <Text>🏦 {lender}</Text>
          <Text>🆔 {loanId}</Text>
        </View>
      ) : null}

      {/* NOT PAID REASON */}
      <DropDownPicker
        open={openReason}
        value={notPaidReason}
        items={reasonItems}
        setOpen={setOpenReason}
        setValue={setNotPaidReason}
        placeholder="Select Reason (Not Paid)"
        style={styles.input}
        zIndex={3000}
      />

      {/* LOCATION */}
      <View style={styles.locationBox}>
        <Text>
          📍{' '}
          {location
            ? `${location.latitude}, ${location.longitude}`
            : loadingLocation
            ? 'Fetching location...'
            : 'Location not available'}
        </Text>

        {!location && !loadingLocation && (
          <TouchableOpacity onPress={fetchLocation}>
            <Text style={styles.retryText}>Retry Location</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* SELFIE */}
      <TouchableOpacity style={styles.selfieBtn} onPress={takeSelfie}>
        <Text style={styles.btnText}>{selfie ? 'Retake Selfie' : 'Take Selfie'}</Text>
      </TouchableOpacity>

      {selfie && <Image source={{ uri: selfie.uri }} style={styles.selfie} />}

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submitBtn} onPress={submitVisit}>
        <Text style={styles.submitText}>Submit Visit</Text>
      </TouchableOpacity>

      {/* MULTIPLE CUSTOMER MODAL */}
      <Modal visible={showCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Customer</Text>

            <ScrollView>
              {customersList.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.customerCard}
                  onPress={() => {
                    applyCustomer(item);
                    setShowCustomerModal(false);
                  }}
                >
                  <Text style={styles.customerLine}>🆔 Loan: {item.lan}</Text>
                  <Text style={styles.customerLine}>👤 Name: {item.customerName}</Text>
                  <Text style={styles.customerLine}>📞 Mobile: {item.mobileNumber}</Text>
                  <Text style={styles.customerLine}>🏦 Lender: {item.lender}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowCustomerModal(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  </ScrollView>
  );
};

export default CustomerVisitScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
  },

  fetchBtn: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  fetchText: { color: '#fff', fontWeight: '600' },

  infoText: { marginBottom: 10 },

  detailsBox: {
    backgroundColor: '#eef6ff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d6e8ff',
  },

  locationBox: {
    padding: 12,
    backgroundColor: '#f2f2f2',
    borderRadius: 6,
    marginBottom: 12,
  },
  retryText: {
    color: '#007bff',
    marginTop: 6,
    fontWeight: '600',
  },

  selfieBtn: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnText: { color: '#fff', fontWeight: '600' },

  selfie: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 12,
  },

  submitBtn: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontWeight: 'bold' },

  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 8,
    padding: 16,
    maxHeight: '75%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  customerCard: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 10,
  },
  customerLine: { marginBottom: 2 },

  closeBtn: {
    backgroundColor: '#dc3545',
    padding: 10,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 10,
  },
  closeText: { color: '#fff', fontWeight: '600' },
});
