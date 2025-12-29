
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptData } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Lock, Unlock, MessageSquare } from 'lucide-react-native';

export default function ReceiverClaimScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [passphrase, setPassphrase] = useState('');
  const [decryptedKeys, setDecryptedKeys] = useState<{ label: string, key: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const calculateTime = () => {
      const now = new Date();
      const unlockDate = new Date(vloo.unlock_date);
      const diff = unlockDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Unlocked!');
        setIsUnlocked(true);
        if (timer) clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
      setLoading(false);
    };

    calculateTime();
    timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [vloo.unlock_date]);

  const handleClaim = async () => {
    if (!passphrase) {
      Alert.alert('Missing Passphrase', 'Please enter the passphrase.');
      return;
    }

    try {
      let encryptedKey = vloo.encrypted_private_key;

      // Fetch encrypted key securely via RPC if not present in initial load
      if (!encryptedKey && vloo.id !== 'demo-id') {
         const { data, error } = await supabase.rpc('get_vloo_private_key', {
             p_vloo_id: vloo.id
         });

         if (error) {
             console.error('RPC Error:', error);
             throw new Error('Failed to retrieve secure data.');
         }
         encryptedKey = data;
      }

      // Fallback for demo
      if (!encryptedKey && vloo.id === 'demo-id') {
          encryptedKey = 'demo-key';
      }

      if (!encryptedKey) {
          Alert.alert('Error', 'Could not retrieve key data.');
          return;
      }

      const keysToShow: { label: string, key: string }[] = [];

      // Handle both legacy string and new object format
      if (typeof encryptedKey === 'string') {
        const key = decryptData(encryptedKey, passphrase);
        if (key) keysToShow.push({ label: 'Private Key', key });
      } else if (typeof encryptedKey === 'object' && encryptedKey !== null) {
        // Iterate through keys (ethereum, bitcoin, etc.)
        if (encryptedKey.ethereum) {
          const ethKey = decryptData(encryptedKey.ethereum, passphrase);
          if (ethKey) keysToShow.push({ label: 'Ethereum Private Key', key: ethKey });
        }
        if (encryptedKey.bitcoin) {
          const btcKey = decryptData(encryptedKey.bitcoin, passphrase);
          if (btcKey) keysToShow.push({ label: 'Bitcoin Private Key', key: btcKey });
        }
      }

      if (keysToShow.length === 0) {
        Alert.alert('Incorrect Passphrase', 'Decryption failed.');
        return;
      }

      setDecryptedKeys(keysToShow);
      
      // Update status in DB (optional for MVP)
      if (vloo.id !== 'demo-id') {
        await supabase
          .from('vloos')
          .update({ status: 'claimed' })
          .eq('id', vloo.id);
      }

      navigation.navigate('ClaimSuccess', { decryptedKeys: keysToShow });

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#000" size={24} />
          </TouchableOpacity>
          <View style={styles.brandBadge}>
            <Text style={styles.brandBadgeText}>CLAIM VLOO</Text>
          </View>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Message Section */}
          <View style={styles.section}>
            <View style={styles.iconWrapper}>
              <MessageSquare color={COLORS.accent} size={32} />
            </View>
            <Text style={styles.label}>MESSAGE FROM GIVER</Text>
            <Text style={styles.messageText}>"{vloo.message}"</Text>
          </View>

          {/* Status Section */}
          {loading ? (
            <View style={[styles.section, styles.statusSection]}>
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonIcon} />
                <View style={styles.skeletonTitle} />
              </View>
              <View style={styles.skeletonTimerContainer}>
                <View style={styles.skeletonLabel} />
                <View style={styles.skeletonValue} />
              </View>
            </View>
          ) : (
            <View style={[styles.section, styles.statusSection]}>
              <View style={styles.statusRow}>
                {isUnlocked ? (
                  <Unlock color={COLORS.accent} size={24} />
                ) : (
                  <Lock color="#666" size={24} />
                )}
                <Text style={[styles.statusTitle, isUnlocked && styles.activeStatus]}>
                  {isUnlocked ? 'READY TO CLAIM' : 'LOCKED'}
                </Text>
              </View>
              
              {!isUnlocked && (
                <View style={styles.timerContainer}>
                  <Text style={styles.timerLabel}>UNLOCKS IN</Text>
                  <Text style={styles.timerValue}>{timeLeft}</Text>
                </View>
              )}
            </View>
          )}

          {/* Unlock Section */}
          {isUnlocked && decryptedKeys.length === 0 && (
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>ENTER PASSPHRASE</Text>
              <TextInput
                style={styles.input}
                placeholder="Passphrase"
                placeholderTextColor="#999"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
                autoCapitalize="none"
              />
              <Button 
                title="Unlock & Claim" 
                onPress={handleClaim} 
                variant="primary"
                style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  brandBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#000',
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  section: {
    marginTop: 32,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  messageText: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 20,
    color: '#000',
    textAlign: 'center',
    lineHeight: 28,
  },
  statusSection: {
    marginTop: 48,
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#666',
    letterSpacing: 0.5,
  },
  activeStatus: {
    color: '#000',
  },
  timerContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  timerLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  timerValue: {
    fontFamily: 'Courier',
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  formSection: {
    marginTop: 40,
    width: '100%',
  },
  inputLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#000',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
  },
  skeletonTitle: {
    width: 150,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  skeletonTimerContainer: {
    alignItems: 'center',
    width: '100%',
  },
  skeletonLabel: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginBottom: 8,
  },
  skeletonValue: {
    width: 120,
    height: 32,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
});
