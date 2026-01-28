// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import LoanDetailsScreen from '@screens/LoanDetailsScreen';
// import CashReceiptScreen from '@screens/CashReceiptScreen';

// const Drawer = createDrawerNavigator();

// export default function DrawerNavigator() {
//   return (
//     <Drawer.Navigator
//       initialRouteName="LoanDetails"
//       screenOptions={{
//         headerTitleAlign: 'center',
//         drawerType: 'front',
//       }}
//     >
//       <Drawer.Screen
//         name="LoanDetails"
//         component={LoanDetailsScreen}
//         options={{ title: 'Loan Details' }}
//       />
//       <Drawer.Screen
//         name="CashReceipt"
//         component={CashReceiptScreen}
//         options={{ title: 'Cash Receipt' }}
//       />
//     </Drawer.Navigator>
//   );
// }


import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import LoanDetailsScreen from "../screens/LoanDetailsScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen"
import PendingCashPaymentsScreen from '../screens/PendingCashPaymentsScreen';
// import PaymentImage2Screen from '../screens/PaymentImage2Screen';
import CashReceiptScreen from "../screens/ReceiptScreen";
import HomeScreen from "../screens/HomeScreen";
import CustomDrawer from "./CustomDrawer";
import RepossessionScreen from "../screens/RepossessionScreen";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerTitleAlign: "center", drawerType: "front" }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="CashReceipt" component={CashReceiptScreen} options={{ title: "Receipt" }} />
      <Drawer.Screen name="LoanDetails" component={LoanDetailsScreen} options={{ title: "Loan Search" }} />
      <Drawer.Screen name="Pending Cash Receipt" component={PendingCashPaymentsScreen} />
      <Drawer.Screen name="Repossession" component={RepossessionScreen} options={{ title: 'Vehicle Repossession' }} />

      <Drawer.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          title: "Privacy Policy",
          drawerItemStyle: { display: 'none' }
        }}
      />

    </Drawer.Navigator>
  );
}
