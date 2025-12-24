import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, RefreshControl, BackHandler } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Bell, Plus, Send, Wallet, Copy, Home, BarChart2, CreditCard, Grid, LogOut, User } from 'lucide-react-native';

import SwipeableCardStack from '../../components/SwipeableCardStack';

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

  const renderCard = (item: any) => {
    return (
      <View style={[styles.mainCard, { backgroundColor: COLORS.primary }]}>
        <View style={styles.cardTop}>
          <View style={styles.cardLogo}>
            <View style={styles.logoLeft} />
            <View style={styles.logoRight} />
          </View>
        </View>
        
        <Text style={styles.cardNumber}>
          {item.cards?.[0]?.id || 'No Card Linked'}
        </Text>
        
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.cardLabel}>Receiver Name</Text>
            <Text style={styles.cardValue}>{item.receiver_name || 'VLOO Gift'}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Exp</Text>
            <Text style={styles.cardValue}>
              {item.unlock_date ? new Date(item.unlock_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' }) : '09/29'}
            </Text>
          </View>
        </View>
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Dark Header Background with Curve */}
      <View style={styles.headerBackground} />

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
            <TouchableOpacity style={styles.bellButton}>
              <Bell color="#fff" size={20} />
            </TouchableOpacity>
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

          {/* Cards Stack */}
          <View style={styles.cardStackContainer}>
            <SwipeableCardStack
              data={vloos.length > 0 ? vloos : [{ id: 'mock', cards: [{ id: '2781 8191 6671 3190' }], unlock_date: new Date().toISOString() }]}
              renderItem={renderCard}
              onIndexChange={setCurrentCardIndex}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('GiverCreate')}>
              <Text style={styles.actionText}>Add</Text>
              <View style={styles.actionIconCircle}>
                <Plus size={16} color={COLORS.accent} strokeWidth={3} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Send</Text>
              <View style={styles.actionIconCircle}>
                <Send size={16} color={COLORS.accent} strokeWidth={3} />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Pay</Text>
              <View style={styles.actionIconCircle}>
                <Wallet size={16} color={COLORS.accent} strokeWidth={3} />
              </View>
            </TouchableOpacity>
          </View>


          {/* Card Detail */}
          <View style={[styles.section, { paddingBottom: 100 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Card Detail</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Show</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Receiver Name</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>
                  {vloos.length > 0 && vloos[currentCardIndex]?.receiver_name ? vloos[currentCardIndex].receiver_name : 'VLOO Gift'}
                </Text>
                <Copy size={16} color={COLORS.accent} style={{ marginLeft: 8 }} />
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Message</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="tail">
                  {vloos.length > 0 && vloos[currentCardIndex]?.message ? vloos[currentCardIndex].message : 'No message'}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Unlock Date</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>
                  {vloos.length > 0 && vloos[currentCardIndex]?.unlock_date 
                    ? new Date(vloos[currentCardIndex].unlock_date).toLocaleDateString() 
                    : new Date().toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={styles.detailValueContainer}>
                <Text style={[
                  styles.detailValue, 
                  { 
                    color: vloos.length > 0 && vloos[currentCardIndex]?.status === 'claimed' ? COLORS.success : 
                           vloos.length > 0 && vloos[currentCardIndex]?.status === 'ready' ? COLORS.accent : '#888'
                  }
                ]}>
                  {vloos.length > 0 && vloos[currentCardIndex]?.status 
                    ? vloos[currentCardIndex].status.charAt(0).toUpperCase() + vloos[currentCardIndex].status.slice(1) 
                    : 'Draft'}
                </Text>
              </View>
            </View>
          </View>

        </SafeAreaView>
      </ScrollView>

      {/* Floating Bottom Navigation */}
      <View style={styles.bottomNavContainer}>
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItemActive}>
            <View style={[styles.navIconActive, { backgroundColor: COLORS.primary }]}>
              <Home size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <BarChart2 size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <CreditCard size={20} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <Grid size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 320, // Covers header and part of card
    backgroundColor: '#1A1A1A',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  safeArea: {
    paddingHorizontal: 24,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
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
  bellButton: {
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
    top: 70, // Below header
    left: 24, // Aligned with padding
    width: 200,
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
    width: '100%',
    height: 220,
    borderRadius: 24,
    padding: 24,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
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
  cardNumber: {
    fontFamily: FONTS.displayBold,
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
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

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    borderRadius: 100,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  actionText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
  },
  actionIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(209, 153, 249, 0.1)', // Accent with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 18,
    color: '#fff',
  },
  seeAllText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.accent,
  },

  // Detail Row
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  detailLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#888',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 14,
    color: '#fff',
    flexShrink: 1,
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
    backgroundColor: '#1A1A1A',
    padding: 8,
    borderRadius: 32,
    gap: 8,
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
});