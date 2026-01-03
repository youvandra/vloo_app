import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Plus, Edit2, Minus, Check } from 'lucide-react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  runOnJS, 
  useAnimatedReaction
} from 'react-native-reanimated';
import { COLORS, FONTS } from '../../../lib/theme';

const { width } = Dimensions.get('window');
const VISIBLE_HEIGHT = 80;

interface CardStackProps {
  vloos: any[];
  isEditing?: boolean;
  onAddPress: () => void;
  onEditPress?: () => void;
  onCardPress: (vloo: any) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  onDeletePress?: (vloo: any) => void;
  onBuyPress?: () => void;
  currency?: 'IDR' | 'USD';
}

const formatCurrency = (amount: number, currency: 'IDR' | 'USD') => {
  const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount);
};

const DraggableCard = ({ 
  item, 
  index, 
  totalCards, 
  isEditing, 
  onCardPress, 
  onReorder,
  onDeletePress,
  activeDragIndex,
  activeDragTranslation,
  currency = 'IDR'
}: any) => {
  const cardColor = item.color || COLORS.primary;
  const CARD_HEIGHT = 220;
  // Use margin top for stack effect
  const marginTop = index === 0 ? 0 : -(CARD_HEIGHT - VISIBLE_HEIGHT);
  
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const zIndex = useSharedValue(index);

  const pan = Gesture.Pan()
    .enabled(isEditing)
    .onStart(() => {
      isDragging.value = true;
      // Removed zIndex override to allow dynamic calculation
      activeDragIndex.value = index;
      activeDragTranslation.value = 0;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
      activeDragTranslation.value = event.translationY;
    })
    .onEnd(() => {
      isDragging.value = false;
      const dragOffset = translateY.value;
      const indexOffset = Math.round(dragOffset / VISIBLE_HEIGHT);
      const newIndex = Math.max(0, Math.min(totalCards - 1, index + indexOffset));

      if (newIndex !== index && onReorder) {
        runOnJS(onReorder)(index, newIndex);
      }
      
      translateY.value = withTiming(0, { duration: 300 });
      // Removed zIndex reset
      activeDragIndex.value = -1;
      activeDragTranslation.value = 0;
    });

  const animatedStyle = useAnimatedStyle(() => {
    const isCurrentDragging = activeDragIndex.value === index;
    const isAnyDragging = activeDragIndex.value !== -1;
    
    let offsetY = 0;
    // Simplify Z-index: Dragged card is always top (1000). Others are their natural index.
    const effectiveZIndex = isCurrentDragging ? 1000 : index;
    
    if (isCurrentDragging) {
      offsetY = translateY.value;
    } else if (isAnyDragging) {
      const draggedIndex = activeDragIndex.value;
      const dragTranslation = activeDragTranslation.value;
      
      // Calculate target position based on drag
      const indexOffset = Math.round(dragTranslation / VISIBLE_HEIGHT);
      const targetRow = draggedIndex + indexOffset;
      const clampedTargetRow = Math.max(0, Math.min(totalCards - 1, targetRow));
      
      // Shift logic
      if (draggedIndex < clampedTargetRow) {
        // Dragging down: Items between draggedIndex and targetRow move UP (-VISIBLE_HEIGHT)
        if (index > draggedIndex && index <= clampedTargetRow) {
          offsetY = -VISIBLE_HEIGHT;
        }
      } else if (draggedIndex > clampedTargetRow) {
        // Dragging up: Items between targetRow and draggedIndex move DOWN (+VISIBLE_HEIGHT)
        if (index < draggedIndex && index >= clampedTargetRow) {
          offsetY = VISIBLE_HEIGHT;
        }
      }
    }

    return {
      transform: [
        { perspective: 1000 },
        { rotateX: '-20deg' },
        { scale: isDragging.value ? 1.05 : 0.95 },
        { translateY: isCurrentDragging ? offsetY : withTiming(offsetY, { duration: 300 }) }
      ],
      zIndex: effectiveZIndex,
      elevation: effectiveZIndex + 10,
      marginTop: marginTop,
    };
  });

  // If not editing, use standard TouchableOpacity behavior
  if (!isEditing) {
    return (
      <TouchableOpacity 
        key={item.id || index}
        style={[
          styles.mainCard, 
          { 
            backgroundColor: cardColor,
            marginTop: marginTop,
            zIndex: index, 
            elevation: index + 10, 
            overflow: 'hidden',
            transform: [
              { perspective: 1000 },
              { rotateX: '-20deg' },
              { scale: 0.95 }
            ],
          }
        ]}
        activeOpacity={0.9}
        onPress={() => onCardPress(item)}
      >
        <CardContent item={item} isEditing={false} currency={currency} />
      </TouchableOpacity>
    );
  }

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.mainCard,
          {
            backgroundColor: cardColor,
            elevation: index + 10,
            overflow: 'hidden',
          },
          animatedStyle
        ]}
      >
        <CardContent item={item} isEditing={isEditing} onDeletePress={onDeletePress} currency={currency} />
      </Animated.View>
    </GestureDetector>
  );
};

const CardContent = ({ item, isEditing, onDeletePress, currency = 'IDR' }: any) => (
  <>
    {/* Decorative Circles */}
    <View style={[styles.circle, styles.circle1]} />
    <View style={[styles.circle, styles.circle2]} />
    <View style={[styles.circle, styles.circle3]} />

    {/* Top Row: Name & Balance */}
    <View style={styles.cardTopRow}>
      <Text style={styles.cardName}>Vloo Card</Text>
      <View style={styles.cardBalanceContainer}>
        <Text style={styles.cardBalance}>{formatCurrency(item.balance || 0, currency)}</Text>
      </View>
    </View>

    {/* Bottom Left: Big Logo Text */}
    <Text style={styles.cardLogoText}>VLOO</Text>

    {/* Delete Icon in Edit Mode */}
    {isEditing && (
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => onDeletePress && onDeletePress(item)}
      >
        <Minus size={12} color="#fff" />
      </TouchableOpacity>
    )}
  </>
);

export const CardStack = ({ 
  vloos, 
  isEditing = false,
  onAddPress,
  onEditPress,
  onCardPress,
  onReorder,
  onDeletePress,
  onBuyPress,
  currency = 'IDR'
}: CardStackProps) => {
  
  const displayData = useMemo(() => {
    if (vloos.length > 0) {
      return vloos;
    }
    return [{ id: 'placeholder', isPlaceholder: true }];
  }, [vloos]);

  const activeDragIndex = useSharedValue(-1);
  const activeDragTranslation = useSharedValue(0);

  const renderCardItem = (item: any, index: number) => {
    if (item.isPlaceholder) {
      const CARD_HEIGHT = 220;
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
              transform: [], // 2D view for placeholder
            }
          ]}
          onPress={onAddPress}
          activeOpacity={0.8}
        >
          <View style={styles.placeholderInner}>
            <View style={styles.placeholderIconContainer}>
              <Plus size={32} color="#fff" />
            </View>
            <Text style={styles.placeholderText}>Create New Vloo Card</Text>
            <Text style={styles.placeholderSubtext}>Tap to add another recipient</Text>
            
            <TouchableOpacity 
                style={{ marginTop: 20, padding: 8 }}
                onPress={() => onBuyPress && onBuyPress()}
            >
                <Text style={{ 
                    color: COLORS.primary, 
                    fontFamily: FONTS.bodyBold, 
                    fontSize: 14,
                    textDecorationLine: 'underline'
                }}>
                    Don't have a card? Buy one here
                </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }
    
    return (
      <DraggableCard 
        key={item.id || index}
        item={item}
        index={index}
        totalCards={displayData.length}
        isEditing={isEditing}
        onCardPress={onCardPress}
        onReorder={onReorder}
        onDeletePress={onDeletePress}
        activeDragIndex={activeDragIndex}
        activeDragTranslation={activeDragTranslation}
        currency={currency}
      />
    );
  };


  return (
    <View>
      {/* Cards Header */}
      <View style={[styles.walletHeader, { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
         <Text style={styles.walletTitle}>Cards ({vloos.length})</Text>
         <TouchableOpacity 
           onPress={onEditPress}
           style={{ 
             flexDirection: 'row', 
             alignItems: 'center', 
             paddingVertical: 8,
             paddingHorizontal: 12,
             borderRadius: 20,
             backgroundColor: 'rgba(52,152,219,0.1)'
           }}
         >
           <Edit2 size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
           <Text style={{ fontFamily: FONTS.bodyBold, fontSize: 14, color: COLORS.primary }}>
             {isEditing ? 'Done' : 'Edit'}
           </Text>
         </TouchableOpacity>
      </View>

      {/* Cards Stack */}
      <View style={styles.cardStackContainer}>
        {displayData.map((item, index) => renderCardItem(item, index))}
        
        {vloos.length === 1 && !isEditing && (
             <Text style={{ 
                 textAlign: 'center', 
                 marginTop: 24, 
                 color: '#999', 
                 fontFamily: FONTS.bodyRegular, 
                 fontSize: 13,
                 fontStyle: 'italic'
             }}>
                 Tap the card to view details
             </Text>
         )}

         {isEditing && (
             <Text style={{ 
                 textAlign: 'center', 
                 marginTop: 24, 
                 color: '#999', 
                 fontFamily: FONTS.bodyRegular, 
                 fontSize: 13,
                 fontStyle: 'italic'
             }}>
                 Hold and drag to reorder cards
             </Text>
         )}
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
    alignItems: 'center',
  },
  mainCard: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
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
    backgroundColor: '#fff',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  placeholderInner: {
    flex: 1,
    width: '100%',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  placeholderIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
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
  deleteButton: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF3B30', // System Red
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
