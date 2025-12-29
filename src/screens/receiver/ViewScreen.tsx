
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import { Vloo } from '../../lib/types';
import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';

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

  const getWalletAddresses = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') {
      if (data.startsWith('[') || data.startsWith('{')) {
        try {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // ignore
        }
      }
      return [{ type: 'Ethereum', address: data }];
    }
    return [];
  };

  const walletAddresses = getWalletAddresses(vloo.wallet_address);
  // const balance = '0.05'; // Mock balance already defined in state

  return (
    <View style={styles.container}>
      <Text style={styles.messageLabel}>Message from Giver:</Text>
      <Text style={styles.message}>"{vloo.message}"</Text>
      
      <View style={styles.card}>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balance}>{balance} ETH</Text>
        
        {/* Address List */}
        <View style={styles.addressContainer}>
          {walletAddresses.map((w: any, i: number) => (
            <View key={i} style={styles.addressRow}>
              <View style={{ marginRight: 8 }}>
                {w.type === 'Bitcoin' ? <BitcoinIcon width={20} height={20} /> :
                 w.type === 'Ethereum' ? <EthIcon width={20} height={20} /> :
                 w.type === 'Solana' ? <SolanaIcon width={20} height={20} /> :
                 w.type === 'Polygon' ? <PolygonIcon width={20} height={20} /> :
                 w.type === 'BNB Chain' ? <BnbIcon width={20} height={20} /> :
                 <Text style={{ fontSize: 16 }}>?</Text>}
              </View>
              <Text style={styles.addressType}>{w.type}:</Text>
              <Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
                {w.address}
              </Text>
            </View>
          ))}
        </View>
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
  addressContainer: { width: '100%', marginTop: 10 },
  addressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  addressType: { fontSize: 12, fontWeight: 'bold', color: '#555', marginRight: 8 },
  address: { fontSize: 12, color: '#888', fontFamily: 'Courier', flex: 1, textAlign: 'right' },
  statusContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 40 },
  statusLabel: { fontSize: 16, marginRight: 5, color: '#555' },
  status: { fontSize: 16, fontWeight: 'bold' },
  footer: { position: 'absolute', bottom: 40, left: 30, right: 30 },
  secondaryButton: { padding: 15, alignItems: 'center', marginBottom: 10 },
  secondaryButtonText: { color: '#888', fontSize: 16 },
  primaryButton: { backgroundColor: '#8ec5fc', padding: 18, borderRadius: 30, alignItems: 'center' },
  primaryButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});
