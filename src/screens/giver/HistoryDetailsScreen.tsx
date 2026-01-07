import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView, Clipboard, Alert } from 'react-native';
import { ArrowLeft, Copy, ExternalLink, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

export default function HistoryDetailsScreen({ route, navigation }: any) {
  const { transaction, coinType } = route.params;

  const isReceived = transaction.type === 'receive';
  const color = isReceived ? COLORS.success : COLORS.error;
  const Icon = isReceived ? ArrowDownLeft : ArrowUpRight;
  
  // Format amount for MNEE (raw units to decimal)
  const formattedAmount = (coinType || '').toLowerCase() === 'mnee' 
      ? (transaction.amount / 100000) 
      : transaction.amount;

  const formattedFee = (coinType || '').toLowerCase() === 'mnee'
      ? (transaction.fee / 100000)
      : transaction.fee;

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const DetailRow = ({ label, value, copyable = false }: { label: string, value: string | number, copyable?: boolean }) => (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueContainer}>
        <Text style={styles.value} numberOfLines={copyable ? 1 : 0} ellipsizeMode="middle">{value}</Text>
        {copyable && (
          <TouchableOpacity onPress={() => copyToClipboard(String(value), label)} style={styles.copyButton}>
            <Copy size={16} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Transaction Details</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountCard}>
            <View style={[styles.iconContainer, { backgroundColor: isReceived ? '#E8F5E9' : '#FFEBEE' }]}>
                <Icon size={32} color={color} />
            </View>
            <Text style={[styles.mainAmount, { color }]}>
                {isReceived ? '+' : '-'}{formattedAmount} {coinType}
            </Text>
            <Text style={styles.statusBadge}>{transaction.status}</Text>
        </View>

        <View style={styles.section}>
            <DetailRow label="Transaction ID" value={transaction.txid} copyable />
            <DetailRow label="Type" value={isReceived ? 'Received' : 'Sent'} />
            <DetailRow label="Block Height" value={transaction.height} />
            <DetailRow label="Fee" value={`${formattedFee} ${coinType}`} />
            <DetailRow label="Score" value={transaction.score} />
        </View>

        {transaction.counterparties && transaction.counterparties.length > 0 && (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Counterparties</Text>
                {transaction.counterparties.map((cp: any, index: number) => (
                    <View key={index} style={styles.counterpartyRow}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.valueContainer}>
                            <Text style={styles.value} numberOfLines={1} ellipsizeMode="middle">{cp.address}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(cp.address, 'Address')} style={styles.copyButton}>
                                <Copy size={16} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.cpAmount}>
                             Amount: {((coinType || '').toLowerCase() === 'mnee' ? cp.amount / 100000 : cp.amount)} {coinType}
                        </Text>
                    </View>
                ))}
            </View>
        )}

      </ScrollView>
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
  content: {
    padding: 20,
  },
  amountCard: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mainAmount: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    marginBottom: 8,
  },
  statusBadge: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#666',
    backgroundColor: '#eee',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    marginBottom: 12,
    color: '#000',
  },
  detailRow: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  label: {
    fontFamily: FONTS.bodyMedium,
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  value: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  copyButton: {
    padding: 4,
    marginLeft: 8,
  },
  counterpartyRow: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  cpAmount: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
});
