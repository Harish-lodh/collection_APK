import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { getCurrentLocation } from '../components/function';
import { BACKEND_BASE_URL } from '@env';
import Loader from '../components/loader';
import { startTracking } from '../components/bgTracking';

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState('RM');
  const [otpSent, setOtpSent] = useState(false);
  const [products, setProducts] = useState([
    'Embifi',
    'Malhotra',
    'HeyEV',
    'HeyEV Battery',
  ]);
  const [selectedProduct, setSelectedProduct] = useState('Embifi');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/customer/getProducts`);

        const cleanProducts = res.data.data.map(p => p.trim());

        console.log('Products from API:', cleanProducts);

        setProducts(cleanProducts);
        setSelectedProduct(cleanProducts[0]);
      } catch (err) {
        console.log('Product fetch failed:', err);

        setProducts(['Embifi', 'Malhotra', 'HeyEV', 'HeyEV Battery']);
        setSelectedProduct('Embifi');
      }
    };
    if (loginType === 'CUSTOMER') {
      fetchProducts();
    }
  }, [loginType]);

  const sendOtp = async () => {
    if (!mobile || mobile.length !== 10) {
      return Alert.alert(
        'Error',
        'Please enter a valid 10-digit mobile number',
      );
    }
    setLoading(true);
    try {
      const res = await axios.post(
        `${BACKEND_BASE_URL}/auth/customer/send-otp`,
        {
          mobile: mobile,
          product: selectedProduct,
        },
      );
      if (res.data.success) {
        setOtpSent(true);
        Alert.alert('Success', 'OTP sent to your mobile number');
      } else {
        Alert.alert('Error', res.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerLogin = async () => {
    if (!mobile || !otp) {
      return Alert.alert('Error', 'Mobile number and OTP are required');
    }
    setLoading(true);
    try {
      const res = await axios.post(`${BACKEND_BASE_URL}/auth/customer/login`, {
        mobile: mobile,
        otp: otp,
        product: selectedProduct,
      });
    if (res.data.token) {
  await AsyncStorage.setItem('token', String(res.data.token));
  await AsyncStorage.setItem('customerId', String(res.data.customerId));
  await AsyncStorage.setItem('role', 'CUSTOMER');
  await AsyncStorage.setItem('product', selectedProduct);

  onLoginSuccess('CUSTOMER');
} else {
        Alert.alert('Error', 'No token received from server');
      }
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRmLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Email and password are required');
    }
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      if (!location) {
        setLoading(false);
        return Alert.alert(
          'Error',
          'Location permission is required to log in.',
        );
      }
      console.log('backend_url :', BACKEND_BASE_URL);
      const res = await axios.post(`${BACKEND_BASE_URL}/auth/login`, {
        email,
        password,
        timestamp: location?.timestamp ?? new Date().toISOString(),
      });
      if (res.data.token) {
        await AsyncStorage.setItem('token', res.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        await AsyncStorage.setItem(
          'permissions',
          JSON.stringify(res.data.user?.permissions),
        );
        await AsyncStorage.setItem('role', 'RM');

        const sessionId = Math.random().toString(36).slice(2, 7);
        console.log('sessionId', sessionId);
        await AsyncStorage.setItem('sessionId', sessionId);

        console.log('starting watch');
        await startTracking(300000, 'Login');
        onLoginSuccess('RM');
      } else {
        Alert.alert('Error', 'No token received from server');
      }
    } catch (err) {
      Alert.alert('Login failed', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (loginType === 'CUSTOMER') {
      if (!otpSent) {
        sendOtp();
      } else {
        handleCustomerLogin();
      }
    } else {
      handleRmLogin();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Loader visible={loading} />

      <Text style={styles.title}>Login</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginType === 'RM' && styles.toggleActive,
          ]}
          onPress={() => {
            setLoginType('RM');
            setOtpSent(false);
          }}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === 'RM' && styles.toggleTextActive,
            ]}
          >
            RM Login
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            loginType === 'CUSTOMER' && styles.toggleActive,
          ]}
          onPress={() => {
            setLoginType('CUSTOMER');
            setOtpSent(false);
          }}
        >
          <Text
            style={[
              styles.toggleText,
              loginType === 'CUSTOMER' && styles.toggleTextActive,
            ]}
          >
            Customer Login
          </Text>
        </TouchableOpacity>
      </View>

      {loginType === 'RM' ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </>
      ) : (
        <>
          {!otpSent && (
            <View style={styles.productContainer}>
              <Text style={styles.productLabel}>Select Product</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setShowDropdown(!showDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedProduct || 'Select Product'}
                </Text>
                <Text style={styles.dropdownArrow}>
                  {showDropdown ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              {showDropdown && (
                <ScrollView style={styles.dropdownList}>
                  {products.map((product, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedProduct === product &&
                          styles.dropdownItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedProduct(product);
                        setShowDropdown(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedProduct === product &&
                            styles.dropdownItemTextSelected,
                        ]}
                      >
                        {product}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={mobile}
            onChangeText={text => {
              setMobile(text);
              setOtpSent(false);
            }}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {otpSent && (
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading
            ? 'Logging in...'
            : loginType === 'CUSTOMER' && !otpSent
            ? 'Send OTP'
            : 'Login'}
        </Text>
      </TouchableOpacity>

      {loginType === 'CUSTOMER' && otpSent && (
        <TouchableOpacity
          style={styles.resendButton}
          onPress={sendOtp}
          disabled={loading}
        >
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  toggleActive: {
    backgroundColor: '#0a7',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#0a7',
    padding: 15,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#0a7',
    fontSize: 14,
    fontWeight: '600',
  },
  productContainer: {
    marginBottom: 12,
  },
  productLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemSelected: {
    backgroundColor: '#0a7',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
