import React from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, StyleSheet, ScrollView, Image } from 'react-native';
import { X, ChevronRight, Edit2, Trash2 } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../../lib/theme';

interface ReminderDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  reminder: any;
  vloos: any[];
  onCardPress: (vloo: any) => void;
  onEdit: (reminder: any) => void;
  onDelete: (reminderId: string) => void;
}

export const ReminderDetailsModal = ({
  visible,
  onClose,
  reminder,
  vloos,
  onCardPress,
  onEdit,
  onDelete
}: ReminderDetailsModalProps) => {

  if (!reminder) return null;

  const renderCardItem = (cardId: string) => {
    const vloo = vloos.find(v => v.id === cardId);
    const amountInfo = reminder.cardAmounts ? reminder.cardAmounts[cardId] : null;

    if (!vloo || !amountInfo) return null;

    return (
      <TouchableOpacity
        key={cardId}
        style={styles.cardItem}
        onPress={() => {
            onClose();
            onCardPress(vloo);
        }}
      >
        <View style={styles.cardIconContainer}>
             {/* Use a placeholder or color based on card color */}
            <View style={[styles.cardIcon, { backgroundColor: vloo.verified_cards?.color || COLORS.primary }]} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{vloo.receiver_name || 'Unnamed Card'}</Text>
          <Text style={styles.cardMessage} numberOfLines={1}>{vloo.message || 'No message'}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amountText}>{amountInfo.amount} {amountInfo.coin}</Text>
          <ChevronRight size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  const cardIds = reminder.cardAmounts ? Object.keys(reminder.cardAmounts) : [];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalView}>
          <View style={styles.handleBar} />
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{reminder.title}</Text>
              <Text style={styles.date}>{new Date(reminder.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => onEdit(reminder)} style={styles.actionButton}>
                <Edit2 size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(reminder.id)} style={[styles.actionButton, styles.deleteButton]}>
                <Trash2 size={20} color={COLORS.error || '#FF3B30'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Reminding Cards</Text>
            {cardIds.length > 0 ? (
                cardIds.map(renderCardItem)
            ) : (
                <Text style={styles.emptyText}>No cards associated with this reminder.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '60%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  title: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
    marginBottom: 4,
  },
  date: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 12,
  },
  cardIconContainer: {
    marginRight: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  cardMessage: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: '#000',
    marginRight: 8,
  },
  emptyText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});
