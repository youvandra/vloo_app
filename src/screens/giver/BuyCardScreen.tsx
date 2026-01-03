import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Linking } from 'react-native';
import { ArrowLeft, CreditCard, Shield, Lock, Smartphone } from 'lucide-react-native';
import { COLORS, FONTS } from '../../lib/theme';

export default function BuyCardScreen({ navigation }: any) {
  const handleBuy = () => {
    // Replace with actual URL when available
    Linking.openURL('https://www.vloo.cards/buy-card'); 
  };

  const features = [
    {
      icon: <Shield size={24} color={COLORS.primary} />,
      title: 'Bank-Grade Security',
      description: 'Your assets are protected by advanced encryption and hardware security.'
    },
    {
      icon: <Lock size={24} color={COLORS.primary} />,
      title: 'Self-Custody',
      description: 'You own your keys. No middleman can access your funds.'
    },
    {
      icon: <Smartphone size={24} color={COLORS.primary} />,
      title: 'Easy to Use',
      description: 'Tap to interact with your phone. No complex setup required.'
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Vloo Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
            <View style={styles.cardPreview}>
                 <Text style={styles.cardLogo}>VLOO</Text>
                 <CreditCard size={48} color="rgba(255,255,255,0.8)" style={{ position: 'absolute', bottom: 20, right: 20 }} />
            </View>
            <Text style={styles.heroTitle}>The Future of Gifting</Text>
            <Text style={styles.heroSubtitle}>Physical cards for digital assets.</Text>
        </View>

        <View style={styles.features}>
            {features.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                    <View style={styles.iconContainer}>
                        {feature.icon}
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.featureTitle}>{feature.title}</Text>
                        <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                </View>
            ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
          <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>$9.99</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} onPress={handleBuy}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 18,
    color: '#000',
  },
  content: {
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    padding: 32,
  },
  cardPreview: {
    width: 280,
    height: 170,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    marginBottom: 32,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
  },
  cardLogo: {
    fontFamily: FONTS.displayBold || 'System',
    fontSize: 32,
    color: '#fff',
    letterSpacing: 2,
  },
  heroTitle: {
    fontFamily: FONTS.displayBold || 'System',
    fontSize: 24,
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  features: {
    padding: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52,152,219,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  featureDescription: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#888',
  },
  priceValue: {
    fontFamily: FONTS.displayBold || 'System',
    fontSize: 24,
    color: '#000',
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
  },
  buyButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#fff',
  },
});
