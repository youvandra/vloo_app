import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';
import { getMneeHistory } from '../../lib/mnee';

export default function HistoryScreen({ route, navigation }: any) {
  const { address, coinType } = route.params;
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isMnee = (coinType || '').toLowerCase() === 'mnee';
    if (address && isMnee) {
      setHistory([]);
      setInitialLoad(true);
      setError(null);
      loadHistory();
    }
  }, [address, coinType]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const response = await getMneeHistory(address);
      
      if (response && response.history) {
        setHistory(response.history);
        setError(null);
      } else {
        setError(null);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      setError('Failed to load history');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isReceived = item.type === 'receive';
    const color = isReceived ? COLORS.success : COLORS.error;
    const Icon = isReceived ? ArrowDownLeft : ArrowUpRight;
    
    // Format amount for MNEE (raw units to decimal)
    // 100,000 raw units = 1 MNEE based on user report
    const formattedAmount = (coinType || '').toLowerCase() === 'mnee' 
        ? (item.amount / 100000) 
        : item.amount;
    
    return (
      <TouchableOpacity 
        style={styles.transactionRow}
        onPress={() => navigation.navigate('HistoryDetails', { transaction: item, coinType })}
      >
        <View style={[styles.iconContainer, { backgroundColor: isReceived ? '#E8F5E9' : '#FFEBEE' }]}>
          <Icon size={20} color={color} />
        </View>
        
        <View style={styles.txDetails}>
          <View style={styles.row}>
             <Text style={styles.txType}>{isReceived ? 'Received' : 'Sent'}</Text>
             <Text style={[styles.txAmount, { color }]}>
                {isReceived ? '+' : '-'}{formattedAmount} {coinType}
             </Text>
          </View>
          
          <View style={styles.row}>
             <Text style={styles.txId} numberOfLines={1} ellipsizeMode="middle">
                {item.txid}
             </Text>
             <Text style={styles.txStatus}>
                {item.status}
             </Text>
          </View>
          
          <View style={styles.row}>
             <Text style={styles.txDate}>Block: {item.height}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading && initialLoad) return <ActivityIndicator style={{ marginTop: 20 }} color={COLORS.primary} />;
    if (history.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Clock size={48} color="#ccc" />
                <Text style={styles.emptyText}>No transactions found</Text>
            </View>
        );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.content}>
          {(coinType || '').toLowerCase() !== 'mnee' ? (
             <View style={styles.unsupportedContainer}>
                 <Text style={styles.unsupportedText}>History not available for {coinType} yet.</Text>
             </View>
          ) : (
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item) => item.txid}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
            />
          )}
          
          {error && (
            <View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
              <Text style={{ fontFamily: FONTS.bodyRegular, fontSize: 12, color: '#d00' }}>{error}</Text>
            </View>
          )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  backButton: {
    padding: 4,
  },
  listContent: {
    padding: 20,
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  txType: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#000',
  },
  txAmount: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
  },
  txId: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    width: '40%',
  },
  txStatus: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  txDate: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  unsupportedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsupportedText: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 16,
    color: '#666',
  },
});
