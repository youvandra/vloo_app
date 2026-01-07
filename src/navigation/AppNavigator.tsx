
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from '../screens/HomeScreen';
import GiverDashboardScreen from '../screens/giver/DashboardScreen';
import VlooDetailsScreen from '../screens/giver/VlooDetailsScreen';
import LinkedWalletsSettingsScreen from '../screens/giver/LinkedWalletsSettingsScreen';
import AboutScreen from '../screens/giver/AboutScreen';
import GiverSuccessScreen from '../screens/giver/SuccessScreen';
import BuyCardScreen from '../screens/giver/BuyCardScreen';
import ReceiveScreen from '../screens/giver/ReceiveScreen';
import SendScreen from '../screens/giver/SendScreen';
import TransferScreen from '../screens/giver/TransferScreen';
import HistoryScreen from '../screens/giver/HistoryScreen';
import HistoryDetailsScreen from '../screens/giver/HistoryDetailsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen 
          name="GiverDashboard" 
          component={GiverDashboardScreen} 
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen name="VlooDetails" component={VlooDetailsScreen} />
        <Stack.Screen name="LinkedWalletsSettings" component={LinkedWalletsSettingsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="GiverSuccess" component={GiverSuccessScreen} />
        <Stack.Screen name="BuyCard" component={BuyCardScreen} />
        <Stack.Screen name="Receive" component={ReceiveScreen} />
        <Stack.Screen name="Send" component={SendScreen} />
        <Stack.Screen name="Transfer" component={TransferScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="HistoryDetails" component={HistoryDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
