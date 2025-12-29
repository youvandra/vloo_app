
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptData } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Lock, Unlock, Gift, Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function ReceiverClaimScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [passphrase, setPassphrase] = useState('');
  const [decryptedKeys, setDecryptedKeys] = useState<{ label: string, key: string }[]>([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    // ... timer logic (unchanged)
    const timer = setInterval(() => {
      const now = new Date();
      const unlockDate = new Date(vloo.unlock_date);
      const diff = unlockDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Unlocked!');
        setIsUnlocked(true);
        clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [vloo.unlock_date]);

  const handleClaim = async () => {
    if (!passphrase) {
      Alert.alert('Missing Passphrase', 'Please enter the passphrase.');
      return;
    }

    try {
      const keysToShow: { label: string, key: string }[] = [];

      // Handle both legacy string and new object format
      if (typeof vloo.encrypted_private_key === 'string') {
        const key = decryptData(vloo.encrypted_private_key, passphrase);
        if (key) keysToShow.push({ label: 'Private Key', key });
      } else if (typeof vloo.encrypted_private_key === 'object' && vloo.encrypted_private_key !== null) {
        // Iterate through keys (ethereum, bitcoin, etc.)
        if (vloo.encrypted_private_key.ethereum) {
          const ethKey = decryptData(vloo.encrypted_private_key.ethereum, passphrase);
          if (ethKey) keysToShow.push({ label: 'Ethereum Private Key', key: ethKey });
        }
        if (vloo.encrypted_private_key.bitcoin) {
          const btcKey = decryptData(vloo.encrypted_private_key.bitcoin, passphrase);
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

    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  const copyToClipboard = async (key: string) => {
    await Clipboard.setStringAsync(key);
    Alert.alert('Copied', 'Private key copied to clipboard');
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
              <Gift color={COLORS.accent} size={32} />
            </View>
            <Text style={styles.label}>MESSAGE FROM GIVER</Text>
            <Text style={styles.messageText}>"{vloo.message}"</Text>
          </View>

          {/* Status Section */}
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

          {/* Success Section */}
          {decryptedKeys.length > 0 ? (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>Successfully Claimed!</Text>
              <Text style={styles.successSubtitle}>
                Import these private keys into your wallets immediately.
              </Text>
              
              {decryptedKeys.map((item, index) => (
                <View key={index} style={[styles.keyContainer, { marginBottom: 12 }]}>
                  <Text style={styles.keyLabel}>{item.label}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.keyText} numberOfLines={1} ellipsizeMode="middle">{item.key}</Text>
                    <TouchableOpacity onPress={() => copyToClipboard(item.key)} style={styles.copyButton}>
                      <Copy color="#000" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              <Text style={styles.warningText}>
                Do not share these keys with anyone else.
              </Text>
            </View>
          ) : null}
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
  successSection: {
    marginTop: 40,
    width: '100%',
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#4ADE80', // Green
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  keyContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEE',
    width: '100%',
    marginBottom: 24,
  },
  keyLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  keyText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    color: COLORS.primary,
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#EEE',
    borderRadius: 8,
  },
  warningText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
  },
});
