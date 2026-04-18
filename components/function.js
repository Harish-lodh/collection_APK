import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Alert, Linking } from 'react-native';

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
    console.log('🔔 Requesting location permission...');

    // First check if we already have permission
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (alreadyGranted) {
      console.log('📌 Permission already granted');
      return true;
    }

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs access to your location to tag the loan location.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
      {
        cancelable: true,
      },
    );
    console.log('📌 Permission result:', granted);

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      Alert.alert(
        'Location Permission Required',
        'Location permission is required to log in. Please enable it in app settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open Settings',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ],
      );
      return false;
    }
    return false;
  } catch (err) {
    console.warn('⚠️ Permission error:', err);
    return false;
  }
};

export const getCurrentLocation = async () => {
  console.log('➡️ Entered getCurrentLocation()');
  const hasPermission = await requestLocationPermission();
  console.log('📌 hasPermission:', hasPermission);

  if (!hasPermission) {
    console.log('❌ User did not grant location permission');
    // Alert.alert("Permission Denied", "Location permission is required.");
    return null;
  }

  return new Promise(resolve => {
    console.log('📡 Requesting position...');
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        console.log('✅ Got position:', latitude, longitude);
        resolve({ latitude, longitude });
      },
      error => {
        console.log('❌ Location Error:', error);
        Alert.alert('Location Error', error.message);
        resolve(null); // don’t crash save flow
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
};
