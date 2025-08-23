/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-reanimated'
import  { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import LoginScreen from "./screens/LoginScreen.js";
import DrawerNavigator from "./navigation/DrawerNavigator.js";

const Stack = createStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        // setIsLoggedIn(!!token); // If token exists, user is logged in
        if(token){
          
          // setIsLoggedIn(true)

        }
      } catch (err) {
        console.error("Error checking token", err);
      } finally {
        setLoading(false); // Stop loading once check is complete
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return null; // You can display a loading/splash screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Login" component={LoginScreen} />
  <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
</Stack.Navigator>

    </NavigationContainer>
  );
}

