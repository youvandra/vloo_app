
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, StatusBar, Platform, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateDeterministicPrivateKey } from '../../lib/crypto';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Lock, Unlock, MessageSquare, AlertCircle, Copy, Key } from 'lucide-react-native';

export default function ReceiverClaimScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [timeLeft, setTimeLeft] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [privateKey, setPrivateKey] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const calculateTime = () => {
      const now = new Date();
      // Handle null unlock_date (unlocked immediately)
      if (!vloo.unlock_date) {
        handleUnlock();
        return;
      }
      
      const unlockDate = new Date(vloo.unlock_date);
      const diff = unlockDate.getTime() - now.getTime();

      if (diff <= 0) {
        handleUnlock();
        if (timer) clearInterval(timer);
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
        setLoading(false);
      }
    };

    const handleUnlock = () => {
        setTimeLeft('Unlocked!');
        setIsUnlocked(true);
        setLoading(false);
        // Generate Private Key
        // Note: Passphrase is no longer stored in DB. 
        // If we need to show private key, we must prompt user for passphrase.
        if (vloo.passphrase && vloo.id) {
            const key = generateDeterministicPrivateKey(vloo.id, vloo.passphrase);
            setPrivateKey(key);
        }
    };

    calculateTime();
    timer = setInterval(calculateTime, 1000);

    return () => clearInterval(timer);
  }, [vloo.unlock_date, vloo.id, vloo.passphrase]);

  const copyToClipboard = () => {
      if (privateKey) {
          Clipboard.setString(privateKey);
          Alert.alert('Copied', 'Private key copied to clipboard');
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
            <Text style={styles.brandBadgeText}>VLOO MESSAGE</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
             <View style={styles.iconWrapper}>
               {isUnlocked ? (
                 <Unlock size={48} color={COLORS.primary} />
               ) : (
                 <Lock size={48} color={COLORS.error} />
               )}
             </View>
             
             <Text style={styles.statusTitle}>
               {isUnlocked ? 'Vloo Unlocked' : 'Vloo Locked'}
             </Text>
             
             {!isUnlocked && (
               <Text style={styles.timerText}>Unlocks in: {timeLeft}</Text>
             )}

             <View style={styles.divider} />

             <View style={styles.messageSection}>
               <Text style={styles.label}>Message</Text>
               <View style={styles.messageBox}>
                 {isUnlocked ? (
                    <Text style={styles.messageText}>{vloo.message || 'No message provided.'}</Text>
                 ) : (
                    <Text style={styles.blurredText}>This message is locked until the timer expires.</Text>
                 )}
               </View>
             </View>

             {/* Private Key Section */}
             {isUnlocked && privateKey && (
                <View style={styles.privateKeySection}>
                    <View style={styles.divider} />
                    <Text style={styles.label}>Private Key Account</Text>
                    <TouchableOpacity 
                        style={styles.privateKeyBox}
                        onPress={copyToClipboard}
                        activeOpacity={0.7}
                    >
                        <View style={styles.privateKeyContent}>
                            <Key size={20} color={COLORS.primary} style={{ marginRight: 12 }} />
                            <Text style={styles.privateKeyText} numberOfLines={1} ellipsizeMode="middle">
                                {privateKey}
                            </Text>
                        </View>
                        <Copy size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.helperText}>
                        Tap to copy. Import this key into your wallet to claim assets.
                    </Text>
                </View>
             )}
          </View>
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
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 8,
  },
  brandBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  brandBadgeText: {
    color: '#fff',
    fontFamily: FONTS.displayBold,
    fontSize: 12,
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  iconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  timerText: {
    fontFamily: 'Courier',
    fontSize: 18,
    color: COLORS.error,
    marginBottom: 16,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 24,
  },
  messageSection: {
    width: '100%',
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  messageBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
  },
  messageText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 18,
    color: '#000',
    lineHeight: 28,
  },
  blurredText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  privateKeySection: {
    width: '100%',
  },
  privateKeyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#B0D4FF',
  },
  privateKeyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  privateKeyText: {
    fontFamily: 'Courier',
    fontSize: 14,
    color: COLORS.primary,
    flex: 1,
  },
  helperText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
