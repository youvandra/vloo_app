
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import { Vloo } from '../../lib/types';

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
    <View style={styles.container}>
      <Text style={styles.messageLabel}>Message from Giver:</Text>
      <Text style={styles.message}>"{vloo.message}"</Text>
      
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balance}>{balance} ETH</Text>
        <Text style={styles.address}>{vloo.wallet_address.substring(0, 10)}...{vloo.wallet_address.substring(38)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text style={[styles.status, { color: isLocked ? 'orange' : 'green' }]}>
          {isLocked ? `Locked until ${unlockDate.toLocaleDateString()}` : 'Ready to Claim'}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.popToTop()}>
          <Text style={styles.secondaryButtonText}>I'll open this later</Text>
        </TouchableOpacity>

        {!isLocked && (
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('ReceiverClaim', { vloo })}>
            <Text style={styles.primaryButtonText}>I'm ready to claim</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f9f9f9', justifyContent: 'center' },
  messageLabel: { fontSize: 14, color: '#888', marginBottom: 10, textAlign: 'center' },
  message: { fontSize: 22, fontStyle: 'italic', color: '#333', textAlign: 'center', marginBottom: 40 },
  card: { backgroundColor: 'white', padding: 30, borderRadius: 20, alignItems: 'center', shadowColor: '#000', shadowOffset: {width:0,height:5}, shadowOpacity:0.1, shadowRadius:10, marginBottom: 40 },
  balanceLabel: { fontSize: 14, color: '#aaa', marginBottom: 5 },
  balance: { fontSize: 36, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  address: { fontSize: 12, color: '#ccc', fontFamily: 'Courier' },
  statusContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  statusLabel: { fontSize: 16, marginRight: 5, color: '#555' },
  status: { fontSize: 16, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 40, left: 30, right: 30 },
  secondaryButton: { padding: 15, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#888', fontSize: 16 },
  primaryButton: { backgroundColor: '#8ec5fc', padding: 18, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
