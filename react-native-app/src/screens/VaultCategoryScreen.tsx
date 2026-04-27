import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { LightTheme as C, Spacing, Radius, formatCurrency, getItemName, getItemValue } from '../theme';
import { SwipeableRow, EmptyState, LoadingSpinner } from '../components';
import { getUserData, deleteUserData } from '../services/supabase';
import type { CategoryKey } from '../theme';

type RouteParams = {
  category: CategoryKey;
  label: string;
  icon: string;
  color: string;
};

type VaultItem = {
  id: string;
  category: string;
  data: any;
  created_at: string;
  updated_at: string;
};

export default function VaultCategoryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, label, icon, color } = route.params as RouteParams;

  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await getUserData(category);
      setItems(data);
    } catch (err) {
      console.error(`Failed to load ${category}:`, err);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadItems();
    setRefreshing(false);
  }, [loadItems]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteUserData(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete item. Please try again.');
    }
  }, []);

  const handleEdit = useCallback(
    (item: VaultItem) => {
      navigation.navigate('VaultItemForm', {
        category,
        label,
        color,
        itemId: item.id,
        existingData: item.data,
      });
    },
    [navigation, category, label, color]
  );

  const handleAdd = useCallback(() => {
    navigation.navigate('VaultItemForm', {
      category,
      label,
      color,
    });
  }, [navigation, category, label, color]);

  const totalValue = items.reduce((sum, item) => {
    return sum + getItemValue(category, item.data);
  }, 0);

  const renderItem = ({ item }: { item: VaultItem }) => {
    const name = getItemName(category, item.data);
    const value = getItemValue(category, item.data);

    return (
      <SwipeableRow
        onEdit={() => handleEdit(item)}
        onDelete={() => handleDelete(item.id)}
        itemName={name}
      >
        <TouchableOpacity
          style={styles.itemRow}
          onPress={() => handleEdit(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={1}>{name}</Text>
            {item.data?.provider || item.data?.bank_name || item.data?.lender || item.data?.insurer ? (
              <Text style={styles.itemSub} numberOfLines={1}>
                {item.data.provider || item.data.bank_name || item.data.lender || item.data.insurer}
              </Text>
            ) : null}
          </View>
          {value > 0 && (
            <Text style={[styles.itemValue, { color }]}>{formatCurrency(value)}</Text>
          )}
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner fullScreen message={`Loading ${label}...`} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>{String.fromCharCode(8249)} Vault</Text>
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title}>{label}</Text>
        </View>
        {totalValue > 0 && (
          <Text style={[styles.totalValue, { color }]}>{formatCurrency(totalValue)}</Text>
        )}
        <Text style={styles.itemCount}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {/* Item list or empty state */}
      {items.length === 0 ? (
        <EmptyState
          icon={icon}
          title={`No ${label} yet`}
          message={`Add your first ${label.toLowerCase()} to start tracking`}
          actionLabel={`Add ${label.replace(/s$/, '')}`}
          onAction={handleAdd}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.accent} />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB - Add button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: color }]} onPress={handleAdd}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { marginBottom: Spacing.sm },
  backText: { fontSize: 16, color: C.accent, fontWeight: '500' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: { fontSize: 28 },
  title: { fontSize: 24, fontWeight: '300', color: C.text },
  totalValue: { fontSize: 20, fontWeight: '600', marginTop: Spacing.xs },
  itemCount: { fontSize: 13, color: C.text3, marginTop: 2 },

  list: { paddingBottom: 100 },
  separator: { height: 1, backgroundColor: C.border, marginLeft: Spacing.lg },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    backgroundColor: C.surface,
  },
  itemInfo: { flex: 1, marginRight: Spacing.md },
  itemName: { fontSize: 16, fontWeight: '500', color: C.text },
  itemSub: { fontSize: 13, color: C.text3, marginTop: 2 },
  itemValue: { fontSize: 16, fontWeight: '600' },

  fab: {
    position: 'absolute',
    bottom: 30,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', fontWeight: '300', marginTop: -2 },
});
