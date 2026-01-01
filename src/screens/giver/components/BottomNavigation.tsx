import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { WalletCards, AlignJustify, ScanLine } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { COLORS, FONTS } from '../../../lib/theme';

const { width } = Dimensions.get('window');
const TAB_HEIGHT = 80;
const CENTER_BUTTON_SIZE = 64;

interface BottomNavigationProps {
  activeTab?: string;
  onTabPress?: (tab: string) => void;
  onScanPress?: () => void;
}

export const BottomNavigation = ({ 
  activeTab = 'home', 
  onTabPress = () => {}, 
  onScanPress = () => {} 
}: BottomNavigationProps) => {
  
  // Custom SVG Background with a curved dip in the center
  const center = width / 2;
  const curveWidth = 90;
  const curveDepth = 42;
  const radius = 32;
  const curveTension = 20;

  // Calculate curve control points for smooth transition
  const startX = center - curveWidth / 2;
  const endX = center + curveWidth / 2;
  const midX = center;
  const midY = curveDepth;

  // Control points for first half (Start -> Bottom)
  const cp1x = startX + curveTension;
  const cp1y = 0;
  const cp2x = midX - curveTension;
  const cp2y = midY;

  // Control points for second half (Bottom -> End)
  const cp3x = midX + curveTension;
  const cp3y = midY;
  const cp4x = endX - curveTension;
  const cp4y = 0;
  
  // Path for the background with rounded top corners and smooth center dip
  const path = `
    M 0 ${radius}
    Q 0 0 ${radius} 0
    L ${startX} 0
    C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${midX} ${midY}
    C ${cp3x} ${cp3y} ${cp4x} ${cp4y} ${endX} 0
    L ${width - radius} 0
    Q ${width} 0 ${width} ${radius}
    L ${width} ${TAB_HEIGHT}
    L 0 ${TAB_HEIGHT}
    Z
  `;

  return (
    <View style={styles.container}>
      {/* Background SVG */}
      <View style={styles.backgroundContainer}>
        <Svg width={width} height={TAB_HEIGHT}>
          <Path d={path} fill={COLORS.inverse} />
        </Svg>
      </View>

      {/* Tab Items Container */}
      <View style={styles.tabsContainer}>
        {/* Left Tab: Cards (Home) */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('home')}
          activeOpacity={0.7}
        >
          <WalletCards 
            size={24} 
            color={activeTab === 'home' ? COLORS.primary : '#8E8E93'} 
            strokeWidth={2}
          />
           <View style={{ position: 'absolute', opacity: 0 }} />
        </TouchableOpacity>
        
        {/* Spacer for Center Button */}
        <View style={{ width: curveWidth }} />

        {/* Right Tab: More (Menu) */}
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => onTabPress('more')}
          activeOpacity={0.7}
        >
          <AlignJustify 
            size={24} 
            color={activeTab === 'more' ? COLORS.primary : '#8E8E93'} 
          />
        </TouchableOpacity>
      </View>

      {/* Floating Center Button */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity 
          style={styles.centerButton} 
          onPress={onScanPress}
          activeOpacity={0.8}
        >
          <ScanLine size={30} color={COLORS.inverse} />
        </TouchableOpacity>
        <Text style={styles.scanLabel}>Scan</Text>
      </View>

      {/* Labels Layer (positioned absolutely to align with tabs) */}
      <View style={styles.labelsContainer}>
         <View style={styles.labelWrapper}>
           <Text style={[styles.labelText, { color: activeTab === 'home' ? COLORS.primary : '#8E8E93' }]}>Cards</Text>
         </View>
         <View style={{ width: curveWidth }} />
         <View style={styles.labelWrapper}>
           <Text style={[styles.labelText, { color: activeTab === 'more' ? COLORS.primary : '#8E8E93' }]}>More</Text>
         </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT,
    elevation: 0,
    zIndex: 100,
  },
  backgroundContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingHorizontal: 40,
    height: '100%',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 40,
  },
  centerButtonContainer: {
    position: 'absolute',
    top: -24,
    left: width / 2 - CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: CENTER_BUTTON_SIZE,
    height: CENTER_BUTTON_SIZE,
    borderRadius: CENTER_BUTTON_SIZE / 2,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: COLORS.inverse, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  scanLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E93',
    fontFamily: FONTS.bodyRegular || 'System',
  },
  labelsContainer: {
    position: 'absolute',
    bottom: 0, // Align to bottom
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 16, // Bottom padding for text
  },
  labelWrapper: {
    width: 60,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontFamily: FONTS.bodySemiBold || 'System',
    marginTop: 4,
  }
});
