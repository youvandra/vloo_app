
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import GiverLoginScreen from '../screens/GiverLoginScreen';
import GiverDashboardScreen from '../screens/GiverDashboardScreen';
import GiverCreateScreen from '../screens/GiverCreateScreen';
import GiverBindScreen from '../screens/GiverBindScreen';
import GiverSuccessScreen from '../screens/GiverSuccessScreen';
import ReceiverScanScreen from '../screens/ReceiverScanScreen';
import ReceiverViewScreen from '../screens/ReceiverViewScreen';
import ReceiverClaimScreen from '../screens/ReceiverClaimScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GiverLogin" component={GiverLoginScreen} />
        <Stack.Screen name="GiverDashboard" component={GiverDashboardScreen} />
        <Stack.Screen name="GiverCreate" component={GiverCreateScreen} />
        <Stack.Screen name="GiverBind" component={GiverBindScreen} />
        <Stack.Screen name="GiverSuccess" component={GiverSuccessScreen} />
        <Stack.Screen name="ReceiverScan" component={ReceiverScanScreen} />
        <Stack.Screen name="ReceiverView" component={ReceiverViewScreen} />
        <Stack.Screen name="ReceiverClaim" component={ReceiverClaimScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
