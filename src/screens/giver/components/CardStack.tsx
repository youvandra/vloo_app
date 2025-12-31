import React, { useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions } from 'react-native';
import { Plus, MessageSquare } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82;
const CARD_SPACING = 12;

interface CardStackProps {
  vloos: any[];
  currentCardIndex: number;
  onCardChange: (index: number) => void;
  onAddPress: () => void;
  onEditPress: (vloo: any) => void;
  onPreviewPress: (vloo: any) => void;
  onCardPress: (vloo: any) => void;
}

export const CardStack = ({ 
  vloos, 
  currentCardIndex, 
  onCardChange, 
  onAddPress,
  onEditPress,
  onPreviewPress,
  onCardPress
}: CardStackProps) => {
  
  const displayData = useMemo(() => {
    return [...vloos, { id: 'placeholder', isPlaceholder: true }];
  }, [vloos]);
  
  const listRef = useRef<FlatList<any>>(null);
  
  useEffect(() => {
    const offset = currentCardIndex * (CARD_WIDTH + CARD_SPACING);
    listRef.current?.scrollToOffset({ offset, animated: true });
  }, [currentCardIndex]);

  const renderCard = (item: any) => {
    const cardColor = item.verified_cards?.[0]?.color === 'blue' ? COLORS.primary : '#000';
    
    return (
      <TouchableOpacity 
        style={[styles.mainCard, { backgroundColor: cardColor }]}
        activeOpacity={0.9}
        onPress={() => onCardPress(item)}
      >
        <View style={styles.cardTop}>
          <Image 
            source={require('../../../assets/logo-min.png')} 
            style={styles.cardLogo} 
            resizeMode="contain"
          />
          <View style={styles.nfcIdContainer}>
             <Text style={[styles.nfcIdLabel, { color: '#666' }]}>CARD ID</Text>
             <Text style={[styles.nfcIdValue, { color: '#fff' }]}>{item.verified_cards?.[0]?.id || '••••'}</Text>
          </View>
        </View>
        
        <View style={styles.cardCenter}>
          <Text style={[styles.receiverNameLabel, { color: '#666' }]}>Sending to</Text>
          <Text style={[styles.receiverName, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>
            {item.receiver_name || 'VLOO Gift'}
          </Text>
        </View>
        
        <View style={styles.cardBottom}>
          <View>
            <Text style={[styles.cardLabel, { color: '#666' }]}>Unlock Date</Text>
            <Text style={[styles.cardValue, { color: '#fff' }]}>
              {item.unlock_date ? new Date(item.unlock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Whenever'}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity 
              style={[styles.cardSettingsButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={() => onPreviewPress(item)}
            >
               <MessageSquare size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCardItem = ({ item }: { item: any }) => {
    if (item.isPlaceholder) {
      return (
        <TouchableOpacity 
          style={[styles.mainCard, styles.placeholderCard]}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <View style={styles.placeholderContent}>
            <View style={styles.placeholderIconContainer}>
              <Plus size={40} color="#fff" />
            </View>
            <Text style={styles.placeholderText}>Create New Vloo Card</Text>
            <Text style={styles.placeholderSubtext}>Tap to add another recipient</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return renderCard(item);
  };

  return (
    <View>
      {/* Cards Header */}
      <View style={[styles.walletHeader, { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
         <Text style={styles.walletTitle}>Cards ({vloos.length})</Text>
         <TouchableOpacity 
           onPress={onAddPress}
           style={{ 
             flexDirection: 'row', 
             alignItems: 'center', 
             paddingVertical: 8,
             paddingHorizontal: 12,
             borderRadius: 20,
             backgroundColor: 'rgba(52,152,219,0.1)'
           }}
         >
           <Plus size={16} color={COLORS.primary} style={{ marginRight: 4 }} />
           <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.primary }}>Add Card</Text>
         </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardStackContainer}>
        <FlatList
          ref={listRef}
          data={displayData}
          renderItem={renderCardItem}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => item.id || index.toString()}
          onMomentumScrollEnd={(ev) => {
            const index = Math.round(ev.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
            if (index !== currentCardIndex) {
              onCardChange(index);
            }
          }}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
          snapToAlignment="center"
        />
        {/* Pagination Dots */}
        <View style={styles.paginationContainer}>
          {(() => {
            const MAX_DOTS = 5;
            const total = displayData.length;
            
            let end = Math.max(MAX_DOTS - 1, currentCardIndex);
            end = Math.min(total - 1, end);
            let start = end - MAX_DOTS + 1;
            start = Math.max(0, start);

            return displayData.map((_, index) => {
              if (index < start || index > end) return null;
              
              return (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentCardIndex ? styles.paginationDotActive : null
                  ]}
                />
              );
            });
          })()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  walletHeader: {
    marginBottom: 12,
  },
  walletTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: '#666',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardStackContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
  },
  mainCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginRight: CARD_SPACING,
  },
  placeholderCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
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
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
  cardSettingsButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  paginationDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});
