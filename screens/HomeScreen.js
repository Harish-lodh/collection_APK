import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../server/apiClient"; // ✅ use global axios instance
import { getCurrentLocation } from "../components/function";
import Loader from "../components/loader";
import { stopTracking } from "../components/bgTracking";
import logo from "../assets/icons/icon.png";
import HeyEvscanner from "../assets/images/HeyEv_scanner.jpg";
import Scanner from "../assets/images/Scanner.png";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [scanner, setScanner] = useState(Scanner);
  const [loggingOut, setLoggingOut] = useState(false);

useEffect(() => {
  const fetchUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem("user");
      const permissions = await AsyncStorage.getItem("permissions");
      const parsed = permissions ? JSON.parse(permissions) : [];

      // Normalize permission strings to lowercase
      const normalized = parsed.map(p => p.toLowerCase());
      console.log("Loaded permissions:", normalized);

      // Dynamically change scanner based on permission
      if (normalized.includes("heyev")) {
        setScanner(HeyEvscanner);
      } else {
        setScanner(Scanner);
      }

      if (savedUser) setUser(JSON.parse(savedUser));
    } catch (err) {
      console.error("Failed to load user", err);
    }
  };

  fetchUser();
}, []);


  const performLogout = async () => {
    setLoggingOut(true);

    try {
      let loc = null;
      try {
        loc = await getCurrentLocation();
      } catch (locErr) {
        console.warn("getCurrentLocation failed:", locErr);
      }

      if (!loc) {
        setLoggingOut(false);
        return Alert.alert("Error", "Location permission is required to logout.");
      }

      const timestamp =
        typeof loc.timestamp === "number"
          ? new Date(loc.timestamp).toISOString()
          : loc.timestamp || new Date().toISOString();

      const payload = {
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        timestamp,
      };

      // ✅ token automatically handled by apiClient
      try {
        await apiClient.post("/auth/logout", payload, { timeout: 10000 });
        console.log("Server logout succeeded");
      } catch (apiErr) {
        console.warn("Logout API failed:", apiErr?.response?.data ?? apiErr.message);
      }
    } catch (err) {
      console.warn("performLogout error:", err);
    } finally {
      try {
        if (typeof stopTracking === "function") await stopTracking();
      } catch (stopErr) {
        console.warn("stopTracking failed:", stopErr);
      }

      try {
        await AsyncStorage.multiRemove(["sessionId", "token", "user"]);
      } catch (e) {
        console.warn("Error clearing storage:", e);
      }

      setLoggingOut(false);
      navigation.replace("Login");
    }
  };

  return (
    <View style={styles.container}>
      <Image source={logo} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Welcome</Text>

      {user ? (
        <>
          <Text style={styles.info}>👤 Name: {user.name ?? "—"}</Text>
          <Text style={styles.info}>🎭 Role: {user.role ?? "—"}</Text>
        </>
      ) : (
        <Text style={styles.info}>Loading user info...</Text>
      )}

      <View style={styles.qrWrapper}>
        <Text style={styles.title}>Scan to Pay</Text>
        <View style={styles.qrContainer}>
          <Image source={scanner} style={styles.qrImage} resizeMode="contain" />
        </View>
        <Text style={styles.note}>Use any UPI app to scan this QR</Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, loggingOut && { opacity: 0.7 }]}
        onPress={performLogout}
        disabled={loggingOut}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Loader visible={loggingOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 12 },
  info: { fontSize: 18, marginBottom: 8 },
  logoutButton: { marginTop: 14, backgroundColor: "red", padding: 12, borderRadius: 8 },
  logoutText: { color: "white", fontWeight: "bold" },
  qrWrapper: { width: "100%", alignItems: "center", marginTop: 18 },
  qrContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    backgroundColor: "#fff",
    padding: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  qrImage: { width: 240, height: 240 },
  note: { fontSize: 14, color: "#666", textAlign: "center", marginTop: 2 },
  logo: { width: 120, height: 120, marginBottom: 10 },
});
