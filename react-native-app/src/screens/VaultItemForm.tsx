import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LightTheme as C, Spacing, Radius } from '../theme';
import { FormField, LoadingSpinner } from '../components';
import { FORM_DEFINITIONS } from '../utils/formDefinitions';
import { upsertUserData } from '../services/supabase';

type RouteParams = {
  category: string;
  label: string;
  color: string;
  itemId?: string;
  existingData?: Record<string, any>;
};

export default function VaultItemForm() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { category, label, color, itemId, existingData } = route.params as RouteParams;

  const isEditing = !!itemId;
  const fields = FORM_DEFINITIONS[category] || [];

  // Initialize form data from existing data or empty
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    if (existingData) return { ...existingData };
    const initial: Record<string, any> = {};
    for (const field of fields) {
      initial[field.key] = field.type === 'toggle' ? false : '';
    }
    return initial;
  });

  const [saving, setSaving] = useState(false);

  const handleChange = useCallback((key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(async () => {
    // Validate required fields
    const missingRequired = fields.filter(
      (f) => f.required && !formData[f.key] && formData[f.key] !== false
    );

    if (missingRequired.length > 0) {
      Alert.alert(
        'Missing Fields',
        `Please fill in: ${missingRequired.map((f) => f.label).join(', ')}`
      );
      return;
    }

    setSaving(true);
    try {
      await upsertUserData(category, formData, itemId);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [fields, formData, category, itemId, navigation]);

  const handleDiscard = useCallback(() => {
    // Check if form has been modified
    const hasChanges = fields.some((f) => {
      const original = existingData?.[f.key] ?? (f.type === 'toggle' ? false : '');
      return formData[f.key] !== original;
    });

    if (hasChanges) {
      Alert.alert('Discard Changes?', 'You have unsaved changes.', [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  }, [fields, formData, existingData, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEditing ? 'Edit' : 'Add'} {label.replace(/s$/, '')}
        </Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveText, { color }]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Color accent bar */}
      <View style={[styles.accentBar, { backgroundColor: color }]} />

      {/* Form */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.formContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {fields.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              value={formData[field.key] ?? ''}
              onChange={(v) => handleChange(field.key, v)}
              type={field.type}
              placeholder={field.placeholder}
              required={field.required}
              options={field.options}
              prefix={field.prefix}
            />
          ))}

          {/* Delete button for existing items */}
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                Alert.alert(
                  'Delete Item',
                  'Are you sure? This cannot be undone.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const { deleteUserData: del } = await import('../services/supabase');
                          await del(itemId!);
                          navigation.goBack();
                        } catch {
                          Alert.alert('Error', 'Failed to delete.');
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.deleteText}>Delete this {label.replace(/s$/, '').toLowerCase()}</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Saving overlay */}
      {saving && (
        <View style={styles.savingOverlay}>
          <LoadingSpinner message="Saving..." />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  cancelText: { fontSize: 16, color: C.text2 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: C.text, flex: 1, textAlign: 'center', marginHorizontal: Spacing.sm },
  saveText: { fontSize: 16, fontWeight: '600' },

  accentBar: { height: 3 },

  formContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
  },

  deleteBtn: {
    marginTop: Spacing.xl,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: C.red,
  },
  deleteText: { color: C.red, fontSize: 15, fontWeight: '500' },

  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
