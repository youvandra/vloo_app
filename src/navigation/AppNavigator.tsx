
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import GiverLoginScreen from '../screens/giver/LoginScreen';
import GiverDashboardScreen from '../screens/giver/DashboardScreen';
import GiverCreateScreen from '../screens/giver/CreateScreen';
import GiverBindScreen from '../screens/giver/BindScreen';
import GiverSuccessScreen from '../screens/giver/SuccessScreen';
import ReceiverScanScreen from '../screens/receiver/ScanScreen';
import ReceiverViewScreen from '../screens/receiver/ViewScreen';
import ReceiverClaimScreen from '../screens/receiver/ClaimScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GiverLogin" component={GiverLoginScreen} />
        <Stack.Screen 
          name="GiverDashboard" 
          component={GiverDashboardScreen} 
          options={{ gestureEnabled: false }}
        />
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
