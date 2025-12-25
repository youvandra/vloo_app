import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { HeroCard } from '../components/HeroCard';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const handleGiverPress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigation.navigate('GiverDashboard');
    } else {
      navigation.navigate('GiverLogin');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Header / Brand */}
          <View style={styles.header}>
            <View style={styles.brandBadge}>
              <Text style={styles.brandBadgeText}>VLOO BETA</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.heroSection}>
            <View style={styles.cardWrapper}>
              {/* Subtle glow behind card */}
              <View style={styles.glowContainer}>
                <Svg height="300" width="300" viewBox="0 0 300 300">
                  <Defs>
                    <RadialGradient
                      id="grad"
                      cx="150"
                      cy="150"
                      rx="150"
                      ry="150"
                      fx="150"
                      fy="150"
                      gradientUnits="userSpaceOnUse"
                    >
                      <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.4" />
                      <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <SvgCircle cx="150" cy="150" r="150" fill="url(#grad)" />
                </Svg>
              </View>
              <HeroCard />
            </View>

            <View style={styles.textWrapper}>
              <Text style={styles.headline}>
                Crypto Gifting,{'\n'}
                <Text style={styles.headlineHighlight}>Simplified.</Text>
              </Text>
              <Text style={styles.subheadline}>
                The easiest way to manage, send, and receive digital assets with a single scan.
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.actionSection}>
            <Button
              title="Add Card"
              onPress={handleGiverPress}
              variant="primary"
              style={[styles.actionButton, { backgroundColor: COLORS.primary }]}
            />
            
            <Button
              title="Scan to Receive"
              onPress={() => navigation.navigate('ReceiverScan')}
              variant="secondary"
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  
  // Header
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  brandBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  brandBadgeText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
  },

  // Hero Section
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    width: 300,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: -1,
  },
  
  textWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  headline: {
    fontFamily: FONTS.displayBold,
    fontSize: 42,
    lineHeight: 48,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  headlineHighlight: {
    color: COLORS.accent,
  },
  subheadline: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    maxWidth: 300,
  },

  // Actions
  actionSection: {
    width: '100%',
    gap: 16,
    marginBottom: 10,
  },
  actionButton: {
    width: '100%',
    height: 56,
  },
});
