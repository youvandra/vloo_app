
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.branding}>
          <Text style={styles.title}>VLOO</Text>
          <Text style={styles.subtitle}>Access as a Gift</Text>
        </View>

        <View style={styles.actions}>
          <Button 
            title="Giver" 
            onPress={() => navigation.navigate('GiverCreate')}
            variant="primary"
            style={styles.button}
          />
          
          <Button 
            title="Receiver" 
            onPress={() => navigation.navigate('ReceiverScan')}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  branding: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { 
    fontFamily: FONTS.displayBlack,
    fontSize: 80, 
    color: COLORS.primary, 
    marginBottom: 0,
    lineHeight: 90,
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular,
    fontSize: 20, 
    color: COLORS.foreground,
    letterSpacing: 2,
    opacity: 0.6,
  },
  actions: {
    width: '100%',
    paddingBottom: 20,
    gap: 16,
  },
  button: {
    width: '100%',
  }
});
