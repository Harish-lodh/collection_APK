import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_BASE_URL } from "@env";

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
});

// Use an async interceptor to attach token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
