
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import { ethers } from 'ethers';
import { Vloo } from '../../lib/types';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export default function ReceiverViewScreen({ route, navigation }: any) {
  const { vloo } = route.params as { vloo: Vloo };
  const [balance, setBalance] = useState('0.0');
  const [loading, setLoading] = useState(true);

  const unlockDate = new Date(vloo.unlock_date);
  const now = new Date();
  const isLocked = now < unlockDate;

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Use a default provider (e.g., Mainnet or Goerli). 
        // For MVP, we might default to Goerli or just show 0 if no internet/config.
        // const provider = ethers.getDefaultProvider('goerli');
        // const bal = await provider.getBalance(vloo.wallet_address);
        // setBalance(ethers.utils.formatEther(bal));
        
        // Mock balance for UI demo
        setBalance('0.05'); 
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [vloo.wallet_address]);

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Text style={styles.messageLabel}>Message from Giver:</Text>
          <Text style={styles.message}>"{vloo.message}"</Text>
          
          <Card style={styles.card}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balance}>{balance} ETH</Text>
            <Text style={styles.address}>{vloo.wallet_address.substring(0, 10)}...{vloo.wallet_address.substring(38)}</Text>
          </Card>

          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={[styles.status, { color: isLocked ? '#FFD700' : '#4ADE80' }]}>
              {isLocked ? `Locked until ${unlockDate.toLocaleDateString()}` : 'Ready to Claim'}
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.popToTop()}>
              <Text style={styles.secondaryButtonText}>I'll open this later</Text>
            </TouchableOpacity>

            {!isLocked && (
              <Button 
                title="I'm ready to claim" 
                onPress={() => navigation.navigate('ReceiverClaim', { vloo })}
                variant="primary"
                gradient={['#d199f9', '#9F60D1']}
                style={{ width: '100%' }}
              />
            )}
          </View>
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
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  messageLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 22,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#111',
    borderColor: '#333',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  balanceLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  balance: {
    fontFamily: FONTS.displayBold,
    fontSize: 36,
    color: '#fff',
    marginBottom: 10,
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  statusLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    marginRight: 5,
    color: '#888',
  },
  status: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 30,
    right: 30,
    gap: 15,
  },
  secondaryButton: {
    padding: 15,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: FONTS.bodyRegular,
    color: '#888',
    fontSize: 16,
  },
});
