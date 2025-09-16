// src/screens/RepossessionScreen.jsx
import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { getAuthToken } from '../components/authToken';
import { getCurrentLocation } from '../components/function';
import { BACKEND_BASE_URL } from '@env';

// Default PRE slots (tap to add photo)
const PHOTO_SLOTS = ['Front', 'Rear', 'Left', 'Right', 'Interior', 'Damages'];

const REPO_REASONS = [
  { label: 'NPA', value: 'NPA' },
  { label: 'Default > 90 days', value: 'DEFAULT_90' },
  { label: 'Skip Trace Result', value: 'SKIP_TRACE' },
];

const VEHICLE_CONDITION = [
  { label: 'Good', value: 'GOOD' },
  { label: 'Damaged', value: 'DAMAGED' },
  { label: 'Modified', value: 'MODIFIED' },
];

const PLACES = [
  { label: 'Roadside', value: 'ROADSIDE' },
  { label: 'Residence', value: 'RESIDENCE' },
  { label: 'Workplace', value: 'WORKPLACE' },
  { label: 'Other', value: 'OTHER' },
];

const MIN_REQUIRED_PHOTOS = 3;
const MAX_ALLOWED_PHOTOS = 10;

export default function RepossessionScreen({ navigation }) {
  const [submitting, setSubmitting] = useState(false);

  // Search fields
  const [mobile, setMobile] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [partnerLoanId, setPartnerLoanId] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');

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
  const [passportNo, setPassportNo] = useState('');

  // GPS (we only send if valid)
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  // Photos: { [id]: { uri, type, fileName, label } }
  const [photos, setPhotos] = useState({});

  // -------- helpers --------
  const photoCount = () => Object.values(photos).filter((f) => !!f?.uri).length;
  const canAddMore = () => photoCount() < MAX_ALLOWED_PHOTOS;

  const captureLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      const lat = loc?.latitude ?? loc?.coords?.latitude;
      const lon = loc?.longitude ?? loc?.coords?.longitude;
      if (typeof lat === 'number' && typeof lon === 'number') {
        setLatitude(lat);
        setLongitude(lon);
        return true;
      }
    } catch { /* ignore UI toast below if needed */ }
    return false;
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
            label: p[id]?.label ?? (PHOTO_SLOTS.includes(id) ? id : ''),
          },
        }));
      }
    } catch { /* no-op */ }
  };

  const pickPhoto = async (id) => {
    try {
      const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (res?.assets?.length) {
        const a = res.assets[0];
        setPhotos((p) => ({
          ...p,
          [id]: {
            ...(p[id] || {}),
            uri: a.uri,
            type: a.type || 'image/jpeg',
            fileName: a.fileName || `${id}.jpg`,
            label: p[id]?.label ?? (PHOTO_SLOTS.includes(id) ? id : ''),
          },
        }));
      }
    } catch { /* no-op */ }
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
    if (!partnerLoanId && !vehicleNumber) errors.push('Enter Partner Loan ID or Vehicle No');
    if (!repoReason) errors.push('Select repossession reason');
    if (!repoPlace) errors.push('Select place of repossession');
    if (!vehicleCondition) errors.push('Select vehicle condition');

    const count = photoCount();
    if (count < MIN_REQUIRED_PHOTOS) errors.push(`At least ${MIN_REQUIRED_PHOTOS} photos required`);
    if (count > MAX_ALLOWED_PHOTOS) errors.push(`Max ${MAX_ALLOWED_PHOTOS} photos allowed`);

    if (errors.length) {
      Alert.alert('Missing info', errors.join('\n'));
      return false;
    }
    return true;
  };

  const detectType = (id) => {
    if (id.startsWith('post_')) return 'POST';
    if (id.startsWith('pre_')) return 'PRE';
    if (PHOTO_SLOTS.includes(id)) return 'PRE';
    return 'PRE';
  };

  const handleSubmit = async () => {
    if (!validateBasics()) return;

    setSubmitting(true);
    try {
      // best-effort GPS (frontend-only change; backend untouched)
      await captureLocation();

      const token = await getAuthToken();
      const fd = new FormData();

      // Basic refs
      if (mobile) fd.append('mobile', mobile);
      if (panNumber) fd.append('panNumber', panNumber);
      if (partnerLoanId) fd.append('partnerLoanId', partnerLoanId);
      if (vehicleNumber) fd.append('vehicleNumber', vehicleNumber);

      // Vehicle info
      if (makeModel) fd.append('makeModel', makeModel);
      if (regNo) fd.append('regNo', regNo);
      if (chassisNo) fd.append('chassisNo', chassisNo);
      if (engineNo) fd.append('engineNo', engineNo);
      if (batteryNo) fd.append('batteryNo', batteryNo);

      // Repo meta
      const iso = Number.isFinite(repoDate?.getTime?.()) ? repoDate.toISOString() : '';
      fd.append('repoDate', iso);
      if (repoReason) fd.append('repoReason', repoReason);
      if (agency) fd.append('agency', agency);
      if (fieldOfficer) fd.append('fieldOfficer', fieldOfficer);
      if (repoPlace) fd.append('repoPlace', repoPlace);
      if (vehicleCondition) fd.append('vehicleCondition', vehicleCondition);
      if (inventory) fd.append('inventory', inventory);
      if (remarks) fd.append('remarks', remarks);

      // Post-repo details
      if (yardLocation) fd.append('yardLocation', yardLocation);
      if (yardIncharge) fd.append('yardIncharge', yardIncharge);
      if (yardContact) fd.append('yardContact', yardContact);
      if (yardReceipt) fd.append('yardReceipt', yardReceipt);
      if (passportNo) fd.append('passportNo', passportNo);

      // Location — append ONLY if valid (prevents NaN at DB)
      if (typeof latitude === 'number' && Number.isFinite(latitude)) {
        fd.append('latitude', String(latitude));
      }
      if (typeof longitude === 'number' && Number.isFinite(longitude)) {
        fd.append('longitude', String(longitude));
      }

      // Photos (parallel arrays expected by your backend)
      const entries = Object.entries(photos).filter(([, f]) => !!f?.uri);
      entries.forEach(([id, file]) => {
        fd.append('photos', {
          uri: file.uri,
          name: file.fileName || `${file.label || id}.jpg`,
          type: file.type || 'image/jpeg',
        });
        fd.append('photoTypes[]', detectType(id));    // PRE | POST
        fd.append('photoLabels[]', file.label || id); // human label
      });

      await axios.post(`${BACKEND_BASE_URL}/repossession`, fd, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Repossession details submitted.');
      navigation?.goBack?.();
    } catch (e) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (typeof e?.message === 'string' ? e.message : 'Failed to submit');
      Alert.alert('Error', String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- UI helpers ----------
  const LabeledPhotoTile = ({ id, file }) => {
    const hasImage = !!file?.uri;
    const typeChip = detectType(id);

    return (
      <View style={styles.tileWrap}>
        <Pressable style={styles.photoTile} onPress={() => askPhotoSource(id)}>
          {hasImage ? (
            <Image source={{ uri: file.uri }} style={styles.photoImg} />
          ) : (
            <Text style={styles.photoPlaceholder}>+ Add</Text>
          )}
        </Pressable>

        {hasImage ? (
          <Pressable
            style={styles.closeBtn}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            onPress={() =>
              setPhotos((p) => {
                const n = { ...p };
                delete n[id];
                return n;
              })
            }
          >
            <Text style={styles.closeBtnText}>×</Text>
          </Pressable>
        ) : null}

        <TextInput
          style={styles.labelInput}
          placeholder="Label (optional)"
          value={file?.label || ''}
          onChangeText={(txt) =>
            setPhotos((p) => ({
              ...p,
              [id]: { ...(p[id] || {}), label: txt },
            }))
          }
        />

        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>{typeChip}</Text>
        </View>
      </View>
    );
  };

  // Compose PRE entries: named slots + dynamic pre_*
  const prePhotoEntries = useMemo(() => {
    const dynPre = Object.entries(photos).filter(([id]) => id.startsWith('pre_'));
    const named = PHOTO_SLOTS.map((slot) => [slot, photos[slot] ?? { uri: null, label: slot }]);
    return [...named, ...dynPre];
  }, [photos]);

  const postPhotoEntries = useMemo(
    () => Object.entries(photos).filter(([id]) => id.startsWith('post_')),
    [photos]
  );

  const addPre = () => {
    if (!canAddMore()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
    const id = `pre_${Date.now()}`;
    setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
    setTimeout(() => askPhotoSource(id), 0);
  };

  const addPost = () => {
    if (!canAddMore()) return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
    const id = `post_${Date.now()}`;
    setPhotos((p) => ({ ...p, [id]: { uri: null, label: '' } }));
    setTimeout(() => askPhotoSource(id), 0);
  };

  const ensureSlotAndPick = (slot) => {
    if (!canAddMore() && !photos[slot]?.uri) {
      return Alert.alert('Limit', `Max ${MAX_ALLOWED_PHOTOS} photos allowed.`);
    }
    setPhotos((p) => ({ ...p, [slot]: p[slot] || { uri: null, label: slot } }));
    setTimeout(() => askPhotoSource(slot), 0);
  };

  // ---------- UI ----------
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.h1}>Vehicle Repossession</Text>

        {/* Basic Search */}
        <View style={styles.card}>
          <Text style={styles.section}>Search</Text>
          <Text style={styles.label}>Mobile</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />

          <Text style={styles.label}>PAN</Text>
          <TextInput style={styles.input} value={panNumber} onChangeText={setPanNumber} autoCapitalize="characters" />

          <Text style={styles.label}>Partner Loan ID</Text>
          <TextInput style={styles.input} value={partnerLoanId} onChangeText={setPartnerLoanId} />

          <Text style={styles.label}>Vehicle Number</Text>
          <TextInput
            style={styles.input}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            autoCapitalize="characters"
          />
        </View>

        {/* Vehicle Info */}
        <View style={styles.card}>
          <Text style={styles.section}>Vehicle</Text>
          <TextInput style={styles.input} placeholder="Make / Model / Variant" value={makeModel} onChangeText={setMakeModel} />
          <TextInput style={styles.input} placeholder="Registration No." value={regNo} onChangeText={setRegNo} />
          <TextInput style={styles.input} placeholder="Chassis No." value={chassisNo} onChangeText={setChassisNo} />
          <TextInput style={styles.input} placeholder="Engine No." value={engineNo} onChangeText={setEngineNo} />
          <TextInput style={styles.input} placeholder="Battery No." value={batteryNo} onChangeText={setBatteryNo} />
        </View>

        {/* Repo Meta */}
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
            <DateTimePicker value={repoDate} mode="date" is24Hour display="default" onChange={handleDateChange} />
          )}
          {showTimePicker && (
            <DateTimePicker value={repoDate} mode="time" is24Hour display="default" onChange={handleTimeChange} />
          )}

          <Text style={styles.label}>Reason</Text>
          <AppDropdown data={REPO_REASONS} value={repoReason} onChange={setRepoReason} placeholder="Select reason" />

          <Text style={styles.label}>Agency</Text>
          <TextInput style={styles.input} value={agency} onChangeText={setAgency} placeholder="Agency name" />

          <Text style={styles.label}>Field Officer</Text>
          <TextInput style={styles.input} value={fieldOfficer} onChangeText={setFieldOfficer} placeholder="Field officer" />

          <Text style={styles.label}>Place</Text>
          <AppDropdown data={PLACES} value={repoPlace} onChange={setRepoPlace} placeholder="Select place" />

          <Text style={styles.label}>Vehicle Condition</Text>
          <AppDropdown data={VEHICLE_CONDITION} value={vehicleCondition} onChange={setVehicleCondition} placeholder="Select condition" />

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

        {/* Post-Repo Info */}
        <View style={styles.card}>
          <Text style={styles.section}>Post-Repossession</Text>
          <TextInput style={styles.input} value={yardLocation} onChangeText={setYardLocation} placeholder="Yard Location" />
          <TextInput style={styles.input} value={yardIncharge} onChangeText={setYardIncharge} placeholder="Yard In-charge" />
          <TextInput style={styles.input} value={yardContact} onChangeText={setYardContact} placeholder="Yard Contact" keyboardType="phone-pad" />
          <TextInput style={styles.input} value={yardReceipt} onChangeText={setYardReceipt} placeholder="Yard Receipt No." />
          <TextInput style={styles.input} value={passportNo} onChangeText={setPassportNo} placeholder="Passport/Seizure Memo No." />
        </View>

        {/* Photos: PRE with inline +Add */}
        <View style={styles.card}>
          <Text style={styles.section}>Photos ({photoCount()}/{MAX_ALLOWED_PHOTOS})</Text>

          <Text style={styles.subsection}>Pre-Repossession</Text>
          <View style={styles.grid3}>
            {prePhotoEntries.map(([id, file]) => (
              <View key={id} style={styles.tileWrapper3}>
                {PHOTO_SLOTS.includes(id) ? (
                  <View style={styles.tileWrap}>
                    <Pressable style={styles.photoTile} onPress={() => ensureSlotAndPick(id)}>
                      {file?.uri ? (
                        <Image source={{ uri: file.uri }} style={styles.photoImg} />
                      ) : (
                        <Text style={styles.photoPlaceholder}>{id}</Text>
                      )}
                    </Pressable>
                    {file?.uri ? (
                      <Pressable
                        style={styles.closeBtn}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                        onPress={() =>
                          setPhotos((p) => {
                            const n = { ...p };
                            delete n[id];
                            return n;
                          })
                        }
                      >
                        <Text style={styles.closeBtnText}>×</Text>
                      </Pressable>
                    ) : null}
                    <TextInput
                      style={styles.labelInput}
                      placeholder="Label (optional)"
                      value={file?.label || id}
                      onChangeText={(txt) =>
                        setPhotos((p) => ({
                          ...p,
                          [id]: { ...(p[id] || {}), label: txt, uri: p[id]?.uri ?? null },
                        }))
                      }
                    />
                    <View style={styles.typeChip}>
                      <Text style={styles.typeChipText}>PRE</Text>
                    </View>
                  </View>
                ) : (
                  <LabeledPhotoTile id={id} file={file} />
                )}
              </View>
            ))}
            {/* inline + Add */}
            <View style={styles.tileWrapper3}>
              <Pressable
                style={styles.photoTile}
                onPress={addPre}
              >
                <Text style={styles.photoPlaceholder}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          {/* Photos: POST with inline +Add */}
          <Text style={[styles.subsection, { marginTop: 12 }]}>Post-Repossession</Text>
          <View style={styles.grid3}>
            {postPhotoEntries.map(([id, file]) => (
              <View key={id} style={styles.tileWrapper3}>
                <LabeledPhotoTile id={id} file={file} />
              </View>
            ))}
            <View style={styles.tileWrapper3}>
              <Pressable
                style={styles.photoTile}
                onPress={addPost}
              >
                <Text style={styles.photoPlaceholder}>+ Add</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.helper}>Minimum {MIN_REQUIRED_PHOTOS} photos required in total.</Text>
        </View>

        {/* Submit */}
        <Pressable style={[styles.btnPrimary, submitting && { opacity: 0.7 }]} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator /> : <Text style={styles.btnPrimaryText}>Submit</Text>}
        </Pressable>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// small dropdown wrapper
function AppDropdown({ data, value, onChange, placeholder = 'Select' }) {
  return (
    <Dropdown
      data={data}
      labelField="label"
      valueField="value"
      value={value}
      placeholder={placeholder}
      style={styles.dropdown}
      placeholderStyle={styles.dropdownPlaceholder}
      selectedTextStyle={styles.dropdownSelected}
      onChange={(item) => onChange(item?.value ?? null)}
      renderRightIcon={() => <Text style={{ fontSize: 16 }}>▾</Text>}
    />
  );
}

// -------- styles (simple/light) --------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8fb' },
  scrollContent: { padding: 12 },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 10, color: '#111' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e6e9ef',
  },

  section: { fontSize: 15, fontWeight: '700', marginBottom: 8, color: '#111' },
  subsection: { fontSize: 13, fontWeight: '700', marginBottom: 8, color: '#333' },
  label: { color: '#333', marginTop: 8, marginBottom: 4, fontSize: 12 },

  input: {
    backgroundColor: '#fff',
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    color: '#111',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 12 : 9,
    fontSize: 14,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },

  row: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d6dcff',
  },
  btnText: { color: '#1f35c5', fontWeight: '600', fontSize: 12 },
  dateText: { color: '#333', marginLeft: 10, fontSize: 12 },

  helper: { color: '#666', fontSize: 12, marginTop: 8 },

  // 3-column grid
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  tileWrapper3: {
    width: '33.3333%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },

  tileWrap: { position: 'relative' },
  photoTile: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#f2f4f9',
    borderWidth: 1,
    borderColor: '#e0e5f2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoPlaceholder: { color: '#5b6aa1', fontSize: 12, textAlign: 'center', paddingHorizontal: 6 },

  closeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f3f4f7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dfe5f3',
  },
  closeBtnText: { color: '#333', fontSize: 16, lineHeight: 18, fontWeight: '700' },

  labelInput: {
    marginTop: 6,
    backgroundColor: '#fff',
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    color: '#111',
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 10 : 7,
    fontSize: 12,
  },
  typeChip: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d6dcff',
  },
  typeChipText: { color: '#1f35c5', fontSize: 10, fontWeight: '700' },

  btnPrimary: {
    backgroundColor: '#1f35c5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnPrimaryText: { color: 'white', fontWeight: '700', fontSize: 15 },

  dropdown: {
    height: 44,
    borderColor: '#d7ddea',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  dropdownPlaceholder: { color: '#777', fontSize: 14 },
  dropdownSelected: { color: '#111', fontSize: 14 },
});
