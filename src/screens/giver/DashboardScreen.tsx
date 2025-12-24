
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, BackHandler, Dimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { COLORS, FONTS } from '../../lib/theme';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Plus, LogOut, Gift, Clock, Lock, Unlock } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  };

  const fetchVloos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
         console.log('No session found in Dashboard, redirecting to Login...');
         setVloos([]);
         navigation.replace('GiverLogin');
         return;
      }
      
      const { data, error } = await supabase
        .from('vloos')
        .select('*')
        .eq('giver_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVloos(data || []);
    } catch (error) {
      console.error('Error fetching vloos:', error);
      // Fallback/Mock data for demonstration if DB is empty or fails
      // setVloos([]); 
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchVloos();

      const onBackPress = () => {
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchVloos();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const renderItem = ({ item }: any) => {
    const isLocked = new Date(item.unlock_date) > new Date();
    
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        // onPress={() => navigation.navigate('VlooDetails', { id: item.id })} // Future detail view
      >
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBg}>
              <Gift size={20} color={COLORS.primary} />
            </View>
            <View style={styles.statusBadge}>
              {isLocked ? (
                <Lock size={14} color={COLORS.foreground} style={{ opacity: 0.6 }} />
              ) : (
                <Unlock size={14} color={COLORS.primary} />
              )}
              <Text style={styles.statusText}>{item.status || (isLocked ? 'Locked' : 'Unlocked')}</Text>
            </View>
          </View>

          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.message || 'Untitled VLOO'}
          </Text>
          
          <View style={styles.cardFooter}>
            <View style={styles.dateContainer}>
              <Clock size={14} color={COLORS.foreground} style={{ opacity: 0.5, marginRight: 6 }} />
              <Text style={styles.dateText}>
                {new Date(item.unlock_date).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.amountText}>
              {/* Placeholder for amount if we had it */}
              Manage
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My VLOOs</Text>
          <Text style={styles.headerSubtitle}>Manage your crypto gifts</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut color={COLORS.error} size={24} />
        </TouchableOpacity>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total VLOOs</Text>
          <Text style={styles.summaryValue}>{vloos.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Claimed</Text>
          <Text style={styles.summaryValue}>
            {vloos.filter(v => v.status === 'claimed').length}
          </Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Unclaimed</Text>
          <Text style={styles.summaryValue}>
            {vloos.filter(v => v.status !== 'claimed').length}
          </Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <View style={styles.deckContainer}>
          <View style={styles.listContainer}>
            <FlatList
              data={vloos}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CARD_WIDTH + 20} // Card width + margin
              decelerationRate="fast"
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              ListEmptyComponent={
                <View style={[styles.emptyState, { width: width - 48 }]}>
                  <Gift size={64} color={COLORS.primary} style={{ opacity: 0.3, marginBottom: 20 }} />
                  <Text style={styles.emptyText}>You haven't created any VLOOs yet.</Text>
                  <Button 
                    title="Create your first VLOO" 
                    onPress={() => navigation.navigate('GiverCreate')}
                    variant="primary"
                    style={{ marginTop: 20 }}
                  />
                </View>
              }
            />
          </View>

          {/* Address Display - Now directly under the cards */}
          {vloos.length > 0 && vloos[activeIndex] && (
            <View style={styles.addressContainer}>
               <Text style={styles.addressLabel}>Card Wallet Address</Text>
               <View style={styles.addressBox}>
                 <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="middle">
                   {vloos[activeIndex].wallet_address || 'No address provided'}
                 </Text>
               </View>
            </View>
          )}
        </View>
      )}

      {vloos.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.navigate('GiverCreate')}
        >
          <Plus color={COLORS.inverse} size={32} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.background, // Ensure header is opaque if needed
    zIndex: 10,
  },
  headerTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 28,
    color: COLORS.foreground,
  },
  headerSubtitle: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: COLORS.foreground,
    opacity: 0.6,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    borderRadius: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: CARD_SPACING, // Center the first item
    paddingVertical: 40,
    gap: 20, // Space between cards
    alignItems: 'center', // Vertically center cards
  },
  card: {
    padding: 16,
    width: CARD_WIDTH,
    // Add some elevation/shadow for better separation in horizontal view
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(11, 28, 196, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 6,
  },
  statusText: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.foreground,
    textTransform: 'capitalize',
  },
  cardTitle: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 18,
    color: COLORS.foreground,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.foreground,
    opacity: 0.6,
  },
  amountText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 12,
    color: COLORS.primary,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: COLORS.foreground,
    textAlign: 'center',
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: COLORS.foreground,
    opacity: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: FONTS.displaySemiBold,
    fontSize: 20,
    color: COLORS.foreground,
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  deckContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  listContainer: {
    // Container for the list to ensure it doesn't take up more space than needed if we want address visible
    // But since it's a deck, we might want it centered or fixed height?
    // Let's give it a minHeight to ensure cards fit
    minHeight: 250,
  },
  addressContainer: {
    marginTop: 20,
    marginHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 100, // Space for FAB
  },
  addressLabel: {
    fontFamily: FONTS.bodySemiBold,
    fontSize: 12,
    color: COLORS.foreground,
    opacity: 0.5,
    marginBottom: 8,
  },
  addressBox: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    width: '100%',
  },
  addressText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 13,
    color: COLORS.foreground,
    textAlign: 'center',
  },
});
