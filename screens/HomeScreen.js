import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert,Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);

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

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    Alert.alert("Logged out", "You have been logged out");
    navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      {user ? (
        <>
          <Text style={styles.info}>👤 Name: {user.name}</Text>
          <Text style={styles.info}>🎭 Role: {user.role}</Text>
        </>
      ) : (
        <Text style={styles.info}>Loading user info...</Text>
      )}

        <View style={styles.container}>
        <Text style={styles.title}>Scan to Pay</Text>
        <View style={styles.qrContainer}>
          <Image
            source={require("../assets/images/Scanner.png")}
            style={styles.qrImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.note}>Use any UPI app to scan this QR</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      </View>

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 10 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20},
  info: { fontSize: 18, marginBottom: 10 },
  logoutButton: { marginTop: 14, backgroundColor: "red", padding: 12, borderRadius: 8 },
  logoutText: { color: "white", fontWeight: "bold" },
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
