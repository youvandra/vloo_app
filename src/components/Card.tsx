
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, STYLES } from '../lib/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glass?: boolean;
}

export const Card = ({ children, style, glass = false }: CardProps) => {
  return (
    <View style={[
      styles.card, 
      glass && styles.glass,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent default
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...STYLES.shadow,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // More transparent for glass effect
    borderColor: 'rgba(255, 255, 255, 0.3)',
  }
});
