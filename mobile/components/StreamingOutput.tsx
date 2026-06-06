import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ActivityIndicator,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Strips markdown syntax for plain-text export
function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/gs, '$1')
    .replace(/\*(.*?)\*/gs, '$1')
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```\w*\n?/g, '').replace(/```/g, '').trim())
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/^\|(.+)\|$/gm, (_, row) =>
      row.split('|').map((c: string) => c.trim()).filter(Boolean).join('  |  ')
    )
    .replace(/^\s*[-|:]+[-| :]*$/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/^\s*\d+\.\s+/gm, (m) => m.trim() + ' ')
    .replace(/^-{3,}$/gm, '─────────────────────')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function downloadWeb(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
import Markdown from 'react-native-markdown-display';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';
import { AgentStatus } from '../types';

interface StreamingOutputProps {
  output: string;
  status: AgentStatus;
  error: string | null;
  onRetry: () => void;
  badge?: string;
}

// Custom rule: wrap tables in a horizontal ScrollView so wide tables don't clip
const markdownRules = {
  table: (node: any, children: React.ReactNode[]) => (
    <ScrollView
      key={node.key}
      horizontal
      showsHorizontalScrollIndicator
      style={styles.tableScroll}
    >
      <View>{children}</View>
    </ScrollView>
  ),
};

function PulsingSkeleton() {
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <View style={styles.skeleton}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.skeletonText}>FreshKira Agent is thinking…</Text>
      <Animated.View style={[styles.skeletonBar, { opacity }]} />
      <Animated.View style={[styles.skeletonBar, styles.skeletonBarMid, { opacity }]} />
      <Animated.View style={[styles.skeletonBar, { opacity }]} />
      <Animated.View style={[styles.skeletonBar, styles.skeletonBarShort, { opacity }]} />
    </View>
  );
}

export function StreamingOutput({
  output,
  status,
  error,
  onRetry,
  badge,
}: StreamingOutputProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(output);
  };

  const handleShare = async () => {
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text: output }).catch(() => {});
      } else {
        await Clipboard.setStringAsync(output);
      }
    } else {
      await Share.share({ message: output });
    }
  };

  const handleExportMd = async () => {
    const filename = `freshkira-report-${Date.now()}.md`;
    if (Platform.OS === 'web') {
      downloadWeb(output, filename, 'text/markdown');
    } else {
      await Share.share({ title: filename, message: output });
    }
  };

  const handleExportTxt = async () => {
    const filename = `freshkira-report-${Date.now()}.txt`;
    const plain = stripMarkdown(output);
    if (Platform.OS === 'web') {
      downloadWeb(plain, filename, 'text/plain');
    } else {
      await Share.share({ title: filename, message: plain });
    }
  };

  // ── Idle ──────────────────────────────────────────────────────────────────
  if (status === 'idle') {
    return (
      <View style={styles.centred}>
        <Ionicons name="sparkles-outline" size={36} color={Colors.textMuted} />
        <Text style={styles.placeholderText}>
          Configure the form and tap Run to generate your AI report.
        </Text>
      </View>
    );
  }

  // ── Loading (before first token) ──────────────────────────────────────────
  if (status === 'loading') {
    return <PulsingSkeleton />;
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <View style={styles.centred}>
        <Ionicons name="alert-circle-outline" size={36} color={Colors.danger} />
        <Text style={styles.errorText}>{error ?? 'An unexpected error occurred.'}</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={onRetry}>
          <Text style={styles.dangerButtonLabel}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Streaming / Done ──────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : (
          <View />
        )}

        {status === 'done' ? (
          <View style={styles.toolbarActions}>
            <TouchableOpacity onPress={handleCopy} style={styles.iconButton} hitSlop={HIT_SLOP}>
              <Ionicons name="copy-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.iconButton} hitSlop={HIT_SLOP}>
              <Ionicons name="share-outline" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>

      {/* Output content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Markdown style={markdownStyles} rules={markdownRules}>
          {output}
        </Markdown>

        {status === 'streaming' && (
          <View style={styles.streamingCursor}>
            <View style={styles.cursor} />
          </View>
        )}
      </ScrollView>

      {/* Bottom action bar — only when done */}
      {status === 'done' && (
        <View style={styles.bottomBar}>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportButton} onPress={handleExportMd} activeOpacity={0.8}>
              <Ionicons name="document-text-outline" size={14} color={Colors.primary} />
              <Text style={styles.exportLabel}>Export .md</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportButton, styles.exportButtonSecondary]} onPress={handleExportTxt} activeOpacity={0.8}>
              <Ionicons name="document-outline" size={14} color={Colors.textSecondary} />
              <Text style={[styles.exportLabel, styles.exportLabelSecondary]}>Export .txt</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.newRunButton} onPress={onRetry}>
            <Ionicons name="refresh-outline" size={16} color={Colors.white} />
            <Text style={styles.newRunLabel}>New Run</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 };

const markdownStyles: Record<string, object> = {
  body: {
    color: Colors.textPrimary,
    fontSize: FontSizes.body,
    lineHeight: 26,
  },
  heading1: {
    fontSize: FontSizes.screenTitle,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heading2: {
    fontSize: FontSizes.sectionHeader,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: 18,
    marginBottom: 8,
  },
  heading3: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginTop: 12,
    marginBottom: 4,
  },
  hr: {
    borderBottomColor: Colors.border,
    borderBottomWidth: 1,
    marginVertical: 12,
  },
  // Tables — rows/cells styled; the table node itself is overridden by the rule
  tr: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  th: {
    flex: 1,
    padding: 8,
    backgroundColor: Colors.primaryLight,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.secondary,
    color: Colors.primary,
  },
  td: {
    flex: 1,
    padding: 8,
    fontSize: FontSizes.secondary,
    color: Colors.textPrimary,
  },
  code_block: {
    backgroundColor: Colors.offWhite,
    padding: 12,
    borderRadius: BorderRadius.button,
    fontFamily: 'monospace',
    fontSize: FontSizes.secondary,
    color: Colors.textPrimary,
    marginVertical: 8,
  },
  code_inline: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: FontSizes.secondary,
  },
  blockquote: {
    backgroundColor: Colors.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  bullet_list: { marginVertical: 6 },
  ordered_list: { marginVertical: 6 },
  list_item: { marginVertical: 3 },
  strong: { fontWeight: FontWeights.bold },
  em: { fontStyle: 'italic' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.offWhite,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.pill,
  },
  badgeText: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semiBold,
    color: Colors.primary,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  tableScroll: {
    marginVertical: 8,
  },
  streamingCursor: {
    marginTop: 4,
    height: 20,
    justifyContent: 'center',
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: Colors.primary,
    borderRadius: 1,
    opacity: 0.8,
  },
  bottomBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.offWhite,
  },
  exportRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    borderRadius: BorderRadius.button,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  exportButtonSecondary: {
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  exportLabel: {
    fontSize: FontSizes.secondary,
    fontWeight: FontWeights.semiBold,
    color: Colors.primary,
  },
  exportLabelSecondary: {
    color: Colors.textSecondary,
  },
  newRunButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.button,
    paddingVertical: 12,
  },
  newRunLabel: {
    color: Colors.white,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.secondary,
  },
  // ── States ─────────────────────────────────────────────────────────────────
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: 12,
  },
  placeholderText: {
    fontSize: FontSizes.secondary,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 260,
  },
  skeleton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: 14,
  },
  skeletonText: {
    fontSize: FontSizes.secondary,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  skeletonBar: {
    height: 14,
    backgroundColor: Colors.border,
    borderRadius: 7,
    width: '100%',
  },
  skeletonBarMid: {
    width: '80%',
  },
  skeletonBarShort: {
    width: '55%',
  },
  errorText: {
    fontSize: FontSizes.secondary,
    color: Colors.danger,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  dangerButton: {
    marginTop: 4,
    backgroundColor: Colors.danger,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: BorderRadius.button,
  },
  dangerButtonLabel: {
    color: Colors.white,
    fontWeight: FontWeights.semiBold,
    fontSize: FontSizes.secondary,
  },
});
