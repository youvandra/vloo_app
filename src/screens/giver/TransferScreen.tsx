import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Platform, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Scan, Info, Lock, Plus, X, Calendar, Clock } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '../../lib/theme';
import { transferMnee, fetchMneeBalance, checkMneeConfig } from '../../lib/mnee';
import { generateDeterministicPrivateKey } from '../../lib/crypto';
import { generateBitcoinWallet } from '../../lib/wallet';

export default function TransferScreen({ route, navigation }: any) {
  const { wallet, vloo } = route.params;
  // Initialize with one empty recipient
  const [recipients, setRecipients] = useState([{ address: '', amount: '' }]);
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [transferMode, setTransferMode] = useState<'direct' | 'schedule'>('direct');
  
  // Schedule state
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Helper to update a specific recipient field
  const updateRecipient = (index: number, field: 'address' | 'amount', value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = { ...newRecipients[index], [field]: value };
    setRecipients(newRecipients);
  };

  // Helper to add a new recipient row
  const addRecipient = () => {
    setRecipients([...recipients, { address: '', amount: '' }]);
  };

  // Helper to remove a recipient row
  const removeRecipient = (index: number) => {
    if (recipients.length > 1) {
        const newRecipients = recipients.filter((_, i) => i !== index);
        setRecipients(newRecipients);
    }
  };

  const handleScan = () => {
    // Navigate to scan modal or screen (not implemented for this flow yet, just alert)
    Alert.alert('Scan', 'QR Scanning for address coming soon.');
  };

  const handleMax = (index: number) => {
    // Logic to set max amount for a specific recipient
    // For now, mocked as we need complex balance logic
    Alert.alert('Max', 'Max amount logic coming soon.');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Keep the current time, update the date
      const newDate = new Date(scheduledDate);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setScheduledDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      // Keep the current date, update the time
      const newDate = new Date(scheduledDate);
      newDate.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      setScheduledDate(newDate);
    }
  };

  const handleSchedule = () => {
    // Validate all fields
    const isValid = recipients.every(r => r.address && r.amount) && passphrase;
    
    if (!isValid) {
        Alert.alert('Error', 'Please fill in all fields including passphrase');
        return;
    }

    if (scheduledDate <= new Date()) {
        Alert.alert('Error', 'Please select a future date and time');
        return;
    }

    Alert.alert('Schedule Transfer', `Scheduling transfer for ${scheduledDate.toLocaleString()} logic coming soon.`);
    // TODO: Implement actual scheduling logic here (store in DB)
  };

  const handleSend = async () => {
      // Validate all fields
      const isValid = recipients.every(r => r.address && r.amount) && passphrase;
      
      if (!isValid) {
          Alert.alert('Error', 'Please fill in all fields including passphrase');
          return;
      }

      setLoading(true);

      try {
          // Calculate total amount for validation
          const totalAmount = recipients.reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

          // If MNEE, use real transfer logic
          if (wallet.type === 'MNEE' || wallet.ticker === 'MNEE') {
              console.log('Starting MNEE Transfer...');
              await checkMneeConfig();
              
              // 1. Re-derive Private Key (WIF)
              const privateKeySeed = generateDeterministicPrivateKey(vloo.id, passphrase);
              // MNEE uses Legacy (P2PKH) address/key
              const btcLegacyData = generateBitcoinWallet(privateKeySeed, { legacy: true });
              const wif = btcLegacyData.privateKey;

              if (wallet.address !== btcLegacyData.address) {
                  console.warn('Derived address does not match wallet address. Wrong passphrase?');
                  Alert.alert('Error', 'Invalid passphrase. The derived address does not match your wallet address.');
                  setLoading(false);
                  return;
              }
              
              // Debugging: Check balance and details
              console.log('--- Transfer Debug Info ---');
              console.log('Wallet Address:', wallet.address);
              console.log('Derived Address:', btcLegacyData.address);
              const currentBalance = await fetchMneeBalance(wallet.address);
              console.log('Current Balance:', currentBalance);
              
              // Validate Balance
              const balanceVal = parseFloat(currentBalance.split(' ')[0]);
              
              if (!isNaN(balanceVal) && totalAmount > balanceVal) {
                  Alert.alert('Error', `Insufficient funds. You have ${balanceVal} MNEE but are trying to send total ${totalAmount} MNEE.`);
                  setLoading(false);
                  return;
              }

              console.log('Attempting to send total:', totalAmount);
              console.log('---------------------------');

              // 2. Prepare Recipients
              const mneeRecipients = recipients.map(r => ({
                  address: r.address.trim(),
                  amount: parseFloat(r.amount)
              }));

              // 3. Execute Transfer
              const response = await transferMnee(mneeRecipients, wif);
              
              setLoading(false);
              navigation.navigate('GiverSuccess', {
                  title: 'Transaction Submitted',
                  data: {
                    type: 'transfer',
                    amount: totalAmount.toString(), // Show total amount sent
                    ticker: 'MNEE',
                    recipient: mneeRecipients.length > 1 ? `${mneeRecipients.length} recipients` : mneeRecipients[0].address,
                    ticketId: response.ticketId
                  },
                  onPress: () => navigation.navigate('GiverDashboard') 
              });

          } else {
              // Mock for other coins
              setTimeout(() => {
                  setLoading(false);
                  navigation.navigate('GiverSuccess', {
                      title: 'Transaction Submitted',
                      data: {
                        type: 'transfer',
                        amount: totalAmount.toString(),
                        ticker: wallet.ticker || wallet.type,
                        recipient: recipients.length > 1 ? `${recipients.length} recipients` : recipients[0].address
                      },
                      onPress: () => navigation.navigate('GiverDashboard') // Go back to Dashboard
                  });
              }, 2000);
          }
      } catch (error: any) {
          console.error('Transfer Error:', error);
          setLoading(false);
          
          let errorMessage = error.message || 'An error occurred during transfer';
          if (error.response && error.response.data && error.response.data.error) {
              errorMessage = typeof error.response.data.error === 'string' 
                  ? error.response.data.error 
                  : JSON.stringify(error.response.data.error);
          }
          
          Alert.alert('Transfer Failed', errorMessage);
      }
  };

  const isBasicFormValid = recipients.every(r => r.address && r.amount);

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

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, transferMode === 'direct' && styles.activeTab]}
          onPress={() => setTransferMode('direct')}
        >
          <Text style={[styles.tabText, transferMode === 'direct' && styles.activeTabText]}>Direct Transfer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, transferMode === 'schedule' && styles.activeTab]}
          onPress={() => setTransferMode('schedule')}
        >
          <Text style={[styles.tabText, transferMode === 'schedule' && styles.activeTabText]}>Schedule</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.walletInfo}>
            <Text style={styles.fromLabel}>Sending from</Text>
            <Text style={styles.walletName}>{vloo.name || 'Vloo Card'} - {wallet.type}</Text>
            <Text style={styles.walletAddress}>{wallet.address}</Text>
        </View>

        {transferMode === 'schedule' && (
          <View style={styles.scheduleContainer}>
            <Text style={styles.sectionTitle}>Schedule Details</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
                <Calendar size={20} color={COLORS.primary} />
                <Text style={styles.dateTimeText}>{scheduledDate.toLocaleDateString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
                <Clock size={20} color={COLORS.primary} />
                <Text style={styles.dateTimeText}>{scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </TouchableOpacity>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
            
            {showTimePicker && (
              <DateTimePicker
                value={scheduledDate}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
          </View>
        )}

        {recipients.map((recipient, index) => (
            <View key={index} style={styles.recipientContainer}>
                <View style={styles.recipientHeader}>
                    <Text style={styles.recipientTitle}>Recipient {index + 1}</Text>
                    {recipients.length > 1 && (
                        <TouchableOpacity onPress={() => removeRecipient(index)} style={styles.removeButton}>
                            <X size={20} color={COLORS.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Recipient Address</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder={`Enter ${wallet.type} Address`}
                            value={recipient.address}
                            onChangeText={(text) => updateRecipient(index, 'address', text)}
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
                            value={recipient.amount}
                            onChangeText={(text) => updateRecipient(index, 'amount', text.replace(',', '.'))}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity onPress={() => handleMax(index)} style={styles.inputAction}>
                            <Text style={styles.maxText}>MAX</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        ))}

        <TouchableOpacity onPress={addRecipient} style={styles.addButton}>
            <Plus size={20} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Add Recipient</Text>
        </TouchableOpacity>

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
            style={[styles.confirmButton, (loading || !isBasicFormValid) && styles.disabledButton]}
            onPress={transferMode === 'direct' ? handleSend : handleSchedule}
            disabled={loading || !isBasicFormValid}
          >
              {loading ? (
                  <ActivityIndicator color="#fff" />
              ) : (
                  <Text style={styles.confirmButtonText}>
                    {transferMode === 'direct' ? 'Confirm Send' : 'Schedule Transfer'}
                  </Text>
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
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 16,
    color: '#999',
  },
  activeTabText: {
    color: COLORS.primary,
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
  scheduleContainer: {
    marginBottom: 24,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateTimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  dateTimeText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#333',
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
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    fontFamily: FONTS.displayBold,
    fontSize: 16,
    color: '#fff',
  },
  recipientContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  recipientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 8,
  },
});
