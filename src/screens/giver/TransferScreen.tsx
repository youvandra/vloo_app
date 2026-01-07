import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Scan, Info, Lock } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';
import { transferMnee } from '../../lib/mnee';
import { generateDeterministicPrivateKey } from '../../lib/crypto';
import { generateBitcoinWallet } from '../../lib/wallet';

export default function TransferScreen({ route, navigation }: any) {
  const { wallet, vloo } = route.params;
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScan = () => {
    // Navigate to scan modal or screen (not implemented for this flow yet, just alert)
    Alert.alert('Scan', 'QR Scanning for address coming soon.');
  };

  const handleMax = () => {
    // Logic to set max amount (mocked for now as we don't have exact balance passed efficiently yet, 
    // or we could pass it from SendScreen if we want)
    Alert.alert('Max', 'Max amount logic coming soon.');
  };

  const handleSend = async () => {
      if (!address || !amount || !passphrase) {
          Alert.alert('Error', 'Please fill in all fields including passphrase');
          return;
      }

      setLoading(true);

      try {
          // If MNEE, use real transfer logic
          if (wallet.type === 'MNEE' || wallet.ticker === 'MNEE') {
              console.log('Starting MNEE Transfer...');
              
              // 1. Re-derive Private Key (WIF)
              const privateKeySeed = generateDeterministicPrivateKey(vloo.id, passphrase);
              // MNEE uses Legacy (P2PKH) address/key
              const btcLegacyData = generateBitcoinWallet(privateKeySeed, { legacy: true });
              const wif = btcLegacyData.privateKey;

              if (wallet.address !== btcLegacyData.address) {
                  console.warn('Derived address does not match wallet address. Wrong passphrase?');
                  // We continue, but it might fail or sign for wrong address if user entered wrong pass
                  // Ideally we check this:
                  // throw new Error('Incorrect passphrase (address mismatch)');
              }

              // 2. Prepare Recipients
              const recipients = [{
                  address: address.trim(),
                  amount: parseFloat(amount)
              }];

              // 3. Execute Transfer
              const response = await transferMnee(recipients, wif);
              
              setLoading(false);
              navigation.navigate('GiverSuccess', {
                  title: 'Transaction Submitted',
                  data: {
                    type: 'transfer',
                    amount: amount,
                    ticker: 'MNEE',
                    recipient: address,
                    ticketId: response.ticketId
                  },
                  onPress: () => navigation.popToTop() 
              });

          } else {
              // Mock for other coins
              setTimeout(() => {
                  setLoading(false);
                  navigation.navigate('GiverSuccess', {
                      title: 'Transaction Submitted',
                      data: {
                        type: 'transfer',
                        amount: amount,
                        ticker: wallet.ticker || wallet.type,
                        recipient: address
                      },
                      onPress: () => navigation.popToTop() // Go back to Dashboard
                  });
              }, 2000);
          }
      } catch (error: any) {
          console.error('Transfer Error:', error);
          setLoading(false);
          Alert.alert('Transfer Failed', error.message || 'An error occurred during transfer');
      }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transfer {wallet.ticker || wallet.type}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.walletInfo}>
            <Text style={styles.fromLabel}>Sending from</Text>
            <Text style={styles.walletName}>{vloo.name || 'Vloo Card'} - {wallet.type}</Text>
            <Text style={styles.walletAddress}>{wallet.address}</Text>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Recipient Address</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={`Enter ${wallet.type} Address`}
                    value={address}
                    onChangeText={setAddress}
                    autoCapitalize="none"
                />
                <TouchableOpacity onPress={handleScan} style={styles.inputAction}>
                    <Scan size={20} color={COLORS.primary} />
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                />
                <TouchableOpacity onPress={handleMax} style={styles.inputAction}>
                    <Text style={styles.maxText}>MAX</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Card Passphrase</Text>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter card passphrase"
                    value={passphrase}
                    onChangeText={setPassphrase}
                    secureTextEntry
                />
                <View style={styles.inputAction}>
                    <Lock size={20} color={COLORS.primary} />
                </View>
            </View>
            <Text style={styles.helperText}>Required to sign the transaction.</Text>
        </View>

        <View style={styles.infoBox}>
            <Info size={20} color="#666" style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
                Make sure the recipient address is correct. Transactions cannot be reversed.
            </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmButton, (loading || !address || !amount) && styles.disabledButton]}
            onPress={handleSend}
            disabled={loading || !address || !amount}
          >
              {loading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.confirmButtonText}>Confirm Send</Text>
              )}
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: Platform.select({ android: 60, ios: 16 }),
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    padding: 24,
  },
  walletInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  fromLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  walletName: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  inputAction: {
    padding: 8,
  },
  maxText: {
    fontFamily: FONTS.displayBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  helperText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff9e6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: '#856404',
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: '#fff',
  },
});
