import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';

interface Field {
  key: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'numeric';
  prefix?: string;
}

interface InputFormProps {
  fields: Field[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitColor: string;
  disabled?: boolean;
}

// Each line is ~22px tall. Add vertical padding so the last line is never clipped.
function multilineHeight(lines: number | undefined) {
  return Math.max(88, (lines ?? 4) * 22 + 24);
}

export function InputForm({
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel,
  submitColor,
  disabled = false,
}: InputFormProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {fields.map((field) => (
          <View key={field.key} style={styles.fieldGroup}>
            <Text style={styles.label}>{field.label}</Text>

            <View style={[styles.inputWrapper, field.prefix ? styles.prefixRow : null]}>
              {field.prefix ? (
                <Text style={styles.prefix}>{field.prefix}</Text>
              ) : null}

              <TextInput
                style={[
                  styles.input,
                  field.multiline
                    ? { minHeight: multilineHeight(field.numberOfLines), paddingTop: 10 }
                    : null,
                  field.prefix ? styles.prefixInput : null,
                  disabled ? styles.inputDisabled : null,
                ]}
                value={values[field.key] ?? field.defaultValue ?? ''}
                onChangeText={(v) => onChange(field.key, v)}
                placeholder={field.placeholder}
                placeholderTextColor={Colors.textMuted}
                multiline={field.multiline}
                // numberOfLines controls visible rows on native only; height is set above
                numberOfLines={field.numberOfLines}
                keyboardType={field.keyboardType ?? 'default'}
                editable={!disabled}
                textAlignVertical={field.multiline ? 'top' : 'center'}
                scrollEnabled={field.multiline}
              />
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: submitColor },
            disabled ? styles.submitDisabled : null,
          ]}
          onPress={onSubmit}
          disabled={disabled}
          activeOpacity={0.85}
        >
          <Text style={styles.submitLabel}>{submitLabel}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWarm,
  },
  scrollView: {
    flex: 1,
  },
  scroll: {
    padding: Spacing.sm,
    gap: 4,
    paddingBottom: Spacing.md,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: FontSizes.secondary,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prefixRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefix: {
    paddingLeft: 12,
    fontSize: FontSizes.body,
    color: Colors.textSecondary,
    fontWeight: FontWeights.semiBold,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.body,
    color: Colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    lineHeight: 22,
  },
  prefixInput: {
    paddingLeft: 4,
  },
  inputDisabled: {
    color: Colors.textMuted,
    backgroundColor: Colors.offWhite,
  },
  // ── Submit button — pill style like Recode's Generate button ────────────────
  submitButton: {
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitLabel: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.bold,
    color: Colors.white,
    letterSpacing: 0.3,
  },
});
