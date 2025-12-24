
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import 'react-native-url-polyfill/auto';
import React, { useEffect, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { 
  MuseoModerno_600SemiBold, 
  MuseoModerno_700Bold, 
  MuseoModerno_900Black 
} from '@expo-google-fonts/museomoderno';
import { 
  BeVietnamPro_400Regular, 
  BeVietnamPro_600SemiBold, 
  BeVietnamPro_700Bold 
} from '@expo-google-fonts/be-vietnam-pro';

import AppNavigator from './src/navigation/AppNavigator';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    MuseoModerno_600SemiBold,
    MuseoModerno_700Bold,
    MuseoModerno_900Black,
    BeVietnamPro_400Regular,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar style="dark" />
      <AppNavigator />
    </SafeAreaProvider>
  );
}
