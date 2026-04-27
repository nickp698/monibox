import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { calculateNetWorth, getUserData } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { LightTheme as C, Spacing, Radius, CATEGORIES, formatCurrency, getItemValue } from '../theme';
import { CategoryCard } from '../components';
import type { CategoryKey } from '../theme';

type CategoryCounts = Record<string, { count: number; total: number }>;

const GROUPS = [
  { key: 'assets', label: 'Assets' },
  { key: 'liabilities', label: 'Liabilities' },
  { key: 'lifestyle', label: 'Lifestyle' },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [netWorth, setNetWorth] = useState({ assets: 0, liabilities: 0, netWorth: 0 });
  const [counts, setCounts] = useState<CategoryCounts>({});
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [nw, ...catResults] = await Promise.all([
        calculateNetWorth(),
        ...Object.keys(CATEGORIES).map(async (cat) => {
          const items = await getUserData(cat);
          const total = items.reduce((sum: number, item: any) => {
            return sum + getItemValue(cat as CategoryKey, item.data);
          }, 0);
          return { cat, count: items.length, total };
        }),
      ]);

      setNetWorth(nw);

      const newCounts: CategoryCounts = {};
      for (const result of catResults) {
        newCounts[result.cat] = { count: result.count, total: result.total };
      }
      setCounts(newCounts);
    } catch (e) {
      console.error('Failed to load dashboard:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there';

  // Get greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const navigateToCategory = (key: string) => {
    const cat = CATEGORIES[key as CategoryKey];
    navigation.navigate('Vault', {
      screen: 'VaultCategory',
      params: {
        category: key,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.greeting}>{greeting}, {firstName}</Text>

        {/* Net Worth Card */}
        <View style={styles.netWorthCard}>
          <Text style={styles.netWorthLabel}>Net Worth</Text>
          <Text style={styles.netWorthValue}>{formatCurrency(netWorth.netWorth)}</Text>
          <View style={styles.netWorthRow}>
            <View style={styles.netWorthCol}>
              <Text style={styles.nwSubLabel}>Assets</Text>
              <Text style={[styles.nwSubValue, { color: '#4a9d6e' }]}>
                {formatCurrency(netWorth.assets)}
              </Text>
            </View>
            <View style={styles.netWorthCol}>
              <Text style={styles.nwSubLabel}>Liabilities</Text>
              <Text style={[styles.nwSubValue, { color: '#e74c3c' }]}>
                {formatCurrency(netWorth.liabilities)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category grids by group */}
        {GROUPS.map((group) => {
          const cats = (Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][])
            .filter(([_, cat]) => cat.group === group.key)
            .filter(([key]) => (counts[key]?.count || 0) > 0 || group.key !== 'lifestyle');

          if (cats.length === 0) return null;

          return (
            <View key={group.key}>
              <Text style={styles.sectionTitle}>{group.label}</Text>
              <View style={styles.grid}>
                {cats.map(([key, cat]) => (
                  <CategoryCard
                    key={key}
                    icon={cat.icon}
                    label={cat.label}
                    count={counts[key]?.count || 0}
                    totalValue={counts[key]?.total}
                    color={cat.color}
                    onPress={() => navigateToCategory(key)}
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: Spacing.lg },
  greeting: { fontSize: 26, fontWeight: '300', color: C.text, marginBottom: Spacing.lg },
  netWorthCard: {
    backgroundColor: '#1a2e23',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  netWorthLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  netWorthValue: { color: '#fff', fontSize: 36, fontWeight: '300', marginVertical: Spacing.sm },
  netWorthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Spacing.md },
  netWorthCol: { flex: 1 },
  nwSubLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  nwSubValue: { fontSize: 18, fontWeight: '500', marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
});
