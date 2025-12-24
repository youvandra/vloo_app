import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
  useDerivedValue,
  interpolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Svg, { Path, Defs, Pattern, Rect, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../lib/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 280; // Reduced from 300
const CARD_HEIGHT = 170; // Reduced from 190
const ROTATION_DURATION = 20000; // 20 seconds for full rotation

export const HeroCard = () => {
  // Shared Values
  const rotation = useSharedValue(0);
  const floatY = useSharedValue(0);
  const isInteracting = useSharedValue(false);
  const savedRotation = useSharedValue(0);

  // Auto-rotation logic
  const startRotation = () => {
    'worklet';
    // Swaying animation: 0 -> 30 -> 0 -> -30 -> 0
    rotation.value = withRepeat(
      withSequence(
        withTiming(30, { duration: 3000, easing: Easing.inOut(Easing.quad) }), // Move right 30deg
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.quad) }),  // Return to center
        withTiming(-30, { duration: 3000, easing: Easing.inOut(Easing.quad) }), // Move left 30deg
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.quad) })   // Return to center
      ),
      -1, // Infinite
      false // No reverse
    );
  };

  const startFloat = () => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true // Reverse
    );
  };

  useEffect(() => {
    startRotation();
    startFloat();
    return () => {
      cancelAnimation(rotation);
      cancelAnimation(floatY);
    };
  }, []);

  // Gesture Handling
  const pan = Gesture.Pan()
    .onBegin(() => {
      isInteracting.value = true;
      cancelAnimation(rotation);
      savedRotation.value = rotation.value;
    })
    .onUpdate((event) => {
      // Sensitivity factor: 1 pixel drag = X degrees
      // Full screen width drag = 180 degrees
      const deltaRotation = (event.translationX / width) * 180;
      rotation.value = savedRotation.value + deltaRotation;
    })
    .onFinalize((event) => {
      isInteracting.value = false;
      
      // Return to 0 then restart the swaying loop
      rotation.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.quad) }, (finished) => {
        if (finished) {
          startRotation();
        }
      });
    });

  // Animated Styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotation.value}deg` },
        { translateY: floatY.value },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.cardContainer, animatedStyle]}>
          <LinearGradient
            colors={[COLORS.primary, '#060e62']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            {/* Pattern Background */}
            <View style={StyleSheet.absoluteFill}>
              <Svg height="100%" width="100%">
                <Defs>
                  <Pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <Circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.15)" />
                  </Pattern>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#dots)" />
                {/* Large Wave Curve for Premium Feel */}
                <Path 
                  d={`M0 ${CARD_HEIGHT} C ${CARD_WIDTH * 0.4} ${CARD_HEIGHT * 0.4}, ${CARD_WIDTH * 0.6} ${CARD_HEIGHT * 0.6}, ${CARD_WIDTH} 0 L ${CARD_WIDTH} ${CARD_HEIGHT} Z`} 
                  fill="rgba(255,255,255,0.05)"
                />
              </Svg>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.brandText}>VLOO</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220, // Reduced from 250
    zIndex: 10,
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#1a1a1a', // Fallback
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    overflow: 'hidden',
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  brandText: {
    position: 'absolute',
    bottom: -6, 
    left: 8,
    width: '100%', // Ensure text container has enough width
    fontFamily: FONTS.displayBold,
    fontSize: 64, // Reduced from 72 to match new card size
    color: '#fff',
    letterSpacing: -4,
  },
});
