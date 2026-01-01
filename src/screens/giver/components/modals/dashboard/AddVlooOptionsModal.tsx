import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, StyleSheet, Platform } from 'react-native';
import { X, CreditCard, Download, ScanLine } from 'lucide-react-native';
import { COLORS, FONTS as THEME_FONTS } from '../../../../../lib/theme';

// Fallback in case import fails
const FONTS = THEME_FONTS || {
  displayBlack: 'MuseoModerno_900Black',
  displayBold: 'MuseoModerno_700Bold',
  displaySemiBold: 'MuseoModerno_600SemiBold',
  bodyRegular: 'BeVietnamPro_400Regular',
  bodySemiBold: 'BeVietnamPro_600SemiBold',
  bodyBold: 'BeVietnamPro_700Bold',
};

interface AddVlooOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onNewCard: () => void;
  onImportCard: () => void;
}

export const AddVlooOptionsModal = ({
  visible,
  onClose,
  onNewCard,
  onImportCard
}: AddVlooOptionsModalProps) => {
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          onClose();
        }
      },
    })
  ).current;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject}>
             <View style={styles.modalOverlay} />
          </View>
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContent}>
          <View style={styles.dragIndicator} {...panResponder.panHandlers} />
          
          <View style={styles.modalTitleRow}>
            <Text style={styles.modalTitle}>Add Vloo Card</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={onNewCard}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#E8F2FF' }]}>
                <CreditCard size={32} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>New Card</Text>
                <Text style={styles.optionDescription}>Create a brand new digital Vloo card</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.optionButton} 
              onPress={onImportCard}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, { backgroundColor: '#FFF0F0' }]}>
                <Download size={32} color="#FF6B6B" />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>Import Card</Text>
                <Text style={styles.optionDescription}>Import an existing or physical card</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
    minHeight: 350,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
  },
  optionsContainer: {
    gap: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#eee',
    // Shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: '#000',
    marginBottom: 4,
  },
  optionDescription: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
  },
});
