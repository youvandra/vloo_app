import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl, BackHandler, Dimensions, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Bell, Plus, Send, Wallet, Copy, Home, BarChart2, CreditCard, Grid, LogOut, User, ArrowDown } from 'lucide-react-native';
import { Button } from '../../components/Button';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.82; // Slightly wider for better peek
const CARD_SPACING = 12;

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);

  const fetchVloos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
         navigation.replace('GiverLogin');
         return;
      }
      
      setUser(session.user);

      const { data, error } = await supabase
        .from('vloos')
        .select('*, cards(id)')
        .eq('giver_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVloos(data || []);
    } catch (error) {
      console.error('Error fetching vloos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVloos();
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVloos();
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.replace('GiverLogin');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const displayData = useMemo(() => {
    return [...vloos, { id: 'placeholder', isPlaceholder: true }];
  }, [vloos]);

  const renderCardItem = ({ item }: { item: any }) => {
    if (item.isPlaceholder) {
      return (
        <TouchableOpacity 
          style={[styles.mainCard, styles.placeholderCard]}
          onPress={() => navigation.navigate('GiverCreate')}
          activeOpacity={0.8}
        >
          <View style={styles.placeholderContent}>
            <View style={styles.placeholderIconContainer}>
              <Plus size={40} color={COLORS.primary} />
            </View>
            <Text style={styles.placeholderText}>Create New Vloo Card</Text>
            <Text style={styles.placeholderSubtext}>Tap to add another recipient</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return renderCard(item);
  };

  const renderCard = (item: any) => {
    return (
      <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLogo}>
            <View style={styles.logoLeft} />
            <View style={styles.logoRight} />
          </View>
          <View style={styles.nfcIdContainer}>
             <Text style={styles.nfcIdLabel}>CARD ID</Text>
             <Text style={styles.nfcIdValue}>{item.cards?.[0]?.id || '••••'}</Text>
          </View>
        </View>
        
        <View style={styles.cardCenter}>
          <Text style={styles.receiverNameLabel}>Sending to</Text>
          <Text style={styles.receiverName} numberOfLines={1} adjustsFontSizeToFit>
            {item.receiver_name || 'VLOO Gift'}
          </Text>
        </View>
        
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardLabel}>Unlock Date</Text>
            <Text style={styles.cardValue}>
              {item.unlock_date ? new Date(item.unlock_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Sep 29, 2025'}
            </Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Glow */}
      <View style={styles.glowContainer}>
        <Svg height={width} width={width} viewBox={`0 0 ${width} ${width}`}>
          <Defs>
            <RadialGradient
              id="grad"
              cx={width / 2}
              cy={width / 2}
              rx={width / 2}
              ry={width / 2}
              fx={width / 2}
              fy={width / 2}
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor={COLORS.primary} stopOpacity="0.4" />
              <Stop offset="1" stopColor={COLORS.primary} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <SvgCircle cx={width / 2} cy={width / 2} r={width / 2} fill="url(#grad)" />
        </Svg>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <TouchableOpacity onPress={() => setShowProfileMenu(!showProfileMenu)}>
                <Image 
                  source={{ uri: user?.user_metadata?.avatar_url || 'https://i.pravatar.cc/150?u=giver' }} 
                  style={styles.avatar} 
                />
              </TouchableOpacity>
              <View>
                <Text style={styles.greeting}>Morning {user?.user_metadata?.full_name?.split(' ')[0] || 'Giver'},</Text>
                <Text style={styles.accountType}>Free Account</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => navigation.navigate('GiverCreate')}
              >
                <Plus color="#fff" size={20} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton}>
                <Bell color="#fff" size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setShowProfileMenu(false);
                // Navigate to edit profile or show modal
                console.log('Edit Profile');
              }}>
                <User size={18} color="#fff" />
                <Text style={styles.menuText}>Edit Profile</Text>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity style={styles.menuItem} onPress={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}>
                <LogOut size={18} color="#FF4D4D" />
                <Text style={[styles.menuText, { color: '#FF4D4D' }]}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Cards Stack or Empty State */}
          {vloos.length > 0 ? (
            <>
              <View style={styles.cardStackContainer}>
                <FlatList
                  data={displayData}
                  renderItem={renderCardItem}
                  horizontal
                  pagingEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => item.id || index.toString()}
                  onMomentumScrollEnd={(ev) => {
                    const index = Math.round(ev.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_SPACING));
                    setCurrentCardIndex(index);
                  }}
                  snapToInterval={CARD_WIDTH + CARD_SPACING}
                  decelerationRate="fast"
                  contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
                  snapToAlignment="center"
                />
              </View>

              {/* Message Section */}
              {currentCardIndex < vloos.length ? (
                <View style={styles.messageSection}>
                  <Text style={styles.messageLabel}>Note for receiver</Text>
                  <View style={styles.messageContainer}>
                    <Text style={styles.messageText}>
                      {vloos[currentCardIndex]?.message || 'No message attached'}
                    </Text>
                  </View>
                  <Text style={styles.messageContextText}>Included with deposit</Text>
                </View>
              ) : (
                <View style={[styles.messageSection, { opacity: 0 }]} pointerEvents="none">
                   {/* Invisible placeholder to maintain layout height if needed, or just hide */}
                   <Text style={styles.messageLabel}>Placeholder</Text>
                   <View style={styles.messageContainer}><Text style={styles.messageText}>Placeholder</Text></View>
                   <Text style={styles.messageContextText}>Placeholder</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsContainer}>
                {currentCardIndex < vloos.length ? (
                  <Button
                    title="Confirm Deposit"
                    onPress={() => console.log('Deposit pressed')}
                    variant="primary"
                    style={styles.depositButton}
                    gradient={['#d199f9', '#9F60D1']} // Pink gradient like first screen
                  />
                ) : (
                  <Button
                    title="Create New Card"
                    onPress={() => navigation.navigate('GiverCreate')}
                    variant="primary"
                    style={styles.depositButton}
                  />
                )}
              </View>
            </>
          ) : (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateText}>
                You don't have any Vloo cards yet.
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Create your first digital gift card to get started.
              </Text>
              <Button
                title="Create Vloo Card"
                onPress={() => navigation.navigate('GiverCreate')}
                variant="primary"
                style={{ width: 200, marginTop: 24 }}
              />
            </View>
          )}

        </SafeAreaView>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      {vloos.length > 0 && (
        <View style={styles.bottomNavContainer}>
          <View style={styles.bottomNav}>
            <TouchableOpacity style={styles.navItemActive}>
              <View style={[styles.navIconActive, { backgroundColor: '#000' }]}>
                <Home size={20} color="#fff" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <BarChart2 size={20} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <CreditCard size={20} color="#000" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.navItem}>
              <Grid size={20} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  glowContainer: {
    position: 'absolute',
    top: -width * 0.1,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: -1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  safeArea: {
    // paddingHorizontal: 24, // Removed to allow full-screen card swiping
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
    paddingHorizontal: 24, // Added padding here
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  greeting: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#fff',
  },
  accountType: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#888',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Profile Menu
  profileMenu: {
    position: 'absolute',
    top: 120, // Lowered significantly to ensure it's under the avatar
    left: 24, // Aligned with padding
    right: 24, // Constrain width to safe area logic
    width: 'auto',
    maxWidth: 240,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 8,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderRadius: 8,
  },
  menuText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 4,
  },

  // Card Stack
  cardStackContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 10,
    zIndex: 10, // Ensure stack is above other elements if needed
  },
  mainCard: {
    width: CARD_WIDTH, // Explicit width for FlatList items
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginRight: CARD_SPACING,
  },
  placeholderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0, // No shadow for placeholder
    elevation: 0,
  },
  placeholderContent: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLogo: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  logoLeft: {
    position: 'absolute',
    width: 8,
    height: 20,
    backgroundColor: '#fff',
    transform: [{ rotate: '-45deg' }],
    left: 4,
    top: 5,
    borderRadius: 4,
  },
  logoRight: {
    position: 'absolute',
    width: 8,
    height: 12,
    backgroundColor: '#fff',
    transform: [{ rotate: '45deg' }],
    right: 4,
    top: 5,
    borderRadius: 4,
  },
  nfcIdContainer: {
    alignItems: 'flex-end',
  },
  nfcIdLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  nfcIdValue: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
  },
  cardCenter: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  receiverNameLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  receiverName: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: -24,
    marginBottom: -24,
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cardLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  cardValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
  },

  // Message Section
  messageSection: {
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 24, // Increased padding
  },
  messageLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
  messageContainer: {
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 8,
  },
  messageText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  messageContextText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginRight: 4,
  },

  // Actions
  actionsContainer: {
    width: '100%',
    marginBottom: 120,
    paddingHorizontal: 24, // Added padding
  },
  depositButton: {
    width: '100%',
    height: 56,
  },

  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 16,
    paddingHorizontal: 24, // Added padding
  },
  emptyStateText: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    maxWidth: 260,
  },
  arrowContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Bouncing animation could be added here later
  },

  // Floating Nav
  bottomNavContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Spread items out
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    width: width - 48, // Make it almost full width (24px margin on each side)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  navItem: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  navItemActive: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconActive: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginHorizontal: 8,
  },
  navAddButtonWrapper: {
    width: 60,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  navFloatingButton: {
    position: 'absolute',
    top: -10,
    marginHorizontal: 0,
  },
});