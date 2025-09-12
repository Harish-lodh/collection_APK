import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import { getAuthToken } from '../components/authToken';
import { BACKEND_BASE_URL } from '@env';
import axios from 'axios';
export const selectFromGallery = async () => {
  try {
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.7 });
    if (res.didCancel) return null;
    if (res.errorCode) {
      console.log('gallery error:', res.errorCode, res.errorMessage);
      return null;
    }
    return res.assets?.[0] || null; // return selected image
  } catch (error) {
    console.log('Gallery error:', error);
    return null;
  }
};

export const captureFromCamera = async () => {
  try {
    const res = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true });
    if (res.didCancel) return null;
    if (res.errorCode) {
      console.log('camera error:', res.errorCode, res.errorMessage);
      return null;
    }
    return res.assets?.[0] || null;
  } catch (error) {
    console.log('Camera error:', error);
    return null;
  }
};

export async function fetchPendingCashPayments(collectedBy) {
  const token = await getAuthToken();
  const url = `${BACKEND_BASE_URL}/loanDetails/pending-cash-payments${
    collectedBy ? `?collectedBy=${encodeURIComponent(collectedBy)}` : ''
  }`;
  console.log(url);
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.data || [];
}

export async function uploadPaymentImage2(paymentId, asset) {
  const token = await getAuthToken();
  const name = asset.fileName || `image2_${paymentId}.jpg`;
  const type =
    asset.type || (name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

  const form = new FormData();
  form.append('image2', { uri: asset.uri, name, type });

  await axios.post(`${BACKEND_BASE_URL}/loanDetails/payments/${paymentId}/image2`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}


