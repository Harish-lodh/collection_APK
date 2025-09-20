import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { getCurrentLocation } from "../components/function";
import { BACKEND_BASE_URL } from "@env";
import Loader from "../components/loader";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Email and password are required");
    }
    setLoading(true);
    try {
      const location = await getCurrentLocation(); // may be null
      if (!location) {
        setLoading(false);
        return Alert.alert("Error", "Location permission is required to log in.");
      }

      const res = await axios.post(`${BACKEND_BASE_URL}/auth/login`, {
        email,
        password,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        timestamp: location?.timestamp ?? new Date().toISOString(),
      });

      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
        navigation.replace("MainDrawer");
      } else {
        Alert.alert("Error", "No token received from server");
      }
    } catch (err) {
      Alert.alert("Login failed", err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Loader visible={loading} />

      <Text style={styles.title}>RM Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 8,
  },
  button: { backgroundColor: "blue", padding: 15, borderRadius: 8 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
