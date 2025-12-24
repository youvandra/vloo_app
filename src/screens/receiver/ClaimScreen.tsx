
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptData } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { ArrowLeft, Lock, Unlock, Gift } from 'lucide-react-native';

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

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Claim VLOO</Text>
        </View>
        
        <View style={styles.content}>
          <Card style={styles.messageCard}>
            <View style={styles.iconContainer}>
              <Gift color={COLORS.primary} size={40} />
            </View>
            <Text style={styles.messageLabel}>Message from Giver:</Text>
            <Text style={styles.messageText}>"{vloo.message}"</Text>
          </Card>

          <Card style={styles.statusCard}>
            <View style={styles.statusHeader}>
              {isUnlocked ? (
                <Unlock color={COLORS.accent} size={24} />
              ) : (
                <Lock color={COLORS.error} size={24} />
              )}
              <Text style={[styles.statusTitle, { color: isUnlocked ? COLORS.accent : COLORS.error }]}>
                {isUnlocked ? 'Ready to Claim' : 'Locked'}
              </Text>
            </View>
            
            {!isUnlocked && (
              <Text style={styles.timer}>Unlocks in: {timeLeft}</Text>
            )}

            {isUnlocked && !decryptedKey && (
              <View style={styles.claimSection}>
                <Input
                  label="Passphrase"
                  placeholder="Enter secret passphrase"
                  value={passphrase}
                  onChangeText={setPassphrase}
                  secureTextEntry
                  style={{ backgroundColor: '#222', borderColor: '#444', color: '#fff' }}
                  labelStyle={{ color: '#ccc' }}
                  placeholderTextColor="#666"
                />
                <Button
                  title="Decrypt & Claim"
                  onPress={handleClaim}
                  variant="primary"
                  style={{ marginTop: 16 }}
                  gradient={['#d199f9', '#9F60D1']}
                />
              </View>
            )}

            {decryptedKey ? (
              <View style={styles.successSection}>
                <Text style={styles.successTitle}>Success!</Text>
                <Text style={styles.keyLabel}>Private Key:</Text>
                <View style={styles.keyBox}>
                    <Text style={styles.keyText}>{decryptedKey}</Text>
                </View>
                <Text style={styles.warning}>
                    Copy this key immediately. It will not be shown again.
                </Text>
              </View>
            ) : null}
          </Card>
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
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#fff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  messageCard: {
    marginBottom: 24,
    backgroundColor: '#111',
    borderColor: '#333',
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(11, 28, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  messageLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageText: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statusCard: {
    padding: 24,
    backgroundColor: '#111',
    borderColor: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    marginLeft: 12,
  },
  timer: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  claimSection: {
    marginTop: 24,
  },
  successSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: COLORS.accent,
    marginBottom: 16,
  },
  keyLabel: {
    fontFamily: FONTS.bodySemiBold,
    color: '#ccc',
    marginBottom: 8,
  },
  keyBox: {
    backgroundColor: '#222',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 16,
  },
  keyText: {
    fontFamily: 'monospace',
    color: '#fff',
    textAlign: 'center',
  },
  warning: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.error,
    textAlign: 'center',
  }
});
