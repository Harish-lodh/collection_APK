// bgTracking.js
import Geolocation from 'react-native-geolocation-service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BACKEND_BASE_URL } from '@env';

// import your already-made permission helper (update path if needed)
import { requestLocationPermission } from './function';

let timer = null;
let currentAction = null; // used for the next tick only

// ---- Helper: Promise wrapper for GPS (keeps detailed meta: accuracy, speed, timestamp) ----
function getLocation() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

// ---- Upload one tick ----
async function tick() {
  try {
    const pos = await getLocation();
    const { latitude, longitude, accuracy = null, speed = null } = pos.coords;
    const timestamp = pos.timestamp ? new Date(pos.timestamp).toISOString() : new Date().toISOString();

    const sessionId = await AsyncStorage.getItem('sessionId');
    if (!sessionId) {
      console.warn('No sessionId in storage. Skip upload.');
      return;
    }

    const point = {
      latitude,
      longitude,
      accuracy,
      speed,
      timestamp,
      source: 'watch',
    };

    const token = await AsyncStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = { sessionId, locations: [point] };
    if (currentAction) {
      payload.action = currentAction;
    }

    await axios.post(`${BACKEND_BASE_URL}/locations/batch`, payload, { headers, timeout: 10000 });
    console.log('✅ Uploaded 1 location:', { point, action: currentAction ?? null });

    // After sending this tick, clear the action so subsequent ticks are null
    currentAction = null;
  } catch (e) {
    console.warn('⚠️ Location error or upload failed:', e?.message || String(e));
  }
}

// ---- Start tracking ----
// intervalMs default 180000 (3 minutes). Pass an action string to mark the next tick.
// Example: startTracking(180000, 'login')
export async function startTracking(intervalMs = 180000, action = null) {
  if (timer) return true; // already running

  // use the central helper you already created
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.warn('❌ Location permission not granted');
    return false;
  }

  // set action to be sent with the next tick, then tick once immediately
  currentAction = action;
  await tick();                          // first upload instantly (will carry action if set)
  timer = setInterval(tick, intervalMs); // then every interval
  console.log('📍 Simple tracking started');
  return true;
}

// ---- Stop tracking ----
// Call this on logout (before clearing sessionId/token from AsyncStorage)
export async function stopTracking() {
  // stop the periodic timer immediately so no further ticks fire
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  // Prepare default point (null coords) in case location fetch fails
  let point = {
    latitude: null,
    longitude: null,
    accuracy: null,
    speed: null,
    timestamp: new Date().toISOString(),
    source: 'watch',
  };

  // Try to fetch last known location (best effort)
  try {
    const pos = await getLocation();
    const { latitude, longitude, accuracy = null, speed = null } = pos.coords;
    point = {
      latitude,
      longitude,
      accuracy,
      speed,
      timestamp: pos.timestamp ? new Date(pos.timestamp).toISOString() : new Date().toISOString(),
      source: 'watch',
    };
  } catch (err) {
    // Location failed — we'll still send logout with null coords
    console.warn('Could not get final location for logout:', err?.message || err);
  }

  try {
    // Build logout payload
    const sessionId = await AsyncStorage.getItem('sessionId');
    const token = await AsyncStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const payload = {
      sessionId,                    // may be null -> server can ignore or handle
      action: 'logout',             // mark this as logout
      locations: [point],           // include coords (or nulls) for logout row
    };

    await axios.post(`${BACKEND_BASE_URL}/locations/batch`, payload, { headers, timeout: 10000 });
    console.log('🛑 Sent logout payload to server:', payload);
  } catch (e) {
    console.warn('⚠️ Failed to send logout payload:', e?.message || String(e));
  }

  // clear any pending action just in case
  currentAction = null;
  return true;
}
