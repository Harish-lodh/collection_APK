import AsyncStorage from "@react-native-async-storage/async-storage";

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token"); // same key you set after login
    if (token) {
      return token;
    } else {
      console.log("No token found in AsyncStorage");
      return null;
    }
  } catch (error) {
    console.error("Error retrieving token from AsyncStorage:", error);
    return null;
  }
};
