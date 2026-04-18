import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_BASE_URL } from '@env';
import { copyFile } from 'react-native-fs';


const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
});

apiClient.interceptors.request.use(
  async config => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const customerId = await AsyncStorage.getItem('customerId');
    if (customerId) {
      config.headers['X-Customer-ID'] = customerId;
    }
    return config;
  },
  error => Promise.reject(error),
);

export async function getCustomerProfile() {
  try {
    const response = await apiClient.get('/customer/profile');
    const rawData = response.data?.data || response.data;
    
    // Map backend response to frontend profile structure
    const mappedData = {
      fullName: rawData.customerName,
      fatherName: rawData.fatherName,
      aadhaar: rawData.aadhar,
      panCard: rawData.panNumber,
      dateOfBirth: rawData.dob,
      address: rawData.address,
      city: rawData.city,
      state: rawData.state,
      lan: rawData.lan,
      partnerLoanId: rawData.partnerLoanId,
      loanAmount: rawData.approvedLoanAmount,
      emiAmount: rawData.emiAmount,
      tenure: rawData.tenure,
      status: rawData.status,
      accountNumber: rawData.accountNumber,
      ifsc: rawData.ifsc,
      // Business details excluded per requirement
    };
    console.log("profile data-->",mappedData)
    return {
      success: true,
      data: mappedData,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to load profile',
    };
  }
}


export async function initiateCustomerPayment(payload) {
  try {
    const response = await apiClient.post('/easebuzz/collect', {
      loanId: payload.loanId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod || 'UPI',
    });
    return {
      success: response.data?.success ?? true,
      data: response.data,
      txnId: response.data?.txnId,
      paymentUrl: response.data?.paymentUrl,
      error: response.data?.message,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Payment failed',
    };
  }
}

export async function verifyCustomerPayment(merchantTxn) {
  try {
    console.log("merchantTxn-->",merchantTxn)
    const response = await apiClient.get(
      `payments/easebuzz/payment-status/${merchantTxn}`,
    );
    return {
      success: true,
      data: response.data,
      paymentDone: response.data?.payment_done ?? false,
      status: response.data?.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify payment',
    };
  }
}

export async function getUpcomingEmi() {
  try {
    const response = await apiClient.get('/customer/upcoming-emi');
    return {
      success: true,
      data: response.data?.data || null,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
}

export async function getCustomerLoanDetails() {
  try {
    const response = await apiClient.get('/customer/loan-details');
    return {
      success: true,
      data: response.data?.data || response.data,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to load loan details',
    };
  }
}

export async function getCustomerPaymentHistory() {
  try {
    const response = await apiClient.get('/customer/payment-history');
    console.log("payment history-->",response.data)
    return {
      success: true,
      data: response.data?.data || response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        'Failed to load payment history',
    };
  }
}

export default apiClient;
