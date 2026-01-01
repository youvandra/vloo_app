import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Plus } from 'lucide-react-native';
import { COLORS, FONTS } from '../../../lib/theme';

const { width } = Dimensions.get('window');

interface CardStackProps {
  vloos: any[];
  onAddPress: () => void;
  onCardPress: (vloo: any) => void;
}

export const CardStack = ({ 
  vloos, 
  onAddPress,
  onCardPress
}: CardStackProps) => {
  
  const displayData = useMemo(() => {
    if (vloos.length > 0) {
      return vloos;
    }
    return [{ id: 'placeholder', isPlaceholder: true }];
  }, [vloos]);

  const renderCard = (item: any, index: number) => {
    const cardColor = item.color || COLORS.primary;
    
    // Stack effect calculations
    const CARD_HEIGHT = 220;
    const VISIBLE_HEIGHT = 80;
    const marginTop = index === 0 ? 0 : -(CARD_HEIGHT - VISIBLE_HEIGHT);
    
    return (
      <TouchableOpacity 
        key={item.id || index}
        style={[
          styles.mainCard, 
          { 
            backgroundColor: cardColor,
            marginTop: marginTop,
            zIndex: index, // Ensure visual stacking order
            elevation: index + 10, // Ensure visual stacking order on Android
            overflow: 'hidden', // Clip the decorative circles
          }
        ]}
        activeOpacity={0.9}
        onPress={() => onCardPress(item)}
      >
        {/* Decorative Circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        {/* Top Row: Name & Balance */}
        <View style={styles.cardTopRow}>
          <Text style={styles.cardName}>Vloo Card</Text>
          <View style={styles.cardBalanceContainer}>
            <Text style={styles.cardBalance}>$0.00</Text>
          </View>
        </View>

        {/* Bottom Left: Big Logo Text */}
        <Text style={styles.cardLogoText}>VLOO</Text>
      </TouchableOpacity>
    );
  };

  const renderCardItem = (item: any, index: number) => {
    if (item.isPlaceholder) {
      const CARD_HEIGHT = 220;
      const VISIBLE_HEIGHT = 80;
      const marginTop = index === 0 ? 0 : -(CARD_HEIGHT - VISIBLE_HEIGHT);

      return (
        <TouchableOpacity 
          key="placeholder"
          style={[
            styles.mainCard, 
            styles.placeholderCard,
            { 
              marginTop: marginTop,
              zIndex: index,
              elevation: index + 10,
            }
          ]}
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
    return renderCard(item, index);
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
        {displayData.map((item, index) => renderCardItem(item, index))}
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
    paddingHorizontal: 24,
    marginBottom: 40,
    marginTop: 10,
    paddingBottom: 24,
  },
  mainCard: {
    width: '100%',
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    transform: [
      { perspective: 1000 },
      { rotateX: '-20deg' },
      { scale: 0.95 } // Optional: slightly scale down to enhance 3D effect
    ],
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
  circle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -50,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -80,
    borderColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
  },
  circle3: {
    width: 100,
    height: 100,
    top: 40,
    left: 40,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardTopRow: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    width: '100%',
    gap: 6,
  },
  cardName: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  cardBalanceContainer: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardBalance: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
  cardLogoText: {
    position: 'absolute',
    bottom: -10,
    left: 15,
    fontFamily: FONTS.displayBold,
    fontSize: 90,
    color: 'rgba(255,255,255,0.95)',
    letterSpacing: -4,
    zIndex: 1,
  },
});
