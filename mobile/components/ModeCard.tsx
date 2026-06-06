import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';
import { AgentMode } from '../types';

interface ModeCardProps {
  mode: AgentMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export function ModeCard({
  title,
  subtitle,
  description,
  icon,
  color,
  onPress,
}: ModeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}18` }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.subtitle, { color }]}>{subtitle}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  description: {
    fontSize: FontSizes.secondary,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
