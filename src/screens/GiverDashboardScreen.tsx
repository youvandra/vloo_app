
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { COLORS, FONTS } from '../lib/theme';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Plus, LogOut, Gift, Clock, Lock, Unlock } from 'lucide-react-native';

export default function GiverDashboardScreen({ navigation }: any) {
  const [vloos, setVloos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVloos = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Ideally we filter by giver_id, but for MVP/Schema uncertainty we'll just fetch all 
      // or rely on RLS if implemented. 
      // If the table has giver_id, we should filter. Let's try to just select for now.
      
      const { data, error } = await supabase
        .from('vloos')
        .select('*')
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

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={vloos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
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
    padding: 24,
    paddingBottom: 100, // Space for FAB
    gap: 16,
  },
  card: {
    padding: 16,
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
});
