
import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { CheckCircle, Copy } from 'lucide-react-native';

// Import Icons
import BitcoinIcon from '../../assets/icons/chains/bitcoin.svg';
import EthIcon from '../../assets/icons/chains/eth.svg';
import SolanaIcon from '../../assets/icons/chains/solana.svg';
import PolygonIcon from '../../assets/icons/chains/polygon.svg';
import BnbIcon from '../../assets/icons/chains/bnb.svg';
import LiskIcon from '../../assets/icons/chains/lisk.svg';
import UsdtIcon from '../../assets/icons/chains/usdt.svg';
import MneeIcon from '../../assets/icons/chains/mnee.svg';

const getIcon = (ticker: string) => {
    const iconProps = { width: 64, height: 64 };
    const t = ticker?.toLowerCase() || '';

    if (t.includes('btc') || t.includes('bitcoin')) return <BitcoinIcon {...iconProps} />;
    if (t.includes('eth')) return <EthIcon {...iconProps} />;
    if (t.includes('sol')) return <SolanaIcon {...iconProps} />;
    if (t.includes('pol') || t.includes('matic')) return <PolygonIcon {...iconProps} />;
    if (t.includes('bnb')) return <BnbIcon {...iconProps} />;
    if (t.includes('lsk')) return <LiskIcon {...iconProps} />;
    if (t.includes('usdt')) return <UsdtIcon {...iconProps} />;
    
    if (t === 'mnee') {
         return <MneeIcon {...iconProps} />;
    }

    return <View style={[styles.customIcon, { backgroundColor: '#ccc' }]}><Text style={styles.customIconText}>?</Text></View>;
};

export default function GiverSuccessScreen({ route, navigation }: any) {
  const { cardId, title, message, onPress, data } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.content}>
        
        {data?.type === 'transfer' ? (
            // Custom Transfer Success UI
            <>
                <View style={styles.iconContainer}>
                    {getIcon(data.ticker)}
                    <View style={styles.checkBadge}>
                        <CheckCircle color={COLORS.success} fill="#fff" size={24} />
                    </View>
                </View>

                <Text style={styles.title}>{title || 'Sent Successfully'}</Text>
                
                <View style={styles.amountContainer}>
                    <Text style={styles.amountText}>-{data.amount} {data.ticker}</Text>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>To</Text>
                        <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">{data.recipient}</Text>
                    </View>
                    
                    {data.ticketId && (
                        <View style={[styles.detailRow, { borderTopWidth: 1, borderTopColor: '#f0f0f0', marginTop: 12, paddingTop: 12 }]}>
                            <Text style={styles.detailLabel}>Ticket ID</Text>
                            <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">{data.ticketId}</Text>
                        </View>
                    )}
                </View>
            </>
        ) : (
            // Default Success UI (Card Creation)
            <>
                <View style={styles.iconContainer}>
                  <CheckCircle color={COLORS.accent} size={80} />
                </View>

                <Text style={styles.title}>{title || 'VLOO Created!'}</Text>
                <Text style={styles.subtitle}>
                  {message || 'The card is now bound successfully.'}
                </Text>
                
                {cardId && (
                  <View style={styles.idContainer}>
                    <Text style={styles.idLabel}>CARD ID</Text>
                    <Text style={styles.idValue}>{cardId}</Text>
                  </View>
                )}
            </>
        )}

        <Button 
          title="Done" 
          onPress={onPress ? onPress : () => navigation.navigate('GiverDashboard')} 
          variant="primary"
          style={[styles.doneButton, { backgroundColor: COLORS.primary }]}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  content: { 
    flex: 1, 
    padding: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  iconContainer: { 
    marginBottom: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  customIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customIconText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: { 
    fontFamily: FONTS.displayBold, 
    fontSize: 28, 
    color: '#000', 
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { 
    fontFamily: FONTS.bodyRegular, 
    fontSize: 16, 
    color: '#666', 
    textAlign: 'center', 
    marginBottom: 32,
    maxWidth: 280,
  },
  amountContainer: {
    marginBottom: 32,
  },
  amountText: {
    fontFamily: FONTS.displayBold,
    fontSize: 36,
    color: '#000',
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#000',
    flex: 1,
    textAlign: 'right',
  },
  idContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  idLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
    letterSpacing: 1,
  },
  idValue: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    letterSpacing: 1,
  },
  doneButton: { 
    width: '100%', 
    height: 56,
  }
});
