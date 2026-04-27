import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LightTheme as C, Spacing, Radius, CATEGORIES, formatCurrency, getItemValue } from '../theme';
import { CategoryCard } from '../components';
import { getUserData } from '../services/supabase';
import type { CategoryKey } from '../theme';

type CategoryCounts = Record<string, { count: number; total: number }>;

const GROUPS = [
  { key: 'assets', label: 'Assets', color: '#2d5a3d' },
  { key: 'liabilities', label: 'Liabilities', color: '#c0392b' },
  { key: 'lifestyle', label: 'Lifestyle', color: '#5a3d8a' },
  { key: 'documents', label: 'Documents', color: '#2d3d5a' },
];

export default function VaultScreen() {
  const navigation = useNavigation<any>();
  const [counts, setCounts] = useState<CategoryCounts>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCounts = useCallback(async () => {
    try {
      const allCounts: CategoryCounts = {};
      const categories = Object.keys(CATEGORIES) as CategoryKey[];

      // Fetch all categories in parallel
      const results = await Promise.allSettled(
        categories.map(async (cat) => {
          const items = await getUserData(cat);
          const total = items.reduce((sum: number, item: any) => {
            return sum + getItemValue(cat, item.data);
          }, 0);
          return { cat, count: items.length, total };
        })
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const { cat, count, total } = result.value;
          allCounts[cat] = { count, total };
        }
      }

      setCounts(allCounts);
    } catch (err) {
      console.error('Failed to load vault counts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [loadCounts])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCounts();
    setRefreshing(false);
  }, [loadCounts]);

  const filteredCategories = (groupKey: string) => {
    return (Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][])
      .filter(([_, cat]) => cat.group === groupKey)
      .filter(([key, cat]) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return cat.label.toLowerCase().includes(s) || key.includes(s);
      });
  };

  const totalAssets = Object.entries(counts)
    .filter(([key]) => {
      const cat = CATEGORIES[key as CategoryKey];
      return cat?.group === 'assets';
    })
    .reduce((sum, [_, v]) => sum + v.total, 0);

  const totalLiabilities = Object.entries(counts)
    .filter(([key]) => {
      const cat = CATEGORIES[key as CategoryKey];
      return cat?.group === 'liabilities';
    })
    .reduce((sum, [_, v]) => sum + v.total, 0);

  const totalItems = Object.values(counts).reduce((sum, v) => sum + v.count, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Vault</Text>
        <Text style={styles.subtitle}>
          {totalItems} {totalItems === 1 ? 'item' : 'items'} across {Object.keys(CATEGORIES).length} categories
        </Text>
      </View>

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Assets</Text>
          <Text style={[styles.summaryValue, { color: '#2d5a3d' }]}>{formatCurrency(totalAssets)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Liabilities</Text>
          <Text style={[styles.summaryValue, { color: '#c0392b' }]}>{formatCurrency(totalLiabilities)}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Net</Text>
          <Text style={[styles.summaryValue, { color: C.text }]}>
            {formatCurrency(totalAssets - totalLiabilities)}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search categories..."
          placeholderTextColor={C.text3}
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Category grid by group */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {GROUPS.map((group) => {
          const cats = filteredCategories(group.key);
          if (cats.length === 0) return null;

          return (
            <View key={group.key} style={styles.group}>
              <Text style={[styles.groupLabel, { color: group.color }]}>{group.label}</Text>
              <View style={styles.grid}>
                {cats.map(([key, cat]) => (
                  <CategoryCard
                    key={key}
                    icon={cat.icon}
                    label={cat.label}
                    count={counts[key]?.count || 0}
                    totalValue={counts[key]?.total}
                    color={cat.color}
                    onPress={() =>
                      navigation.navigate('VaultCategory', {
                        category: key,
                        label: cat.label,
                        icon: cat.icon,
                        color: cat.color,
                      })
                    }
                  />
                ))}
              </View>
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },
  title: { fontSize: 26, fontWeight: '300', color: C.text },
  subtitle: { fontSize: 14, color: C.text2, marginTop: 4 },

  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: C.text3, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: '600' },
  summaryDivider: { width: 1, backgroundColor: C.border, marginVertical: 4 },

  searchWrap: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  searchInput: {
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
  },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md },

  group: { marginBottom: Spacing.lg },
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
