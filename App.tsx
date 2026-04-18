// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import 'react-native-reanimated'
// import { StatusBar } from "react-native";
// import { useState, useEffect } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import PaymentImage2Screen from './screens/PaymentImage2Screen.js'
// import LoginScreen from "./screens/LoginScreen.js";
// import DrawerNavigator from "./navigation/DrawerNavigator.js";
// import RepossessionScreen  from './screens/RepossessionScreen.js'
// import 'react-native-get-random-values';

// const Stack = createStackNavigator();

// export default function App() {
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkLogin = async () => {
//       try {
//         const token = await AsyncStorage.getItem("token");
//         // setIsLoggedIn(!!token); // If token exists, user is logged in
//         if (token) {

//           // setIsLoggedIn(true)

//         }
//       } catch (err) {
//         console.error("Error checking token", err);
//       } finally {
//         setLoading(false); // Stop loading once check is complete
//       }
//     };

//     checkLogin();
//   }, []);

//   if (loading) {
//     return null; // You can display a loading/splash screen here
//   }

//   return (
//     <>
//       <StatusBar barStyle="dark-content" backgroundColor="#fff" hidden={false} />
//       <NavigationContainer>
//         <Stack.Navigator screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="Login" component={LoginScreen} />
//           <Stack.Screen name="MainDrawer" component={DrawerNavigator} />

//           <Stack.Screen
//             name="PaymentImage2"
//             component={PaymentImage2Screen}
//             options={{ headerShown: true, title: 'Pending receipt' }}
//           />

//         </Stack.Navigator>

//       </NavigationContainer>
//     </>
//   );
// }

import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './navigation/DrawerNavigator';
import PaymentImage2Screen from './screens/PaymentImage2Screen';
import Loader from './components/loader';
import { startTracking } from './components/bgTracking';

import CustomerTabNavigator from './customer/navigation/CustomerTabNavigator';
import CustomerPaymentScreen from './customer/screens/CustomerPaymentScreen';

const Stack = createStackNavigator();

const App = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const role = await AsyncStorage.getItem('role');

        if (token) {
          setIsLoggedIn(true);
          setUserRole(role || 'RM');

          if (role !== 'CUSTOMER') {
            await startTracking(300000, 'AppOpen' as any);
          }
        } else {
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } catch (err) {
        console.error('Session restore failed:', err);
        setIsLoggedIn(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const handleLogout = async () => {
    try {
      const role = await AsyncStorage.getItem('role');
      if (role !== 'CUSTOMER') {
        await startTracking(300000, 'Logout' as any);
      }
    } catch (err) {
      console.error('Error during logout tracking:', err);
    }
    await AsyncStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
  };

  const handleLoginSuccess = async role => {
    setIsLoggedIn(true);
    setUserRole(role || 'RM');

    if (role !== 'CUSTOMER') {
      await startTracking(300000, 'Login' as any);
    }
  };

  if (loading) {
    return (
      <>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <Loader visible />
      </>
    );
  }

  const isCustomer = userRole === 'CUSTOMER';

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={isCustomer ? '#0a7' : '#fff'}
      />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            isCustomer ? (
              <>
                <Stack.Screen name="CustomerTabs">
                  {(props: any) => (
                    <CustomerTabNavigator {...props} onLogout={handleLogout} />
                  )}
                </Stack.Screen>
                <Stack.Screen
                  name="CustomerPayment"
                  component={CustomerPaymentScreen}
                  options={{
                    headerShown: true,
                    title: 'Pay EMI',
                    headerStyle: { backgroundColor: '#0a7' },
                    headerTintColor: '#fff',
                  }}
                />
              </>
            ) : (
              <Stack.Screen name="MainDrawer">
                {(props: any) => (
                  <DrawerNavigator {...props} onLogout={handleLogout} />
                )}
              </Stack.Screen>
            )
          ) : (
            <Stack.Screen name="Login">
              {(props: any) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={role => handleLoginSuccess(role)}
                />
              )}
            </Stack.Screen>
          )}

          {!isCustomer && (
            <Stack.Screen
              name="PaymentImage2"
              component={PaymentImage2Screen}
              options={{ headerShown: true, title: 'Pending receipt' }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
