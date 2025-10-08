// src/screens/HomeScreen.js
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
import axios from "axios";
import { BACKEND_BASE_URL } from "@env";
import { getCurrentLocation } from "../components/function"; // adjust path if needed
import Loader from "../components/loader";
import { stopTracking } from "../components/bgTracking";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };
    fetchUser();
  }, []);

  const performLogout = async () => {
    setLoggingOut(true);

    try {
      // get current location (wrapped in try so any location error is handled)
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

      // normalize timestamp (Geolocation may return numeric timestamp)
      let timestamp;
      if (loc.timestamp) {
        timestamp =
          typeof loc.timestamp === "number"
            ? new Date(loc.timestamp).toISOString()
            : String(loc.timestamp);
      } else {
        timestamp = new Date().toISOString();
      }

      const payload = {
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ?? null,
        timestamp,
      };

      const token = await AsyncStorage.getItem("token");

      if (token) {
        try {
          await axios.post(`${BACKEND_BASE_URL}/auth/logout`, payload, {
            timeout: 10000,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Server logout succeeded");
        } catch (apiErr) {
          // log more details but don't block logout flow
          console.warn(
            "Logout API failed:",
            apiErr?.response?.data ?? apiErr.message ?? apiErr
          );
        }
      } else {
        console.warn("No token found locally when logging out.");
      }
    } catch (err) {
      console.warn("performLogout error:", err);
    } finally {
      // always try to cleanup tracking and storage, even if API or location failed
      try {
        // stopTracking may be async
        if (typeof stopTracking === "function") await stopTracking();
      } catch (stopErr) {
        console.warn("stopTracking failed:", stopErr);
      }

      try {
        await AsyncStorage.removeItem("sessionId");
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      } catch (e) {
        console.warn("Error clearing storage:", e);
      }

      setLoggingOut(false);

      // navigate to Login screen (replace so user can't go back)
      navigation.replace("Login");
    }
  };

  return (
    <View style={styles.container}>
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
          <Image
            source={require("../assets/images/Scanner.png")}
            style={styles.qrImage}
            resizeMode="contain"
          />
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
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  note: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 2,
  },
});
