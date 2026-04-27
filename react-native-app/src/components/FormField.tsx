import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from 'react-native';
import { LightTheme as C, Spacing, Radius } from '../theme';

type FieldType = 'text' | 'number' | 'email' | 'phone' | 'date' | 'currency' | 'select' | 'toggle' | 'textarea';

type Props = {
  label: string;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  prefix?: string;
};

export default function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  options,
  prefix,
}: Props) {
  if (type === 'toggle') {
    return (
      <View style={styles.toggleRow}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <Switch
          value={Boolean(value)}
          onValueChange={(v) => onChange(v)}
          trackColor={{ false: C.surface2, true: C.accent }}
          thumbColor="#fff"
        />
      </View>
    );
  }

  if (type === 'select' && options) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.selectWrap}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.selectOption, value === opt.value && styles.selectActive]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.selectText, value === opt.value && styles.selectTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  const keyboardType =
    type === 'number' || type === 'currency' ? 'decimal-pad' :
    type === 'email' ? 'email-address' :
    type === 'phone' ? 'phone-pad' :
    'default';

  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <View style={styles.inputWrap}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[styles.input, prefix && styles.inputWithPrefix, type === 'textarea' && styles.textarea]}
          value={String(value || '')}
          onChangeText={(v) => onChange(v)}
          placeholder={placeholder}
          placeholderTextColor={C.text3}
          keyboardType={keyboardType}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoCorrect={type !== 'email' && type !== 'phone'}
          multiline={type === 'textarea'}
          numberOfLines={type === 'textarea' ? 4 : 1}
          textAlignVertical={type === 'textarea' ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '500', color: C.text2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  required: { color: C.red },
  inputWrap: { flexDirection: 'row', alignItems: 'center' },
  prefix: { fontSize: 16, color: C.text2, marginRight: 4 },
  input: {
    flex: 1,
    backgroundColor: C.surface2,
    borderRadius: Radius.sm,
    padding: 14,
    fontSize: 15,
    color: C.text,
  },
  inputWithPrefix: { paddingLeft: 8 },
  textarea: { minHeight: 100, paddingTop: 14 },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingVertical: 4,
  },
  selectWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    backgroundColor: C.surface2,
  },
  selectActive: { backgroundColor: C.accent },
  selectText: { fontSize: 14, color: C.text2 },
  selectTextActive: { color: '#fff', fontWeight: '500' },
});
