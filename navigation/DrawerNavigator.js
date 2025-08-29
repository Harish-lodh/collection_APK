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
// import LoanDetailsScreen from "../screens/LoanDetailsScreen";

import CashReceiptScreen from "../screens/CashReceiptScreen";
import HomeScreen from "../screens/HomeScreen";
import CustomDrawer from "./CustomDrawer";

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{ headerTitleAlign: "center", drawerType: "front" }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
          <Drawer.Screen name="CashReceipt" component={CashReceiptScreen} options={{ title: "Cash Receipt" }} />
      {/* <Drawer.Screen name="LoanDetails" component={LoanDetailsScreen} options={{ title: "Loan Search" }} /> */}
  
    </Drawer.Navigator>
  );
}
