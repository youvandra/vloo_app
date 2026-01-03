
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, TextInput, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { generateDeterministicPrivateKey } from '../../lib/crypto';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { ArrowLeft, Unlock, Key, Copy, Eye, EyeOff } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';

export default function ReceiverClaimScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [passphrase, setPassphrase] = useState('');
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [showPassphrase, setShowPassphrase] = useState(false);

  const handleUnlock = () => {
      if (!passphrase.trim()) {
          Alert.alert('Error', 'Please enter the passphrase');
          return;
      }
      
      try {
          const key = generateDeterministicPrivateKey(vloo.id, passphrase);
          setPrivateKey(key);
      } catch (e) {
          Alert.alert('Error', 'Failed to generate key');
      }
  };

  const copyToClipboard = async () => {
      if (privateKey) {
          await Clipboard.setStringAsync(privateKey);
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
            <Text style={styles.brandBadgeText}>CLAIM VLOO</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
             <View style={styles.iconWrapper}>
                 <Unlock size={48} color={COLORS.primary} />
             </View>
             
             <Text style={styles.statusTitle}>
               Claim Your Assets
             </Text>
             
             <Text style={styles.description}>
                Enter the passphrase provided by the giver to unlock your private key.
             </Text>

             <View style={styles.divider} />

             {!privateKey ? (
                 <View style={styles.inputSection}>
                    <Text style={styles.label}>Passphrase</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter passphrase"
                            placeholderTextColor="#999"
                            value={passphrase}
                            onChangeText={setPassphrase}
                            secureTextEntry={!showPassphrase}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity onPress={() => setShowPassphrase(!showPassphrase)} style={styles.eyeButton}>
                            {showPassphrase ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
                        </TouchableOpacity>
                    </View>
                    
                    <Button 
                        title="Unlock Private Key"
                        onPress={handleUnlock}
                        variant="primary"
                        style={{ marginTop: 24 }}
                    />
                 </View>
             ) : (
                 <View style={styles.privateKeySection}>
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
  description: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
    maxWidth: '90%',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 24,
  },
  inputSection: {
      width: '100%',
  },
  passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 12,
      backgroundColor: '#f9f9f9',
      paddingHorizontal: 16,
  },
  passwordInput: {
      flex: 1,
      height: 50,
      fontSize: 16,
      fontFamily: FONTS.bodyRegular,
      color: '#000',
  },
  eyeButton: {
      padding: 8,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
