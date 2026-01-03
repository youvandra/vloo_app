import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Switch, Platform } from 'react-native';
import { ArrowLeft, Menu } from 'lucide-react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS } from '../../lib/theme';

import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import UsdtIcon from '../../assets/icons/chains/usdt.svg';

export default function LinkedWalletsSettingsScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
      if (stored) {
        let parsedWallets = JSON.parse(stored);
        // Ensure isVisible property exists
        parsedWallets = parsedWallets.map((w: any) => ({
          ...w,
          isVisible: w.isVisible !== undefined ? w.isVisible : true
        }));
        setWallets(parsedWallets);
      }
    } catch (e) {
      console.error('Error loading wallets:', e);
    }
  };

  const saveWallets = async (newWallets: any[]) => {
    try {
      setWallets(newWallets);
      await AsyncStorage.setItem(`vloo_wallets_${vloo.id}`, JSON.stringify(newWallets));
    } catch (e) {
      console.error('Error saving wallets:', e);
    }
  };

  const toggleVisibility = (index: number) => {
    const newWallets = [...wallets];
    newWallets[index].isVisible = !newWallets[index].isVisible;
    saveWallets(newWallets);
  };

  const renderItem = ({ item, drag, isActive, getIndex }: RenderItemParams<any>) => {
    const index = getIndex();
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.rowItem,
            isActive && { backgroundColor: '#f0f0f0', elevation: 5 }
          ]}
        >
          <TouchableOpacity onPressIn={drag} style={styles.dragHandle}>
            <Menu size={20} color="#999" />
          </TouchableOpacity>

          <View style={styles.walletIcon}>
            {item.type === 'Bitcoin' ? <BitcoinIcon width={24} height={24} /> :
             item.type === 'Ethereum' ? <EthIcon width={24} height={24} /> :
             item.type === 'Solana' ? <SolanaIcon width={24} height={24} /> :
             item.type === 'Polygon' ? <PolygonIcon width={24} height={24} /> :
             item.type === 'BNB Chain' ? <BnbIcon width={24} height={24} /> :
             item.type === 'Lisk' ? <LiskIcon width={24} height={24} /> :
             item.type === 'USDT' ? <UsdtIcon width={24} height={24} /> :
             <View style={{ width: 24, height: 24, backgroundColor: '#eee', borderRadius: 12 }} />}
          </View>

          <View style={styles.walletInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.walletType}>{item.type}</Text>
                {item.tag && (
                    <View style={{ marginLeft: 6, backgroundColor: '#F2F2F7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                        <Text style={{ fontSize: 10, color: '#666', fontFamily: FONTS.bodySemiBold }}>{item.tag}</Text>
                    </View>
                )}
            </View>
            <Text style={styles.walletAddress}>
              {item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : ''}
            </Text>
          </View>

          <Switch
            value={item.isVisible}
            onValueChange={() => toggleVisibility(index!)}
            trackColor={{ false: '#767577', true: COLORS.primary }}
            thumbColor={item.isVisible ? '#fff' : '#f4f3f4'}
          />
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Linked Wallets</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <DraggableFlatList
          data={wallets}
          onDragEnd={({ data }) => saveWallets(data)}
          keyExtractor={(item) => `${item.type}_${item.address}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
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
    fontSize: 20,
    color: '#000',
  },
  iconButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  listContent: {
    padding: 24,
    gap: 12,
  },
  rowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  dragHandle: {
    padding: 8,
    marginRight: 4,
  },
  walletIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  walletInfo: {
    flex: 1,
  },
  walletType: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  walletAddress: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
});
