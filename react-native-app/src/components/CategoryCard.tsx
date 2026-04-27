import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LightTheme as C, Spacing, Radius, formatCurrency } from '../theme';

type Props = {
  icon: string;
  label: string;
  count: number;
  totalValue?: number;
  color: string;
  onPress: () => void;
};

export default function CategoryCard({ icon, label, count, totalValue, color, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
      <Text style={styles.count}>{count} {count === 1 ? 'item' : 'items'}</Text>
      {totalValue !== undefined && totalValue !== 0 && (
        <Text style={[styles.value, { color }]}>{formatCurrency(totalValue)}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    backgroundColor: C.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  icon: { fontSize: 20 },
  label: { fontSize: 14, fontWeight: '600', color: C.text, marginBottom: 2 },
  count: { fontSize: 12, color: C.text3 },
  value: { fontSize: 15, fontWeight: '600', marginTop: Spacing.xs },
});
