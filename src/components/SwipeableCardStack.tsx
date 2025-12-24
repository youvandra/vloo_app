import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  runOnJS, 
  interpolate, 
  Extrapolation,
  withTiming,
  useDerivedValue
} from 'react-native-reanimated';
import { COLORS } from '../lib/theme';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = width * 0.3;
const ANIMATION_CONFIG = { damping: 20, stiffness: 200, mass: 0.5 };

interface SwipeableCardStackProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onSwipeRight?: (item: any) => void;
  onSwipeLeft?: (item: any) => void;
  containerStyle?: any;
}

export default function SwipeableCardStack({ 
  data, 
  renderItem, 
  onSwipeRight, 
  onSwipeLeft,
  containerStyle 
}: SwipeableCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translationX = useSharedValue(0);
  const translationY = useSharedValue(0);

  // Reset current index if data changes significantly or if needed
  // For now, we assume data appends or we just keep index. 
  // If data is refreshed completely, we might want to reset index?
  // Let's keep it simple.

  const handleSwipeComplete = (direction: 'left' | 'right') => {
    const item = data[currentIndex];
    if (direction === 'right' && onSwipeRight) {
      onSwipeRight(item);
    } else if (direction === 'left' && onSwipeLeft) {
      onSwipeLeft(item);
    }
    
    setCurrentIndex((prev) => (prev + 1) % data.length); // Loop or stop? Let's loop for now to always show cards if available
    translationX.value = 0;
    translationY.value = 0;
  };

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      translationX.value = e.translationX;
      translationY.value = e.translationY * 0.2; // Minimal vertical movement
    })
    .onEnd((e) => {
      if (Math.abs(e.translationX) > SWIPE_THRESHOLD) {
        const direction = e.translationX > 0 ? 'right' : 'left';
        // Fly out
        translationX.value = withTiming(
          direction === 'right' ? width * 1.5 : -width * 1.5, 
          {}, 
          () => runOnJS(handleSwipeComplete)(direction)
        );
      } else {
        // Spring back
        translationX.value = withSpring(0, ANIMATION_CONFIG);
        translationY.value = withSpring(0, ANIMATION_CONFIG);
      }
    });

  if (!data || data.length === 0) {
    return null; // Or render empty state
  }

  // We render the top 3 cards + the incoming background card
  // To simulate the stack, we need to render them in reverse order of z-index
  // Bottom-most first.
  
  // Indexes to render:
  // currentIndex + 2 (Bottom)
  // currentIndex + 1 (Middle)
  // currentIndex (Top)
  
  const cardsToRender = [2, 1, 0].map(offset => {
    // Avoid rendering more cards than we have data for, to prevent duplicates in the stack visual
    if (offset >= data.length) return null;

    const index = (currentIndex + offset) % data.length;
    const item = data[index];
    
    // If we don't loop and run out of cards, handle it:
    if (index < 0 || !item) return null;
    
    return { item, index, offset }; // offset 0 is top, 1 is under, 2 is bottom
  }).filter(Boolean); // remove nulls

  return (
    <View style={[styles.container, containerStyle]}>
      {cardsToRender.map((card, i) => {
        if (!card) return null;
        return (
          <CardItem
            key={card.item.id} // Use item ID as key for stable identity across offsets
            item={card.item}
            index={card.index}
            offset={card.offset}
            renderItem={renderItem}
            translationX={translationX}
            translationY={translationY}
            totalCards={data.length}
            gesture={gesture}
          />
        );
      })}
    </View>
  );
}

interface CardItemProps {
  item: any;
  index: number;
  offset: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  translationX: Animated.SharedValue<number>;
  translationY: Animated.SharedValue<number>;
  totalCards: number;
  gesture: any;
}

const CardItem = ({ 
  item, 
  index, 
  offset, 
  renderItem, 
  translationX, 
  translationY,
  totalCards,
  gesture
}: CardItemProps) => {
  // offset 0 = top card
  // offset 1 = 2nd card
  // offset 2 = 3rd card

  const animatedStyle = useAnimatedStyle(() => {
    // Basic stack values
    let scale = 1;
    let translateY = 0;
    let opacity = 1;
    let widthPercent = 1;
    let zIndex = 0;

    // We use translationX to interpolate the "next" state for cards below
    // When translationX is large (swiping away), offset 1 becomes offset 0, offset 2 becomes offset 1.
    
    const swipeProgress = Math.min(Math.abs(translationX.value) / (width * 1.2), 1);
    
    if (offset === 0) {
      // Top card
      return {
        transform: [
          { translateX: translationX.value },
          { translateY: translationY.value },
          { rotate: `${translationX.value / 20}deg` }
        ],
        zIndex: 100,
        opacity: 1
      };
    } 
    
    // Background cards logic
    // offset 1: scale 0.95 -> 1, top -12 -> 0
    // offset 2: scale 0.9 -> 0.95, top -24 -> -12
    
    // Base values for offsets (simulating the design in Dashboard)
    // Stack 1 (offset 1): width 0.88, top -6, opacity 0.8
    // Stack 2 (offset 2): width 0.82, top -12, opacity 0.5
    // Stack 3 (offset 3): width 0.75, top -24, opacity 0.3
    
    // Let's approximate nicely
    const baseScale = 1 - (offset * 0.05); // 1, 0.95, 0.9
    const baseTranslateY = -offset * 12; // 0, -12, -24
    const baseOpacity = 1 - (offset * 0.2); // 1, 0.8, 0.6
    
    const nextScale = 1 - ((offset - 1) * 0.05);
    const nextTranslateY = -(offset - 1) * 12;
    const nextOpacity = 1 - ((offset - 1) * 0.2);
    
    scale = interpolate(swipeProgress, [0, 1], [baseScale, nextScale]);
    translateY = interpolate(swipeProgress, [0, 1], [baseTranslateY, nextTranslateY]);
    opacity = interpolate(swipeProgress, [0, 1], [baseOpacity, nextOpacity]);
    
    return {
      transform: [
        { scale },
        { translateY }
      ],
      opacity,
      zIndex: 10 - offset
    };
  });

  const CardContent = (
    <Animated.View style={[styles.cardContainer, animatedStyle]}>
      {renderItem(item, index)}
    </Animated.View>
  );

  if (offset === 0) {
    return (
      <GestureDetector gesture={gesture}>
        {CardContent}
      </GestureDetector>
    );
  }

  return CardContent;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240, // Enough for cards + stack offsets
    marginTop: 20,
  },
  cardContainer: {
    position: 'absolute',
    width: '100%',
    // alignItems: 'center', // Let renderItem handle width/layout
  }
});
