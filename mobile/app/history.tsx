import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Header } from '../components/Header';
import { OutputCard } from '../components/OutputCard';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';
import { useHistory } from '../hooks/useHistory';
import { AgentMode, HistoryItem } from '../types';

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

const markdownStyles: Record<string, object> = {
  body: { color: Colors.textPrimary, fontSize: FontSizes.body, lineHeight: 26 },
  heading1: {
    fontSize: FontSizes.screenTitle,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    marginTop: 20,
    marginBottom: 10,
  },
  heading2: {
    fontSize: FontSizes.sectionHeader,
    fontWeight: FontWeights.bold,
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  heading3: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
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
  bullet_list: { marginVertical: 6 },
  list_item: { marginVertical: 3 },
  strong: { fontWeight: FontWeights.bold },
};

// Same horizontal table rule used in StreamingOutput
const markdownRules = {
  table: (node: any, children: React.ReactNode[]) => (
    <ScrollView
      key={node.key}
      horizontal
      showsHorizontalScrollIndicator
      style={{ marginVertical: 8 }}
    >
      <View>{children}</View>
    </ScrollView>
  ),
};

export default function HistoryScreen() {
  const { history, deleteItem, clearAll } = useHistory();
  const [selected, setSelected] = useState<HistoryItem | null>(null);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'This will delete all saved reports. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAll },
      ],
    );
  };

  const handleShare = async () => {
    if (!selected) return;
    if (Platform.OS === 'web') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ text: selected.output }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(selected.output).catch(() => {});
      }
    } else {
      await Share.share({ message: selected.output });
    }
  };

  const clearButton = (
    <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
      <Ionicons name="trash-outline" size={20} color={Colors.danger} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="History" rightElement={history.length > 0 ? clearButton : undefined} />

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={52} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved reports yet.</Text>
          <Text style={styles.emptySubtext}>
            Run a Trend Scan, Price Review, or ROI Check — reports are saved automatically.
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.list, isDesktop && styles.listDesktop]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OutputCard
              mode={item.mode}
              timestamp={item.timestamp}
              preview={item.output.replace(/[#*>`]/g, '').slice(0, 120)}
              onPress={() => setSelected(item)}
              onDelete={() => deleteItem(item.id)}
            />
          )}
        />
      )}

      {/* Full-output modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelected(null)}
      >
        {selected && (
          <SafeAreaView style={styles.modalSafe}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.modalTitleRow}>
                <View
                  style={[
                    styles.modalBadge,
                    { backgroundColor: `${MODE_COLORS[selected.mode]}18` },
                  ]}
                >
                  <Text style={[styles.modalBadgeText, { color: MODE_COLORS[selected.mode] }]}>
                    {MODE_LABELS[selected.mode]}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={handleShare} style={styles.modalShare} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal content */}
            <ScrollView
              contentContainerStyle={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              <Markdown style={markdownStyles} rules={markdownRules}>
                {selected.output}
              </Markdown>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  list: {
    padding: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  listDesktop: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    gap: 12,
  },
  emptyTitle: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semiBold,
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: FontSizes.secondary,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  // Modal
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  modalClose: {
    padding: 4,
  },
  modalTitleRow: {
    flex: 1,
    alignItems: 'center',
  },
  modalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
  },
  modalBadgeText: {
    fontSize: FontSizes.secondary,
    fontWeight: FontWeights.semiBold,
  },
  modalShare: {
    padding: 4,
  },
  modalContent: {
    padding: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
});
