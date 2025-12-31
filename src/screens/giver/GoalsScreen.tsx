import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  StatusBar, 
  FlatList, 
  TouchableOpacity 
} from 'react-native';
import { COLORS, FONTS } from '../../lib/theme';
import { Target, Plus, TrendingUp, Calendar } from 'lucide-react-native';
import { CreateGoalModal } from './components/modals/CreateGoalModal';

interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  deadline?: string;
}

export const GoalsScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Trip to Japan', currentAmount: 1250, targetAmount: 5000, deadline: '2024-12-31' },
    { id: '2', title: 'New Laptop', currentAmount: 800, targetAmount: 2000, deadline: '2024-06-15' },
  ]);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateGoal = (newGoal: { title: string; targetAmount: string; deadline: string }) => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      currentAmount: 0,
      targetAmount: parseFloat(newGoal.targetAmount),
      deadline: newGoal.deadline
    };
    setGoals([...goals, goal]);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const renderGoalItem = ({ item }: { item: Goal }) => {
    const progress = calculateProgress(item.currentAmount, item.targetAmount);
    
    return (
      <TouchableOpacity style={styles.goalCard}>
        <View style={styles.goalHeader}>
          <View style={styles.goalIcon}>
            <Target size={20} color={COLORS.primary} />
          </View>
          <View style={styles.goalInfo}>
            <Text style={styles.goalTitle}>{item.title}</Text>
            {item.deadline && (
              <View style={styles.deadlineRow}>
                <Calendar size={12} color="#666" />
                <Text style={styles.deadlineText}>{item.deadline}</Text>
              </View>
            )}
          </View>
          <Text style={styles.percentageText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.amountRow}>
          <Text style={styles.currentAmount}>${item.currentAmount.toLocaleString()}</Text>
          <Text style={styles.targetAmount}> / ${item.targetAmount.toLocaleString()}</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Total Saved</Text>
          <Text style={styles.summaryAmount}>
            ${goals.reduce((acc, goal) => acc + goal.currentAmount, 0).toLocaleString()}
          </Text>
          <Text style={styles.summarySubtext}>
            Across {goals.length} active goals
          </Text>
        </View>
        <View style={styles.summaryIcon}>
          <TrendingUp size={32} color="#fff" />
        </View>
      </View>
      <Text style={styles.sectionTitle}>Your Goals</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      <FlatList
        data={goals}
        renderItem={renderGoalItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Target size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No goals yet. Start saving today!</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color="#fff" />
      </TouchableOpacity>

      <CreateGoalModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreateGoal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 24,
    paddingBottom: 100, // Space for FAB and Bottom Nav
  },
  headerContainer: {
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontFamily: FONTS.displayBold,
    fontSize: 32,
    color: '#fff',
    marginBottom: 4,
  },
  summarySubtext: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  summaryIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: FONTS.displayBold,
    fontSize: 20,
    color: '#000',
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 16,
    color: '#000',
    marginBottom: 2,
  },
  deadlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deadlineText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  percentageText: {
    fontFamily: FONTS.bodyBold,
    fontSize: 14,
    color: COLORS.primary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  currentAmount: {
    fontFamily: FONTS.bodyBold,
    fontSize: 20,
    color: '#000',
  },
  targetAmount: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 14,
    color: '#999',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontFamily: FONTS.bodyRegular,
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom nav
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
