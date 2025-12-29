
import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { CheckCircle } from 'lucide-react-native';

export default function GiverSuccessScreen({ route, navigation }: any) {
  const { cardId, walletAddresses, address } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle color={COLORS.primary} size={80} />
        </View>

        <Text style={styles.title}>VLOO Created!</Text>
        <Text style={styles.subtitle}>
          The card is now bound successfully.
        </Text>
        
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>CARD ID</Text>
          <Text style={styles.idValue}>{cardId}</Text>
        </View>
        <Button 
          title="Done" 
          onPress={() => navigation.navigate('GiverDashboard')} 
          variant="primary"
          style={[styles.doneButton, { backgroundColor: COLORS.primary }]}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  content: { 
    flex: 1, 
    padding: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconContainer: { 
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 32, 
    color: '#000', 
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 32,
    maxWidth: 280,
  },
  idContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  idLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    letterSpacing: 1,
  },
  idValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  walletsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  walletType: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
    width: 80,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  doneButton: { 
    width: '100%', 
    height: 56,
  }
});
