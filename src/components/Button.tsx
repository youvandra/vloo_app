
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, StyleProp, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../lib/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  gradient?: [string, string, ...string[]];
  leftIcon?: React.ReactNode;
}

export const Button = ({ title, onPress, variant = 'primary', style, textStyle, disabled, gradient, leftIcon }: ButtonProps) => {
  const getBackgroundColor = () => {
    if (disabled) return '#ccc';
    if (gradient) return 'transparent';
    switch (variant) {
      case 'primary': return COLORS.foreground;
      case 'secondary': return COLORS.inverse;
      case 'accent': return COLORS.accent;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return COLORS.foreground;
    }
  };

  const getTextColor = () => {
    if (disabled) return '#666';
    switch (variant) {
      case 'primary': return COLORS.inverse;
      case 'secondary': return COLORS.foreground;
      case 'accent': return COLORS.foreground;
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
    <View style={styles.contentRow}>
      {leftIcon ? <View style={styles.iconWrapper}>{leftIcon}</View> : null}
      <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
        {title}
      </Text>
    </View>
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
          style={[styles.button, getBorder(), style, { width: '100%', height: '100%', padding: 0 }]}
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 8,
  },
  text: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    letterSpacing: 0.5,
  }
});
