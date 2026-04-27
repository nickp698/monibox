import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LightTheme as C, Spacing, Radius, formatCurrency, getItemName, getItemValue, CATEGORIES } from '../theme';
import { EmptyState, LoadingSpinner } from '../components';
import { getUserData } from '../services/supabase';

type Holding = {
  id: string;
  category: string;
  data: any;
};

type PortfolioSection = {
  key: string;
  label: string;
  icon: string;
  color: string;
  items: Holding[];
  total: number;
};

const INVESTMENT_CATEGORIES = [
  { key: 'investment', label: 'Investments', icon: '📈', color: '#2d5a3d' },
  { key: 'stock_holding', label: 'Stocks', icon: '📊', color: '#1e7e4a' },
  { key: 'crypto_holding', label: 'Crypto', icon: '₿', color: '#f7931a' },
  { key: 'bond_holding', label: 'Bonds', icon: '📜', color: '#4a6e8a' },
  { key: 'pension', label: 'Pensions', icon: '🏛', color: '#5a3d8a' },
];

export default function InvestmentsScreen() {
  const navigation = useNavigation<any>();
  const [sections, setSections] = useState<PortfolioSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPortfolio = useCallback(async () => {
    try {
      const results = await Promise.allSettled(
        INVESTMENT_CATEGORIES.map(async (cat) => {
          const items = await getUserData(cat.key);
          const total = items.reduce((sum: number, item: any) => {
            return sum + getItemValue(cat.key as any, item.data);
          }, 0);
          return { ...cat, items, total } as PortfolioSection;
        })
      );

      const loaded = results
        .filter((r): r is PromiseFulfilledResult<PortfolioSection> => r.status === 'fulfilled')
        .map((r) => r.value);

      setSections(loaded);
    } catch (err) {
      console.error('Failed to load portfolio:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPortfolio();
    }, [loadPortfolio])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPortfolio();
    setRefreshing(false);
  }, [loadPortfolio]);

  const totalPortfolio = sections.reduce((sum, s) => sum + s.total, 0);
  const totalHoldings = sections.reduce((sum, s) => sum + s.items.length, 0);

  // Calculate invested amount for gain/loss
  const totalInvested = sections.reduce((sum, s) => {
    return sum + s.items.reduce((iSum: number, item: any) => {
      const d = item.data;
      const invested = parseFloat(
        d?.invested || d?.avg_price && d?.shares
          ? (parseFloat(d.avg_price || '0') * parseFloat(d.shares || '0')).toString()
          : d?.avg_buy_price && d?.quantity
            ? (parseFloat(d.avg_buy_price || '0') * parseFloat(d.quantity || '0')).toString()
            : '0'
      );
      return iSum + invested;
    }, 0);
  }, 0);

  const gain = totalInvested > 0 ? totalPortfolio - totalInvested : 0;
  const gainPct = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner fullScreen message="Loading portfolio..." />
      </SafeAreaView>
    );
  }

  if (totalHoldings === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Investments</Text>
          <Text style={styles.subtitle}>Portfolio overview</Text>
        </View>
        <EmptyState
          icon="📈"
          title="No investments yet"
          message="Add stocks, crypto, bonds, or other investments to track your portfolio"
          actionLabel="Go to Vault"
          onAction={() => navigation.navigate('Vault')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investments</Text>
          <Text style={styles.subtitle}>{totalHoldings} holdings across {sections.filter(s => s.items.length > 0).length} categories</Text>
        </View>

        {/* Portfolio value card */}
        <View style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>{formatCurrency(totalPortfolio)}</Text>
          {totalInvested > 0 && (
            <View style={styles.gainRow}>
              <Text style={[styles.gainText, { color: gain >= 0 ? '#27ae60' : '#e74c3c' }]}>
                {gain >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(gain))} ({gainPct >= 0 ? '+' : ''}{gainPct.toFixed(1)}%)
              </Text>
              <Text style={styles.gainSub}>total return</Text>
            </View>
          )}
        </View>

        {/* Allocation bars */}
        <View style={styles.allocationCard}>
          <Text style={styles.sectionTitle}>Allocation</Text>
          {sections
            .filter((s) => s.total > 0)
            .sort((a, b) => b.total - a.total)
            .map((section) => {
              const pct = totalPortfolio > 0 ? (section.total / totalPortfolio) * 100 : 0;
              return (
                <View key={section.key} style={styles.allocRow}>
                  <View style={styles.allocLabelWrap}>
                    <Text style={styles.allocIcon}>{section.icon}</Text>
                    <Text style={styles.allocLabel}>{section.label}</Text>
                  </View>
                  <View style={styles.allocBarWrap}>
                    <View
                      style={[styles.allocBar, { width: `${Math.max(pct, 2)}%`, backgroundColor: section.color }]}
                    />
                  </View>
                  <View style={styles.allocValues}>
                    <Text style={styles.allocPct}>{pct.toFixed(1)}%</Text>
                    <Text style={styles.allocAmount}>{formatCurrency(section.total)}</Text>
                  </View>
                </View>
              );
            })}
        </View>

        {/* Holdings by category */}
        {sections
          .filter((s) => s.items.length > 0)
          .map((section) => (
            <View key={section.key} style={styles.holdingSection}>
              <View style={styles.holdingHeader}>
                <Text style={styles.holdingIcon}>{section.icon}</Text>
                <Text style={styles.holdingSectionTitle}>{section.label}</Text>
                <Text style={[styles.holdingSectionTotal, { color: section.color }]}>
                  {formatCurrency(section.total)}
                </Text>
              </View>

              {section.items.map((item) => {
                const name = getItemName(section.key as any, item.data);
                const value = getItemValue(section.key as any, item.data);
                const sub =
                  item.data?.ticker ||
                  item.data?.symbol ||
                  item.data?.provider ||
                  item.data?.investment_type ||
                  item.data?.pension_type ||
                  '';

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.holdingRow}
                    onPress={() =>
                      navigation.navigate('Vault', {
                        screen: 'VaultItemForm',
                        params: {
                          category: section.key,
                          label: section.label,
                          color: section.color,
                          itemId: item.id,
                          existingData: item.data,
                        },
                      })
                    }
                    activeOpacity={0.7}
                  >
                    <View style={styles.holdingInfo}>
                      <Text style={styles.holdingName} numberOfLines={1}>{name}</Text>
                      {sub ? <Text style={styles.holdingSub} numberOfLines={1}>{sub}</Text> : null}
                    </View>
                    {value > 0 && (
                      <Text style={styles.holdingValue}>{formatCurrency(value)}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

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

  portfolioCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: '#1a2e23',
    borderRadius: Radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  portfolioLabel: { fontSize: 13, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },
  portfolioValue: { fontSize: 32, fontWeight: '300', color: '#fff', marginTop: 8 },
  gainRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  gainText: { fontSize: 15, fontWeight: '600' },
  gainSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },

  allocationCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: Spacing.md },
  allocRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  allocLabelWrap: { flexDirection: 'row', alignItems: 'center', width: 100 },
  allocIcon: { fontSize: 16, marginRight: 6 },
  allocLabel: { fontSize: 13, color: C.text2, flex: 1 },
  allocBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: C.surface2,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  allocBar: { height: '100%', borderRadius: 4 },
  allocValues: { width: 90, alignItems: 'flex-end' },
  allocPct: { fontSize: 12, fontWeight: '600', color: C.text },
  allocAmount: { fontSize: 11, color: C.text3 },

  holdingSection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  holdingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  holdingIcon: { fontSize: 20, marginRight: 8 },
  holdingSectionTitle: { fontSize: 15, fontWeight: '600', color: C.text, flex: 1 },
  holdingSectionTotal: { fontSize: 15, fontWeight: '600' },

  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  holdingInfo: { flex: 1, marginRight: Spacing.md },
  holdingName: { fontSize: 15, fontWeight: '500', color: C.text },
  holdingSub: { fontSize: 12, color: C.text3, marginTop: 2 },
  holdingValue: { fontSize: 15, fontWeight: '600', color: C.text },
});
