
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createRandomWallet } from '../../lib/wallet';
import { encryptData } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Radio } from 'lucide-react-native';

export default function GiverBindScreen({ route, navigation }: any) {
  const { purpose, receiverName, message, passphrase, unlockDate } = route.params;
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

      // 4. Get User
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      let user = session?.user;
      
      if (sessionError || !user) {
        console.log('Session missing or invalid in BindScreen, attempting refresh...');
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshData.session?.user) {
          user = refreshData.session.user;
          console.log('Session successfully refreshed');
        } else {
           console.error('Auth User Error (after refresh):', refreshError || sessionError);
           Alert.alert('Session Expired', 'Please log in again to continue.', [
             { text: 'OK', onPress: () => navigation.navigate('GiverLogin') }
           ]);
           setLoading(false);
           return;
        }
      }

      console.log('Binding VLOO for User:', user.id);

      // 5. Save to Supabase
      setStatus('Saving to VLOO network...');
      
      const insertPayload = {
        encrypted_private_key: encryptedKey,
        wallet_address: address,
        unlock_date: unlockDate,
        message: message,
        status: 'locked',
        giver_id: user.id,
        receiver_name: receiverName
      };
      
      console.log('Insert Payload:', JSON.stringify(insertPayload));

      const { data: vlooData, error: vlooError } = await supabase
        .from('vloos')
        .insert([insertPayload])
        .select()
        .single();

      if (vlooError) {
         console.error('Supabase Insert Error:', vlooError);
         throw new Error(`Database Error: ${vlooError.message} (Code: ${vlooError.code})`);
      }

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
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header - Matches ReceiverScanScreen */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>BIND VLOO</Text>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Radio color={COLORS.accent} size={80} />
          </View>
          
          <View style={styles.textWrapper}>
            <Text style={styles.headline}>
              Tap to <Text style={styles.headlineHighlight}>Bind</Text>
            </Text>
            <Text style={styles.subheadline}>
              Hold the NFC card near the phone to securely bind this VLOO.
            </Text>
          </View>
          
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.accent} />
              <Text style={styles.statusText}>{status}</Text>
            </View>
          ) : (
            <View style={styles.actionContainer}>
              <Button 
                title="Tap to Simulate NFC (Dev)" 
                onPress={() => handleBind(true)} 
                variant="primary"
                gradient={['#d199f9', '#9F60D1']}
                style={styles.actionButton}
              />
            </View>
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  brandBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#fff',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  textWrapper: {
    marginBottom: 48,
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#fff',
    lineHeight: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  headlineHighlight: {
    color: COLORS.accent,
  },
  subheadline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#999',
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
    alignSelf: 'center',
  },
  loader: {
    alignItems: 'center',
    gap: 16,
  },
  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#fff',
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
});
