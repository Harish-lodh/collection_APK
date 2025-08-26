import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

export const selectFromGallery = async () => {
  const res = await launchImageLibrary({mediaType: 'photo', quality: 0.7});
  if (res.assets && res.assets.length > 0) setImage(res.assets[0]); // {uri, type, fileName, ...}
};

export const captureFromCamera = async () => {
  const res = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true });
  if (res.didCancel) return null;
  if (res.errorCode) { console.log('camera error:', res.errorCode, res.errorMessage); return null; }
  return res.assets?.[0] || null;
};