import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { lightGreenTheme } from '../utils/customerThemes.js';
import CustomerHomeScreen from '../screens/CustomerHomeScreen';
import CustomerLoanScreen from '../screens/CustomerLoanScreen';
import CustomerEmiScheduleScreen from '../screens/CustomerEmiScheduleScreen';
import CustomerPaymentHistoryScreen from '../screens/CustomerPaymentHistoryScreen';
import CustomerProfileScreen from '../screens/CustomerProfileScreen';

const Tab = createBottomTabNavigator();

const screenOptions = ({ route }) => ({
  tabBarIcon: ({ focused, color, size }) => {
    let iconName = '';
    switch (route.name) {
      case 'Home':
        iconName = 'home';
        break;
      case 'MyLoan':
        iconName = 'account-balance-wallet';
        break;
      case 'EMI Schedule':
        iconName = 'schedule';
        break;
      case 'Payments':
        iconName = 'payments';
        break;
      case 'Profile':
        iconName = 'person';
        break;
    }
    return <Icon name={iconName} size={24} color={color} />;
  },
  tabBarActiveTintColor: lightGreenTheme.primary,
  tabBarInactiveTintColor: lightGreenTheme.inactive,
  tabBarStyle: styles.tabBar,
  tabBarLabelStyle: styles.tabBarLabel,
  headerStyle: {
    backgroundColor: lightGreenTheme.primary,
  },
  headerTitleStyle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitleAlign: 'center',
});

export default function CustomerTabNavigator({ onLogout }) {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen name="Home" component={CustomerHomeScreen} />
      <Tab.Screen name="MyLoan" component={CustomerLoanScreen} />
      <Tab.Screen name="EMI Schedule" component={CustomerEmiScheduleScreen} />
      <Tab.Screen name="Payments" component={CustomerPaymentHistoryScreen} />
      <Tab.Screen name="Profile">
        {props => <CustomerProfileScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: lightGreenTheme.card,
    borderTopWidth: 1,
    borderTopColor: lightGreenTheme.border,
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
