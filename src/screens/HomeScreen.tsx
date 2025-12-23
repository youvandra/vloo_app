
import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { Gift, UserCheck } from 'lucide-react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>VLOO</Text>
          <Text style={styles.subtitle}>Access as a Gift</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Who are you?</Text>
          
          <Button 
            title="I am a Giver 🎁" 
            onPress={() => navigation.navigate('GiverCreate')}
            variant="primary"
            style={styles.button}
          />
          
          <Button 
            title="I am a Receiver 🧍" 
            onPress={() => navigation.navigate('ReceiverScan')}
            variant="secondary"
            style={styles.button}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  content: {
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  title: { 
    fontFamily: FONTS.displayBlack,
    fontSize: 64, 
    color: COLORS.primary, 
    marginBottom: 10 
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular,
    fontSize: 20, 
    color: COLORS.foreground,
    letterSpacing: 1,
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 30,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.foreground,
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    marginBottom: 16,
  }
});
