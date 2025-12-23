
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { decryptData } from '../lib/crypto';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft color={COLORS.foreground} size={24} />
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
              <Unlock color={COLORS.primary} size={24} />
            ) : (
              <Lock color={COLORS.foreground} size={24} />
            )}
            <Text style={styles.statusTitle}>
              {isUnlocked ? 'Ready to Claim' : 'Locked'}
            </Text>
          </View>
          
          {!isUnlocked && (
            <Text style={styles.timer}>Unlocks in: {timeLeft}</Text>
          )}

          {isUnlocked && !decryptedKey && (
            <View style={{ width: '100%', marginTop: 20 }}>
              <Input
                label="Passphrase"
                placeholder="Enter passphrase to unlock"
                value={passphrase}
                onChangeText={setPassphrase}
                secureTextEntry
              />
              <Button 
                title="Unlock & Claim" 
                onPress={handleClaim} 
                variant="primary"
                style={{ marginTop: 10 }}
              />
            </View>
          )}

          {decryptedKey ? (
            <View style={styles.keyContainer}>
              <Text style={styles.successText}>Success! Private Key:</Text>
              <Text style={styles.privateKey}>{decryptedKey}</Text>
              <Text style={styles.warning}>
                Import this key into MetaMask immediately.
              </Text>
            </View>
          ) : null}
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
  content: { padding: 24 },
  messageCard: { marginBottom: 20, alignItems: 'center' },
  iconContainer: { marginBottom: 15 },
  messageLabel: { 
    fontFamily: FONTS.bodyBold, 
    fontSize: 14, 
    color: COLORS.foreground, 
    opacity: 0.6,
    marginBottom: 5 
  },
  messageText: { 
    fontFamily: FONTS.bodySemiBold, 
    fontSize: 18, 
    color: COLORS.foreground, 
    textAlign: 'center', 
    fontStyle: 'italic' 
  },
  statusCard: { alignItems: 'center', paddingVertical: 30 },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  statusTitle: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 24, 
    color: COLORS.foreground 
  },
  timer: { 
    fontFamily: 'Courier', 
    fontSize: 20, 
    color: COLORS.foreground, 
    marginTop: 10 
  },
  keyContainer: { marginTop: 20, width: '100%', alignItems: 'center' },
  successText: { 
    color: 'green', 
    fontFamily: FONTS.bodyBold, 
    marginBottom: 10 
  },
  privateKey: { 
    backgroundColor: '#eee', 
    padding: 10, 
    borderRadius: 8, 
    fontFamily: 'Courier', 
    fontSize: 12, 
    width: '100%',
    textAlign: 'center',
    marginBottom: 10
  },
  warning: { 
    color: 'red', 
    fontSize: 12, 
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center' 
  }
});
