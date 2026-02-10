import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
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
  const url = `${BACKEND_BASE_URL}/loanDetails/pending-cash-payments${collectedBy ? `?collectedBy=${encodeURIComponent(collectedBy)}` : ''
    }`;
  console.log(url);
  const { data } = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data?.data || [];
}

export async function uploadPaymentImage2(paymentId, asset, product) {
  const token = await getAuthToken();
  const name = asset.fileName || `image2_${paymentId}.jpg`;
  const type =
    asset.type || (name.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg');

  const form = new FormData();
  form.append('product', product); // 👈 send product

  form.append('image2', { uri: asset.uri, name, type });

  await axios.post(`${BACKEND_BASE_URL}/loanDetails/payments/${paymentId}/image2`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
}


// src/utils/index.js

// ---------- constants ----------
export const PHOTO_SLOTS = ['Front', 'Rear', 'Left', 'Right', 'Interior', 'Damages'];

export const REPO_REASONS = [
  { label: 'NPA', value: 'NPA' },
  { label: 'Default > 90 days', value: 'DEFAULT_90' },
  { label: 'Skip Trace Result', value: 'SKIP_TRACE' },
];

export const VEHICLE_CONDITION = [
  { label: 'Good', value: 'GOOD' },
  { label: 'Damaged', value: 'DAMAGED' },
  { label: 'Modified', value: 'MODIFIED' },
];

export const PLACES = [
  { label: 'Roadside', value: 'ROADSIDE' },
  { label: 'Residence', value: 'RESIDENCE' },
  { label: 'Workplace', value: 'WORKPLACE' },

];

/**
 * Reasons for why payment was not collected
 * Used in Collector & RM modules
 */

export const NOT_PAID_REASONS = [
  {
    label: 'Customer Not Available',
    value: 'CUSTOMER_NOT_AVAILABLE',
  },
  {
    label: 'Customer Refused to Pay',
    value: 'CUSTOMER_REFUSED',
  },
  {
    label: 'Insufficient Funds',
    value: 'INSUFFICIENT_FUNDS',
  },
  {
    label: 'Asked for Time (Promise to Pay)',
    value: 'PROMISE_TO_PAY',
  },
  {
    label: 'Customer surrendered the vehicle',
    value: 'CUSTOMER_SURRENDERED_VEHICLE',
  },
  {
    label: 'Vehicle taken by dealer due to non-payment',
    value: 'VEHICLE_TAKEN_BY_DEALER',
  },
  {
    label: 'Dispute / Issue',
    value: 'DISPUTE',
  },
  {
    label: 'Other',
    value: 'OTHER',
  },
];



export const MIN_REQUIRED_PHOTOS = 3;
export const MAX_ALLOWED_PHOTOS = 10;

export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;
export const PHONE_REGEX = /^\d{10}$/;
export const MIN_PARTNER_ID_LENGTH = 19; // adjust if your server expects different

// ---------- helpers ----------
export const detectType = (id) => {
  if (id?.startsWith?.('post_')) return 'POST';
  if (id?.startsWith?.('pre_')) return 'PRE';
  if (PHOTO_SLOTS.includes(id)) return 'PRE';
  return 'PRE';
};

export const photoCount = (photosObj) =>
  Object.values(photosObj || {}).filter((f) => !!f?.uri).length;

export const canAddMore = (photosObj) =>
  photoCount(photosObj) < MAX_ALLOWED_PHOTOS;

// tiny debounce hook (no external deps)
import { useEffect, useRef } from 'react';
export function useDebouncedCallback(callback, delay = 300) {
  const cbRef = useRef(callback);
  useEffect(() => { cbRef.current = callback; }, [callback]);
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);
  return (...args) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => cbRef.current(...args), delay);
  };
}

export function buildRepoFormData({
  product,
  base = {},
  vehicle = {},
  meta = {},
  post = {},
  coords = {},
  photos = {},
}) {
  const fd = new FormData();

  const appendFields = (obj, keys) => {
    keys.forEach((k) => {
      const v = obj?.[k];
      if (v !== undefined && v !== null && String(v).trim().length) {
        fd.append(k, v);
      }
    });
  };
  if (product) {
    fd.append("product", String(product).toLowerCase());
  }
  // base + vehicle
  appendFields(base, Object.keys(base));
  appendFields(vehicle, Object.keys(vehicle));

  // meta
  if (meta.repoDate instanceof Date && !isNaN(meta.repoDate)) {
    fd.append("repoDate", meta.repoDate.toISOString());
  }
  appendFields(meta, ["repoReason", "agency", "fieldOfficer", "repoPlace", "vehicleCondition", "inventory", "remarks"]);

  // post
  appendFields(post, ["yardLocation", "yardIncharge", "yardContact", "yardReceipt", "postRemarks"]);

  // coords
  if (Number.isFinite(coords.latitude)) fd.append("latitude", String(coords.latitude));
  if (Number.isFinite(coords.longitude)) fd.append("longitude", String(coords.longitude));

  // photos
  Object.entries(photos).forEach(([id, file], i) => {
    if (!file?.uri) return;
    fd.append("photos", {
      uri: file.uri,
      name: file.fileName || `${file.label || id}.jpg`,
      type: file.type || "image/jpeg",
    });
    fd.append("photoTypes[]", detectType(id));
    fd.append("photoLabels[]", file.label || id);
  });

  return fd;
}


// reset form factory — returns a function you can call after submit
export function createResetForm(api) {
  const {
    Keyboard,
    setters, // all your setX functions gathered
    lastFetchRef,
    scrollRef,
  } = api;

  return () => {
    try { Keyboard?.dismiss?.(); } catch { }

    const {
      setMobile, setPanNumber, setPartnerLoanId, setVehicleNumber, setCustomerName,
      setMakeModel, setRegNo, setChassisNo, setEngineNo, setBatteryNo,
      setRepoDate, setShowDatePicker, setShowTimePicker, setRepoReason, setAgency, setFieldOfficer,
      setRepoPlace, setVehicleCondition, setInventory, setRemarks,
      setYardLocation, setYardIncharge, setYardContact, setYardReceipt, setPostRemarks,
      setLatitude, setLongitude, setPhotos, setEditingId, setAutoFetching,
    } = setters;

    // search
    setMobile(''); setPanNumber(''); setPartnerLoanId(''); setVehicleNumber(''); setCustomerName('');

    // vehicle
    setMakeModel(''); setRegNo(''); setChassisNo(''); setEngineNo(''); setBatteryNo('');

    // meta
    setRepoDate(new Date()); setShowDatePicker(false); setShowTimePicker(false);
    setRepoReason(null); setAgency(''); setFieldOfficer('');
    setRepoPlace(null); setVehicleCondition(null); setInventory(''); setRemarks('');

    // post
    setYardLocation(''); setYardIncharge(''); setYardContact(''); setYardReceipt('');
    setPostRemarks('');

    // gps
    setLatitude(null); setLongitude(null);

    // photos & state
    setPhotos({});
    setEditingId(null);
    setAutoFetching(false);
    if (lastFetchRef?.current) lastFetchRef.current = { phone: '', pan: '', pli: '' };

    // jump to top
    try { scrollRef?.current?.scrollTo?.({ y: 0, animated: true }); } catch { }
  };
}



