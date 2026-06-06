import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';
import { AgentMode } from '../types';

const MODE_LABELS: Record<AgentMode, string> = {
  TREND_SCAN: 'Trend Scan',
  PRICE_REVIEW: 'Price Review',
  ROI_CHECK: 'ROI Check',
};

const MODE_COLORS: Record<AgentMode, string> = {
  TREND_SCAN: Colors.modeTrendScan,
  PRICE_REVIEW: Colors.modePriceReview,
  ROI_CHECK: Colors.modeROICheck,
};

interface OutputCardProps {
  mode: AgentMode;
  timestamp: string;
  preview: string;
  onPress: () => void;
  onDelete: () => void;
}

export function OutputCard({ mode, timestamp, preview, onPress, onDelete }: OutputCardProps) {
  const color = MODE_COLORS[mode];
  const label = MODE_LABELS[mode];
  const date = new Date(timestamp).toLocaleString('en-MY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
        <Text style={styles.timestamp}>{date}</Text>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
          <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.preview} numberOfLines={2}>
        {preview}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timestamp: {
    flex: 1,
    fontSize: FontSizes.caption,
    color: Colors.textMuted,
  },
  deleteButton: {
    padding: 2,
  },
  preview: {
    fontSize: FontSizes.secondary,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
