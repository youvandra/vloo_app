import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number;
  style?: ViewStyle;
}

export const Skeleton = ({ width, height, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          backgroundColor: '#E1E9EE',
          borderRadius: 4,
          opacity: opacity,
        },
        style,
      ]}
    />
  );
};
