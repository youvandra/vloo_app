
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
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.content}>
        <View style={styles.iconContainer}>
          <CheckCircle color={COLORS.accent} size={80} />
        </View>

        <Text style={styles.title}>VLOO Created!</Text>
        <Text style={styles.subtitle}>
          The card is now bound successfully.
        </Text>
        
        <View style={styles.idContainer}>
          <Text style={styles.idLabel}>CARD ID</Text>
          <Text style={styles.idValue}>{cardId}</Text>
        </View>

        {/* Display Wallets */}
        <View style={styles.walletsContainer}>
          {walletAddresses && Array.isArray(walletAddresses) ? (
            walletAddresses.map((wallet: any, index: number) => (
              <View key={index} style={styles.walletRow}>
                <Text style={styles.walletType}>{wallet.type}</Text>
                <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
                  {wallet.address}
                </Text>
              </View>
            ))
          ) : (
             <View style={styles.walletRow}>
                <Text style={styles.walletType}>Ethereum</Text>
                <Text style={styles.walletAddress} numberOfLines={1} ellipsizeMode="middle">
                  {address}
                </Text>
              </View>
          )}
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
    backgroundColor: '#000',
  },
  content: { 
    flex: 1, 
    padding: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconContainer: { 
    marginBottom: 32,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 32, 
    color: '#fff', 
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    color: '#999', 
    textAlign: 'center', 
    marginBottom: 32,
    maxWidth: 280,
  },
  idContainer: {
    backgroundColor: '#111',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  idLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    letterSpacing: 1,
  },
  idValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#fff',
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
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
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
    color: '#ccc',
    flex: 1,
  },
  doneButton: { 
    width: '100%', 
    height: 56,
  }
});
