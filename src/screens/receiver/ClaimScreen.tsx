
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, StatusBar } from 'react-native';
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
  const [decryptedKey, setDecryptedKey] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
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
      const key = decryptData(vloo.encrypted_private_key, passphrase);
      if (!key) {
        Alert.alert('Incorrect Passphrase', 'Decryption failed.');
        return;
      }

      setDecryptedKey(key);
      
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

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(decryptedKey);
    Alert.alert('Copied', 'Private key copied to clipboard');
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
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
          {isUnlocked && !decryptedKey && (
            <View style={styles.formSection}>
              <Text style={styles.inputLabel}>ENTER PASSPHRASE</Text>
              <TextInput
                style={styles.input}
                placeholder="Passphrase"
                placeholderTextColor="#666"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
                autoCapitalize="none"
              />
              <Button 
                title="Unlock & Claim" 
                onPress={handleClaim} 
                variant="primary"
                gradient={['#d199f9', '#9F60D1']}
                style={styles.actionButton}
              />
            </View>
          )}

          {/* Success Section */}
          {decryptedKey ? (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>Successfully Claimed!</Text>
              <Text style={styles.successSubtitle}>
                Import this private key into your wallet immediately.
              </Text>
              
              <View style={styles.keyContainer}>
                <Text style={styles.keyText}>{decryptedKey}</Text>
                <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                  <Copy color="#fff" size={20} />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.warningText}>
                Do not share this key with anyone else.
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
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
  },
  statusSection: {
    marginTop: 48,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#fff',
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
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: '#fff',
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
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 24,
  },
  keyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  keyText: {
    flex: 1,
    fontFamily: 'Courier',
    fontSize: 14,
    color: '#fff',
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  warningText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#FF4444',
    textAlign: 'center',
  },
});
