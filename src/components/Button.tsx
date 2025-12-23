
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export const Button = ({ title, onPress, variant = 'primary', style, textStyle, disabled }: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return '#ccc';
    switch (variant) {
      case 'primary': return COLORS.foreground; // Black
      case 'secondary': return COLORS.inverse;  // White
      case 'accent': return COLORS.primary;     // Blue
      case 'outline': return 'transparent';
      default: return COLORS.foreground;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#666';
    switch (variant) {
      case 'primary': return COLORS.inverse;    // White
      case 'secondary': return COLORS.foreground; // Black
      case 'accent': return COLORS.inverse;     // White
      case 'outline': return COLORS.foreground;
      default: return COLORS.inverse;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 2, borderColor: COLORS.foreground };
    }
    return {};
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8}
      disabled={disabled}
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        style
      ]}
    >
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 999, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    letterSpacing: 0.5,
  }
});
