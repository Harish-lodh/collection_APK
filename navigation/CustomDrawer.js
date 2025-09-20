import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CustomDrawer(props) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    props.navigation.replace("Login"); // navigate back to login
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Default Drawer Items */}
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Logout Button */}
      {/* <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  logoutContainer: { padding: 20, borderTopWidth: 1, borderColor: "#ccc" },
  logoutButton: { backgroundColor: "red", padding: 12, borderRadius: 8 },
  logoutText: { color: "white", fontWeight: "bold", textAlign: "center" },
});
