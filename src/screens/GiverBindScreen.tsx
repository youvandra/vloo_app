
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { createRandomWallet } from '../lib/wallet';
import { encryptData } from '../lib/crypto';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS } from '../lib/theme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowLeft, Radio } from 'lucide-react-native';

export default function GiverBindScreen({ route, navigation }: any) {
  const { purpose, message, passphrase, unlockDate } = route.params;
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Ready to bind card');

  const handleBind = async (mock: boolean = false) => {
    setLoading(true);
    setStatus('Generating secure wallet...');

    try {
      // 1. Generate Wallet
      const wallet = createRandomWallet();
      const privateKey = wallet.privateKey;
      const address = wallet.address;

      // 2. Encrypt Private Key
      setStatus('Encrypting keys...');
      const encryptedKey = encryptData(privateKey, passphrase);

      // 3. Get NFC ID (Mock or Real)
      let cardId = '';
      if (mock) {
        cardId = 'mock-nfc-id-' + Math.floor(Math.random() * 10000);
      } else {
        cardId = 'simulated-real-id'; // Fallback for MVP
      }

      // 4. Save to Supabase
      setStatus('Saving to VLOO network...');
      
      const { data: vlooData, error: vlooError } = await supabase
        .from('vloos')
        .insert([{
          encrypted_private_key: encryptedKey,
          wallet_address: address,
          unlock_date: unlockDate,
          message: message,
          status: 'locked'
        }])
        .select()
        .single();

      if (vlooError) throw vlooError;

      const { error: cardError } = await supabase
        .from('cards')
        .insert([{
          id: cardId,
          vloo_id: vlooData.id
        }]);

      if (cardError) throw cardError;

      navigation.navigate('GiverSuccess', { address, cardId });

    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', error.message || 'Failed to bind VLOO');
      setStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={COLORS.foreground} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bind Card</Text>
      </View>
      
      <View style={styles.content}>
        <Card style={styles.card}>
          <View style={styles.iconContainer}>
            <Radio color={COLORS.primary} size={60} />
          </View>
          
          <Text style={styles.title}>Tap to Bind</Text>
          <Text style={styles.subtitle}>
            Hold the NFC card near the phone to securely bind this VLOO.
          </Text>
          
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.status}>{status}</Text>
            </View>
          ) : (
            <Button 
              title="Tap to Simulate NFC (Dev)" 
              onPress={() => handleBind(true)} 
              variant="primary"
              style={{ marginTop: 20, width: '100%' }}
            />
          )}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 24, 
    paddingBottom: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { marginRight: 16 },
  headerTitle: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 28, 
    color: COLORS.foreground 
  },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { alignItems: 'center', paddingVertical: 40 },
  iconContainer: { 
    marginBottom: 20, 
    padding: 20, 
    backgroundColor: 'rgba(11, 28, 196, 0.1)', 
    borderRadius: 50 
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 24, 
    color: COLORS.foreground, 
    marginBottom: 10 
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    textAlign: 'center', 
    color: COLORS.foreground, 
    marginBottom: 30,
    opacity: 0.7
  },
  loader: { alignItems: 'center', marginTop: 20 },
  status: { 
    marginTop: 10, 
    color: COLORS.foreground, 
    fontFamily: FONTS.bodySemiBold 
  }
});
