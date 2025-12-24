
import React from 'react';
import { View, Text, StyleSheet, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { CheckCircle, Copy } from 'lucide-react-native';

export default function GiverSuccessScreen({ route, navigation }: any) {
  const { address, cardId } = route.params;

  const copyToClipboard = () => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <CheckCircle color={COLORS.primary} size={60} />
          </View>

          <Text style={styles.title}>VLOO Created!</Text>
          <Text style={styles.subtitle}>
            The card is now bound. Fund the wallet below to complete the gift.
          </Text>
          
          <Card style={styles.addressCard}>
            <Text style={styles.label}>Wallet Address</Text>
            <Text style={styles.address}>{address}</Text>
            
            <Button 
              title="Copy Address" 
              onPress={copyToClipboard}
              variant="outline"
              style={{ marginTop: 15, paddingVertical: 12, borderColor: '#444' }}
              textStyle={{ fontSize: 14, color: '#fff' }}
            />
          </Card>

          <View style={styles.infoContainer}>
            <Text style={styles.info}>Card ID: {cardId}</Text>
            <Text style={styles.info}>Send ETH to this address.</Text>
          </View>

          <Button 
            title="Done" 
            onPress={() => navigation.navigate('GiverDashboard')} 
            variant="primary"
            style={{ width: '100%', marginTop: 30 }}
            gradient={['#d199f9', '#9F60D1']}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  addressCard: {
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#111',
    borderColor: '#333',
    padding: 24,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoContainer: {
    alignItems: 'center',
    gap: 5,
  },
  info: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
  }
});
