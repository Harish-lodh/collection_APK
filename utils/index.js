import {launchImageLibrary, launchCamera} from 'react-native-image-picker';

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
  const res = await launchCamera({ mediaType: 'photo', quality: 0.7, saveToPhotos: true });
  if (res.didCancel) return null;
  if (res.errorCode) { console.log('camera error:', res.errorCode, res.errorMessage); return null; }
  return res.assets?.[0] || null;
};