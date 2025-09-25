

import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Alert } from 'react-native';

export default function isCustomerName(input) {
  // Remove leading/trailing whitespace
  const trimmedInput = input.trim();
  
  // Check if input is empty
  if (!trimmedInput) {
    return false;
  }
  
  // Regular expression for name: letters and spaces only
  const nameRegex = /^[A-Za-z\s]+$/;
  
  // Return true if input matches name regex, false otherwise
  return nameRegex.test(trimmedInput);
}


export const requestLocationPermission = async () => {
  try {
    console.log("🔔 Requesting location permission...");
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "App needs access to your location to tag the loan location.",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    console.log("📌 Permission result:", granted);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn("⚠️ Permission error:", err);
    return false;
  }
};

export const getCurrentLocation = async () => {
  console.log("➡️ Entered getCurrentLocation()");
  const hasPermission = await requestLocationPermission();
  console.log("📌 hasPermission:", hasPermission);

  if (!hasPermission) {
    console.log("❌ User did not grant location permission");
   // Alert.alert("Permission Denied", "Location permission is required.");
    return null;
  }

  return new Promise((resolve) => {
    console.log("📡 Requesting position...");
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("✅ Got position:", latitude, longitude);
        resolve({ latitude, longitude });
      },
      (error) => {
        console.log("❌ Location Error:", error);
        Alert.alert("Location Error", error.message);
        resolve(null); // don’t crash save flow
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};



