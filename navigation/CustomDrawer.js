import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CustomDrawer(props) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    props.navigation.replace("Login");
  };

  return (
    <View style={styles.container}>
      {/* Drawer Menu Items */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContainer}
      >
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Privacy Policy */}
        <TouchableOpacity
          onPress={() => props.navigation.navigate("PrivacyPolicy")}
          activeOpacity={0.7}
          style={styles.linkContainer}
        >
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    paddingTop: 0,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  linkContainer: {
    padding: 12,
    marginBottom: 16,
      borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  linkText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#D32F2F",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
