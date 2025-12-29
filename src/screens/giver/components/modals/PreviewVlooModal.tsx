import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, TouchableWithoutFeedback, PanResponder, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../../lib/theme';

const { width } = Dimensions.get('window');

interface PreviewVlooModalProps {
  visible: boolean;
  onClose: () => void;
  vloo: any;
}

export const PreviewVlooModal = ({
  visible,
  onClose,
  vloo
}: PreviewVlooModalProps) => {

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

  if (!vloo) return null;

  const cardColor = vloo.verified_cards?.[0]?.color === 'blue' ? COLORS.primary : '#000';
  const formattedDate = vloo.unlock_date 
    ? new Date(vloo.unlock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Whenever';

  return (
    <Modal
      animationType="slide"
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

        <View style={[styles.modalContent, { height: '80%' }]}>
          <View style={styles.modalHeader} {...panResponder.panHandlers}>
            <View style={styles.modalIndicator} />
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalTitle}>Card Preview</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={[styles.previewCard, { backgroundColor: cardColor }]}>
              <View style={styles.cardTop}>
                <Image 
                  source={require('../../../../assets/logo-min.png')} 
                  style={styles.cardLogo} 
                  resizeMode="contain"
                />
                <View style={styles.nfcIdContainer}>
                   <Text style={[styles.nfcIdLabel, { color: '#666' }]}>CARD ID</Text>
                   <Text style={[styles.nfcIdValue, { color: '#fff' }]}>{vloo.verified_cards?.[0]?.id || '••••'}</Text>
                </View>
              </View>
              
              <View style={styles.cardCenter}>
                <Text style={[styles.receiverNameLabel, { color: '#666' }]}>Sending to</Text>
                <Text style={[styles.receiverName, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>
                  {vloo.receiver_name || 'VLOO Gift'}
                </Text>
              </View>
              
              <View style={styles.cardBottom}>
                <View>
                  <Text style={[styles.cardLabel, { color: '#666' }]}>Unlock Date</Text>
                  <Text style={[styles.cardValue, { color: '#fff' }]}>{formattedDate}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.cardLabel, { color: '#666' }]}>Status</Text>
                  <Text style={[styles.cardValue, { color: '#fff' }]}>
                     {vloo.is_claimed ? 'Claimed' : 'Active'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.detailsContainer}>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Assets Bound</Text>
                 <Text style={styles.detailValue}>
                   {vloo.amount} {vloo.currency}
                 </Text>
               </View>
               <View style={styles.detailRow}>
                 <Text style={styles.detailLabel}>Chain</Text>
                 <Text style={styles.detailValue}>
                   {vloo.chain || 'Ethereum'}
                 </Text>
               </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    width: '100%',
  },
  modalHeader: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
  },
  modalBody: {
    padding: 24,
    paddingBottom: 40,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 24,
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  previewCard: {
    width: '100%',
    height: 220,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 32,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLogo: {
    width: 50,
    height: 50,
    marginTop: -10,
  },
  nfcIdContainer: {
    alignItems: 'flex-end',
  },
  nfcIdLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  nfcIdValue: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  receiverNameLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiverName: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: -24,
    marginBottom: -24,
    padding: 24,
  },
  cardLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
  },
});
