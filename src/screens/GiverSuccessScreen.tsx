
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { CheckCircle, Copy } from 'lucide-react-native';

export default function GiverSuccessScreen({ route, navigation }: any) {
  const { address, cardId } = route.params;

  const copyToClipboard = () => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  return (
    <View style={styles.container}>
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
            style={{ marginTop: 15, paddingVertical: 12 }}
            textStyle={{ fontSize: 14 }}
          />
        </Card>

        <View style={styles.infoContainer}>
          <Text style={styles.info}>Card ID: {cardId}</Text>
          <Text style={styles.info}>Send ETH to this address.</Text>
        </View>

        <Button 
          title="Done" 
          onPress={() => navigation.popToTop()} 
          variant="primary"
          style={{ width: '100%', marginTop: 30 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  iconContainer: { marginBottom: 20 },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 32, 
    color: COLORS.foreground, 
    marginBottom: 10 
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    color: COLORS.foreground, 
    textAlign: 'center', 
    marginBottom: 40,
    opacity: 0.7
  },
  addressCard: { width: '100%', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.7)' },
  label: { 
    fontFamily: FONTS.bodyBold, 
    fontSize: 12, 
    color: COLORS.foreground, 
    marginBottom: 8, 
    opacity: 0.5,
    textTransform: 'uppercase'
  },
  address: { 
    fontFamily: 'Courier', 
    fontSize: 13, 
    color: COLORS.foreground, 
    marginBottom: 10,
    textAlign: 'center'
  },
  infoContainer: { alignItems: 'center', gap: 5 },
  info: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 14, 
    color: COLORS.foreground, 
    opacity: 0.6 
  }
});
