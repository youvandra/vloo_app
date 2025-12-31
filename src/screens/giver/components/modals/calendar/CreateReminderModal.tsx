import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableWithoutFeedback, 
  Keyboard,
  FlatList,
  ScrollView
} from 'react-native';
import { X, DollarSign, Bell, Check } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

const COINS = ['IDR', 'USD', 'BTC'];

interface CreateReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (reminder: { 
    title: string; 
    date: Date; 
    cardAmounts: Record<string, { amount: string; coin: string }>;
    id?: string;
  }) => void;
  initialDate?: Date;
  cards?: any[]; // Pass available cards
  reminderToEdit?: any; // Reminder to edit
}

export const CreateReminderModal = ({ visible, onClose, onCreate, initialDate, cards = [], reminderToEdit }: CreateReminderModalProps) => {
  const [title, setTitle] = useState('');
  const [cardAmounts, setCardAmounts] = useState<Record<string, string>>({});
  const [cardCoins, setCardCoins] = useState<Record<string, string>>({});
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [amountMode, setAmountMode] = useState<'each' | 'all'>('each');
  const [globalAmount, setGlobalAmount] = useState('');
  const [globalCoin, setGlobalCoin] = useState(COINS[0]);
  
  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      if (reminderToEdit) {
        // Pre-fill for edit mode
        setTitle(reminderToEdit.title);
        
        const cardAmountsData = reminderToEdit.cardAmounts || {};
        const cardIds = Object.keys(cardAmountsData);
        setSelectedCardIds(cardIds);
        
        const amounts: Record<string, string> = {};
        const coins: Record<string, string> = {};
        
        cardIds.forEach(id => {
          amounts[id] = cardAmountsData[id].amount;
          coins[id] = cardAmountsData[id].coin;
        });
        
        setCardAmounts(amounts);
        setCardCoins(coins);
        setAmountMode('each'); // Default to 'each' for editing to preserve individual settings
        setGlobalAmount('');
        setGlobalCoin(COINS[0]);
      } else {
        // Reset for create mode
        setTitle('');
        setCardAmounts({});
        setCardCoins({});
        setSelectedCardIds([]);
        setAmountMode('each');
        setGlobalAmount('');
        setGlobalCoin(COINS[0]);
      }
    }
  }, [visible, reminderToEdit]);

  const handleCreate = () => {
    if (title) {
      // Filter cardAmounts to only include selected cards
      const selectedAmounts: Record<string, { amount: string; coin: string }> = {};
      selectedCardIds.forEach(id => {
        if (amountMode === 'all') {
          selectedAmounts[id] = { amount: globalAmount, coin: globalCoin };
        } else {
          selectedAmounts[id] = { 
            amount: cardAmounts[id] || '', 
            coin: cardCoins[id] || COINS[0] 
          };
        }
      });

      onCreate({ 
        title, 
        date: reminderToEdit ? reminderToEdit.date : (initialDate || new Date()),
        cardAmounts: selectedAmounts,
        id: reminderToEdit?.id 
      });
      onClose();
    }
  };

  const toggleCardSelection = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter(id => id !== cardId));
    } else {
      setSelectedCardIds([...selectedCardIds, cardId]);
      // Initialize coin for this card if not set
      if (!cardCoins[cardId]) {
        setCardCoins(prev => ({ ...prev, [cardId]: COINS[0] }));
      }
    }
  };

  const handleAmountChange = (cardId: string, amount: string) => {
    setCardAmounts(prev => ({
      ...prev,
      [cardId]: amount
    }));
  };

  const handleCoinChange = (cardId: string, coin: string) => {
    setCardCoins(prev => ({
      ...prev,
      [cardId]: coin
    }));
  };

  const CoinSelector = ({ selected, onSelect }: { selected: string, onSelect: (coin: string) => void }) => (
    <View style={styles.coinSelector}>
      <FlatList
        data={COINS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.coinItem, item === selected && styles.selectedCoinItem]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.coinText, item === selected && styles.selectedCoinText]}>{item}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.coinListContent}
      />
    </View>
  );

  const renderCardItem = ({ item }: { item: any }) => {
    const isSelected = selectedCardIds.includes(item.id);
    const cardColor = item.verified_cards?.[0]?.color === 'blue' ? COLORS.primary : '#000';
    
    return (
      <View style={[
        styles.cardItem, 
        isSelected && styles.selectedCardItem,
        { borderColor: isSelected ? COLORS.primary : '#eee' }
      ]}>
        <TouchableOpacity 
          style={styles.cardHeader}
          onPress={() => toggleCardSelection(item.id)}
        >
          <View style={[styles.cardColorIndicator, { backgroundColor: cardColor }]} />
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.receiver_name || 'VLOO Gift'}</Text>
            <Text style={styles.cardId}>ID: {item.verified_cards?.[0]?.id || '••••'}</Text>
          </View>
          {isSelected && (
            <View style={styles.checkIcon}>
              <Check size={16} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {isSelected && amountMode === 'each' && (
          <View style={styles.cardAmountContainer}>
            <Text style={styles.cardAmountLabel}>Amount to fund:</Text>
            <View style={styles.smallInputContainer}>
              <TextInput
                style={styles.smallInput}
                placeholder="0.00"
                value={cardAmounts[item.id] || ''}
                onChangeText={(text) => handleAmountChange(item.id, text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
              <CoinSelector 
                selected={cardCoins[item.id] || COINS[0]} 
                onSelect={(coin) => handleCoinChange(item.id, coin)} 
              />
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.root}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        
        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{reminderToEdit ? 'Edit Reminder' : 'Set Reminder'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Reminder Title</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. Fund Birthday Card"
                      value={title}
                      onChangeText={setTitle}
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={styles.selectionHeader}>
                    <Text style={styles.label}>Select Cards & Amount</Text>
                    <View style={styles.segmentedControl}>
                      <TouchableOpacity 
                        style={[styles.segmentButton, amountMode === 'each' && styles.activeSegment]}
                        onPress={() => setAmountMode('each')}
                      >
                        <Text style={[styles.segmentText, amountMode === 'each' && styles.activeSegmentText]}>Each</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.segmentButton, amountMode === 'all' && styles.activeSegment]}
                        onPress={() => setAmountMode('all')}
                      >
                        <Text style={[styles.segmentText, amountMode === 'all' && styles.activeSegmentText]}>All</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {amountMode === 'all' && (
                    <View style={styles.globalAmountContainer}>
                      <Text style={styles.globalAmountLabel}>Amount for all selected cards:</Text>
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="0.00"
                          value={globalAmount}
                          onChangeText={setGlobalAmount}
                          keyboardType="numeric"
                          placeholderTextColor="#999"
                        />
                        <CoinSelector 
                          selected={globalCoin} 
                          onSelect={setGlobalCoin} 
                        />
                      </View>
                    </View>
                  )}

                  {cards.length > 0 ? (
                    <View>
                      {cards.map(item => (
                        <View key={item.id} style={{ marginBottom: 12 }}>
                          {renderCardItem({ item })}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.noCardsText}>No cards available</Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.createButton, !title && styles.disabledButton]}
                  onPress={handleCreate}
                  disabled={!title}
                >
                  <Text style={styles.createButtonText}>{reminderToEdit ? 'Save Changes' : 'Set Reminder'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '100%',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#eee',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#000',
    height: '100%',
  },
  createButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeSegment: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
  activeSegmentText: {
    fontFamily: FONTS.bodyBold,
    color: '#000',
  },
  globalAmountContainer: {
    marginBottom: 12,
  },
  globalAmountLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  cardsList: {
    gap: 12,
    paddingBottom: 24,
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  selectedCardItem: {
    backgroundColor: 'rgba(52,152,219,0.05)',
  },
  cardColorIndicator: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginBottom: 2,
  },
  cardId: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: '#666',
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cardAmountContainer: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  cardAmountLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  smallInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  smallInputIcon: {
    marginRight: 8,
  },
  smallInput: {
    flex: 1,
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#000',
    height: '100%',
  },
  noCardsText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  coinSelector: {
    height: 32,
    marginLeft: 8,
    maxWidth: 200, // Limit width so text input has space
  },
  coinListContent: {
    alignItems: 'center',
    paddingLeft: 8,
  },
  coinItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
  },
  selectedCoinItem: {
    backgroundColor: COLORS.primary,
  },
  coinText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
  },
  selectedCoinText: {
    color: '#fff',
  },
});
