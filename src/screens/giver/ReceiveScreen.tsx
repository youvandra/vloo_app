import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Platform, Alert, Image, Dimensions, FlatList } from 'react-native';
import { ArrowLeft, Copy, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, FONTS } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import UsdtIcon from '../../assets/icons/chains/usdt.svg';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48; // 24px padding on each side

export default function ReceiveScreen({ route, navigation }: any) {
  const { vloo } = route.params;
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch User Wallets from Local Storage
      const stored = await AsyncStorage.getItem(`vloo_wallets_${vloo.id}`);
      let userWallets: any[] = [];
      if (stored) {
        userWallets = JSON.parse(stored);
      }
      
      // Fetch icons from DB if missing
      const { data: allCoins } = await supabase.from('all_wallets').select('*');
      
      if (allCoins) {
        userWallets = userWallets
            .filter(w => w.isVisible) // Only show visible wallets
            .map(w => {
            const coin = allCoins.find(c => 
                c.name === w.type || 
                (w.type === 'USDT' && c.ticker === 'USDT') ||
                c.ticker === w.ticker
            );
            return {
                ...w,
                icon: coin?.icon || w.icon
            };
        });
      } else {
          // If no coin data from DB, just filter visible
          userWallets = userWallets.filter(w => w.isVisible);
      }

      setWallets(userWallets);
    } catch (e) {
      console.error('Error loading wallets:', e);
      Alert.alert('Error', 'Failed to load wallets');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (address: string) => {
    await Clipboard.setStringAsync(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return <View style={styles.placeholderIcon} />;

    if (iconName.startsWith('http') || iconName.startsWith('https')) {
        return <Image source={{ uri: iconName }} style={styles.iconImage} />;
    }

    const iconProps = { width: 48, height: 48 };

    switch(iconName.toLowerCase()) {
        case 'bitcoin': return <BitcoinIcon {...iconProps} />;
        case 'ethereum': return <EthIcon {...iconProps} />;
        case 'solana': return <SolanaIcon {...iconProps} />;
        case 'polygon': return <PolygonIcon {...iconProps} />;
        case 'bnb': return <BnbIcon {...iconProps} />;
        case 'lisk': return <LiskIcon {...iconProps} />;
        case 'usdt': return <UsdtIcon {...iconProps} />;
        case 'tron': return <View style={[styles.customIcon, { backgroundColor: '#FF0013' }]}><Text style={styles.customIconText}>T</Text></View>;
        case 'monero': return <View style={[styles.customIcon, { backgroundColor: '#F26822' }]}><Text style={styles.customIconText}>M</Text></View>;
        case 'xrp': return <View style={[styles.customIcon, { backgroundColor: '#000' }]}><Text style={styles.customIconText}>X</Text></View>;
        case 'hedera': return <View style={[styles.customIcon, { backgroundColor: '#222' }]}><Text style={styles.customIconText}>H</Text></View>;
        default: return <View style={styles.placeholderIcon} />;
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }).current;

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
            <View style={styles.iconContainer}>
                {getIcon(item.icon)}
            </View>
            <Text style={styles.coinName}>{item.type}</Text>
            {item.tag && <Text style={styles.coinTag}>{item.tag}</Text>}
        </View>

        <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
                <QRCode
                    value={item.address}
                    size={200}
                    color="#000"
                    backgroundColor="#fff"
                />
            </View>
        </View>

        <View style={styles.addressSection}>
            <Text style={styles.addressLabel}>Wallet Address</Text>
            <TouchableOpacity 
                style={styles.addressBox}
                onPress={() => copyToClipboard(item.address)}
            >
                <Text style={styles.addressText} numberOfLines={2}>{item.address}</Text>
                <View style={styles.copyIcon}>
                    {copiedAddress === item.address ? (
                        <Check size={20} color={COLORS.primary} />
                    ) : (
                        <Copy size={20} color="#666" />
                    )}
                </View>
            </TouchableOpacity>
        </View>

        <Text style={styles.helperText}>
            Only send {item.type} ({item.ticker || item.type}) assets to this address.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <FlatList
            ref={flatListRef}
            data={wallets}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => index.toString()}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            snapToInterval={width}
            decelerationRate="fast"
            contentContainerStyle={styles.flatListContent}
        />

        <View style={styles.pagination}>
            {wallets.map((_, index) => (
                <View 
                    key={index} 
                    style={[
                        styles.dot, 
                        activeIndex === index && styles.activeDot
                    ]} 
                />
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#fff',
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
    paddingVertical: 24,
  },
  flatListContent: {
    alignItems: 'center',
  },
  cardContainer: {
    width: width,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 12,
  },
  coinName: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
    marginBottom: 4,
  },
  coinTag: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  qrContainer: {
    marginBottom: 24,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressSection: {
    width: '100%',
    marginBottom: 24,
  },
  addressLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  addressText: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginRight: 8,
  },
  copyIcon: {
    padding: 4,
  },
  helperText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ddd',
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#eee',
    borderRadius: 24,
  },
  customIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
