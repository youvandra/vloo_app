
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  gradient?: [string, string, ...string[]];
}

export const Button = ({ title, onPress, variant = 'primary', style, textStyle, disabled, gradient }: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return '#ccc';
    if (gradient) return 'transparent'; // Let gradient handle bg
    switch (variant) {
      case 'primary': return COLORS.foreground; // Black
      case 'secondary': return COLORS.inverse;  // White
      case 'accent': return COLORS.accent;      // Pale Violet
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.foreground;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#666';
    switch (variant) {
      case 'primary': return COLORS.inverse;    // White
      case 'secondary': return COLORS.foreground; // Black
      case 'accent': return COLORS.foreground;  // Black (better contrast on light purple)
      case 'outline': return COLORS.foreground;
      case 'ghost': return COLORS.foreground;
      default: return COLORS.inverse;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return { borderWidth: 2, borderColor: COLORS.foreground };
    }
    return {};
  };

  const buttonContent = (
    <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
      {title}
    </Text>
  );

  if (gradient && !disabled) {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.8}
        disabled={disabled}
        style={[style]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, getBorder(), style, { width: '100%', height: '100%', padding: 0 }]} // Ensure gradient fills
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

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
      {buttonContent}
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
