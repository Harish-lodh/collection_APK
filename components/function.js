import { PermissionsAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';



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
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "App needs access to your location to tag the loan location.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK"
      }
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn(err);
    return false;
  }
};


export const getCurrentLocation = async () => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    Alert.alert('Permission Denied', 'Location permission is required.');
    return null;
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve({ latitude, longitude });
      },
      error => {
        console.error("Location Error:", error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};
