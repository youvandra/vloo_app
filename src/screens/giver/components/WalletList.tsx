import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../../../lib/theme';
import BitcoinIcon from '../../../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../../../assets/icons/chains/lisk.svg';

interface WalletListProps {
  wallets: any[];
  loading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onWalletPress: (wallet: any) => void;
  balances: Record<string, string>;
  isTestnet: boolean;
  setIsTestnet: (val: boolean) => void;
}

export const WalletList = ({ 
  wallets, 
  loading, 
  refreshing, 
  onRefresh, 
  onWalletPress, 
  balances,
  isTestnet,
  setIsTestnet
}: WalletListProps) => {

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    if (addr.length < 10) return addr;
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <View style={{ flex: 1, marginTop: 4 }}>
      {wallets.length > 0 && (
        <View style={[styles.walletHeader, { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={styles.walletTitle}>Linked Wallets</Text>
          <TouchableOpacity 
            onPress={() => setIsTestnet(!isTestnet)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}
          >
              <View style={{ width: 24, height: 14, borderRadius: 7, backgroundColor: isTestnet ? COLORS.primary : '#ccc', justifyContent: 'center', alignItems: isTestnet ? 'flex-end' : 'flex-start', paddingHorizontal: 2 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' }} />
              </View>
              <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 12, color: '#666' }}>Testnet</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" />}
      >
        {loading ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
          </View>
        ) : (
          wallets.length > 0 && wallets.map((wallet: any, index: number) => (
            <TouchableOpacity key={index} style={styles.walletRow} onPress={() => onWalletPress(wallet)}>
              <View style={styles.walletIconContainer}>
                {/* Icon based on type */}
                {wallet.type === 'Bitcoin' ? (
                  <BitcoinIcon width={24} height={24} />
                ) : wallet.type === 'Ethereum' || wallet.type === 'Sepolia' ? (
                  <EthIcon width={24} height={24} />
                ) : wallet.type === 'Lisk' || wallet.type === 'Lisk Sepolia' ? (
                  <LiskIcon width={24} height={24} />
                ) : wallet.type === 'Solana' ? (
                  <SolanaIcon width={24} height={24} />
                ) : wallet.type === 'Polygon' ? (
                  <PolygonIcon width={24} height={24} />
                ) : wallet.type === 'BNB Chain' ? (
                  <BnbIcon width={24} height={24} />
                ) : (
                  <Text style={{ fontSize: 20 }}>?</Text>
                )}
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletTypeLabel}>{wallet.type}</Text>
                <Text style={styles.walletAddress}>
                  {formatAddress(wallet.address)}
                </Text>
              </View>
              <Text style={styles.balanceText}>{balances[`${wallet.type}-${wallet.address}`] || '0.00'}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  walletHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  walletTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  walletIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  walletInfo: {
    flex: 1,
    marginRight: 12,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
  },
  walletTypeLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 10,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  balanceText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },
});
