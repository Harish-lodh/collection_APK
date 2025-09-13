import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, ScrollView, Pressable, ActivityIndicator, Image, Alert
} from 'react-native';
import styles from '../utils/style.js';
import Button from '../components/Button.js';
import { useRoute, useNavigation } from '@react-navigation/native';
import { selectFromGallery,captureFromCamera } from '../utils/index';

import { uploadPaymentImage2 } from '../utils/index.js'

function ReadOnlyRow({ label, value }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.input, { justifyContent: 'center' }]}>
        <Text style={{ fontSize: 16, color: '#111' }}>{value ?? '-'}</Text>
      </View>
    </View>
  );
}

export default function PaymentImage2Screen() {
  const navigation = useNavigation();
  const route = useRoute();
  const payment = route.params?.payment; // passed from list screen

  const [photoSource, setPhotoSource] = useState(null); // 'gallery' | 'camera'
  const [image2, setImage2] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const formattedDate = useMemo(() => {
    if (!payment?.paymentDate) return '';
    const d = new Date(payment.paymentDate);
    if (isNaN(d.getTime())) return String(payment.paymentDate); // already formatted
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  }, [payment]);

  const pick = async () => {
    setPhotoError('');
    if (!photoSource) {
      setPhotoError('Please choose Gallery or Camera.');
      return;
    }
    const asset = photoSource === 'gallery' ? await selectFromGallery() : await captureFromCamera();
    if (asset?.uri) setImage2(asset);
  };

  const handleSubmit = async () => {
    if (!image2?.uri) {
      setPhotoError('Please select a receipt photo.');
      return;
    }
    try {
      setSubmitting(true);
      await uploadPaymentImage2(payment.id, image2);
      Alert.alert('Success', 'Receipt Submitted Successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(), // go back to list (it shows one less item after refresh)
        },
      ]);
    } catch (e) {
      console.error('Upload image2 error:', e?.response || e);
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? 'Image 2 already uploaded.' : 'Upload failed.');
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Payment Details (Read-only)</Text>

      <ReadOnlyRow label="Phone Number"   value={payment?.contactNumber} />
      <ReadOnlyRow label="PAN Number"     value={payment?.panNumber} />
      <ReadOnlyRow label="Customer Name"  value={payment?.customerName} />
      <ReadOnlyRow label="Vehicle Number" value={payment?.vehicleNumber} />
      <ReadOnlyRow label="Partner Loan ID" value={payment?.partnerLoanId} />
      <ReadOnlyRow label="Loan ID"        value={payment?.loanId} />
      <ReadOnlyRow label="Payment Date"   value={formattedDate} />
      <ReadOnlyRow label="Payment Mode"   value={payment?.paymentMode} />
      <ReadOnlyRow label="Ref No."        value={payment?.paymentRef} />
      <ReadOnlyRow label="Collected By"   value={payment?.collectedBy} />
      <ReadOnlyRow label="Amount (₹)"     value={String(payment?.amount ?? '')} />
      <ReadOnlyRow label="Remarks"        value={payment?.remark} />

      {/* Image 2 picker */}
      <View style={styles.field}>
        <View style={styles.headerRow}>
          <Text style={styles.label}>Add Cash Receipt <Text style={styles.req}>*</Text></Text>
          {image2?.uri ? <Text style={styles.hintOk}>Selected</Text> : <Text style={styles.hint}>required</Text>}
        </View>

        <View style={styles.segmentRow}>
          <Pressable
            onPress={() => setPhotoSource('gallery')}
            style={[styles.segment, photoSource === 'gallery' && styles.segmentActive]}
          >
            <Text style={[styles.segmentEmoji, photoSource === 'gallery' && styles.segmentEmojiActive]}>🖼️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.segmentTitle, photoSource === 'gallery' && styles.segmentTitleActive]}>Gallery</Text>
              <Text style={styles.segmentSub}>Pick an existing photo</Text>
            </View>
            {photoSource === 'gallery' ? <Text style={styles.tick}>✓</Text> : null}
          </Pressable>

          <Pressable
            onPress={() => setPhotoSource('camera')}
            style={[styles.segment, photoSource === 'camera' && styles.segmentActive]}
          >
            <Text style={[styles.segmentEmoji, photoSource === 'camera' && styles.segmentEmojiActive]}>📷</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.segmentTitle, photoSource === 'camera' && styles.segmentTitleActive]}>Camera</Text>
              <Text style={styles.segmentSub}>Capture a new photo</Text>
            </View>
            {photoSource === 'camera' ? <Text style={styles.tick}>✓</Text> : null}
          </Pressable>
        </View>

        <Pressable onPress={pick} style={[styles.primaryBtn, !photoSource && { opacity: 0.6 }]}>
          <Text style={styles.primaryBtnText}>Pick Photo</Text>
        </Pressable>

        {photoError ? <Text style={styles.errorText}>{photoError}</Text> : null}

        {image2?.uri && (
          <View style={{ alignItems: 'center', marginTop: 12 }}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: image2.uri }} style={{ width: 220, height: 220, borderRadius: 10 }} />
              <Pressable onPress={() => setImage2(null)} style={styles.closePill} accessibilityLabel="Remove image">
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
            <Text style={styles.previewCaption}>Preview</Text>
          </View>
        )}
      </View>

  <Button label={submitting ? 'Uploading…' : 'Upload Bank Cash Receipt'} onPress={handleSubmit} disabled={submitting} />
      {submitting && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </ScrollView>
  );
}
