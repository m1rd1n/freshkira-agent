import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { ModeConfig } from '../types';

const MODES: ModeConfig[] = [
  {
    mode: 'TREND_SCAN',
    title: 'Trend Scan',
    subtitle: 'TikTok & Shopee intelligence',
    description: 'Trending formats, hashtags, and ready-to-shoot content briefs built for Malaysian skincare.',
    icon: 'trending-up-outline',
    color: Colors.modeTrendScan,
    model: 'deepseek-chat',
  },
  {
    mode: 'PRICE_REVIEW',
    title: 'Price Review',
    subtitle: 'Competitive pricing matrix',
    description: 'SKU-level pricing gaps, net margin checks, and seasonal discount recommendations.',
    icon: 'pricetag-outline',
    color: Colors.modePriceReview,
    model: 'deepseek-chat',
  },
  {
    mode: 'ROI_CHECK',
    title: 'ROI Check',
    subtitle: 'Budget & KPI projections',
    description: 'Project orders, GMV, and follower growth against your RM5,000 monthly budget.',
    icon: 'calculator-outline',
    color: Colors.modeROICheck,
    model: 'deepseek-reasoner',
  },
];

const ROUTE_MAP = {
  TREND_SCAN: '/trend-scan',
  PRICE_REVIEW: '/price-review',
  ROI_CHECK: '/roi-check',
} as const;

const STATS = [
  { value: '3', label: 'AI modes' },
  { value: '10 min', label: 'avg. time' },
  { value: 'RM5K', label: 'budget cap' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top nav ──────────────────────────────────────────── */}
        <View style={styles.topNav}>
          <View style={styles.navBrand}>
            <Text style={styles.navBrandText}>
              <Text style={styles.navFresh}>Fresh</Text>
              <Text style={styles.navKira}>Kira</Text>
            </Text>
            <View style={styles.navDot} />
          </View>
          <Text style={styles.navTagline}>Brand Intelligence. Then act.</Text>
        </View>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
            Brand{'\n'}Intelligence.
          </Text>
          <Text style={styles.heroSub}>
            Replace 3+ hours of manual competitor research, pricing analysis, and campaign planning — in a single AI report.
          </Text>

          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
                {i < STATS.length - 1 && <View style={styles.statDivider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* ── Mode cards ───────────────────────────────────────── */}
        <View style={[styles.modesSection, isDesktop && styles.modesSectionDesktop]}>
          <Text style={styles.sectionLabel}>Select a mode to start</Text>

          <View style={[styles.cardRow, isDesktop && styles.cardRowDesktop]}>
            {MODES.map((config) => (
              <ModeCard
                key={config.mode}
                config={config}
                onPress={() => router.push(ROUTE_MAP[config.mode])}
                isDesktop={isDesktop}
              />
            ))}
          </View>
        </View>

        {/* ── Footer ───────────────────────────────────────────── */}
        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.navigate('/history')}
        >
          <Ionicons name="time-outline" size={13} color={Colors.textMuted} />
          <Text style={styles.footerLinkText}>View past reports</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── ModeCard ──────────────────────────────────────────────────────────────────

interface ModeCardProps {
  config: ModeConfig;
  onPress: () => void;
  isDesktop: boolean;
}

function ModeCard({ config, onPress, isDesktop }: ModeCardProps) {
  const { title, subtitle, description, icon, color } = config;

  return (
    <TouchableOpacity
      style={[styles.card, isDesktop && styles.cardDesktop]}
      onPress={onPress}
      activeOpacity={0.87}
    >
      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={22} color={color} />
      </View>

      {/* Text */}
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardSubLabel}>{subtitle}</Text>
      <Text style={styles.cardDesc}>{description}</Text>

      {/* CTA */}
      <View style={styles.cardCTA}>
        <Text style={[styles.ctaText, { color }]}>Run {title}</Text>
        <Ionicons name="arrow-forward" size={13} color={color} />
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.backgroundWarm,
  },
  scroll: {
    flexGrow: 1,
  },
  scrollDesktop: {
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },

  // ── Top nav ──────────────────────────────────────────────
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navBrand: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 3,
  },
  navBrandText: {
    fontSize: 15,
    letterSpacing: -0.2,
  },
  navFresh: {
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  navKira: {
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  navDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 3,
  },
  navTagline: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },

  // ── Hero ─────────────────────────────────────────────────
  hero: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
  },
  heroDesktop: {
    paddingHorizontal: 48,
    paddingTop: 24,
    paddingBottom: 52,
  },
  heroTitle: {
    fontSize: 46,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  heroTitleDesktop: {
    fontSize: 68,
    lineHeight: 76,
    letterSpacing: -2,
  },
  heroSub: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
    maxWidth: 460,
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    lineHeight: 22,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },

  // ── Modes section ─────────────────────────────────────────
  modesSection: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  modesSectionDesktop: {
    paddingHorizontal: 48,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 14,
  },
  cardRow: {
    gap: 12,
  },
  cardRowDesktop: {
    flexDirection: 'row',
  },

  // ── Mode card ─────────────────────────────────────────────
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDesktop: {
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  cardSubLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 18,
    flexShrink: 1,
  },
  cardCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Footer ────────────────────────────────────────────────
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
    paddingVertical: 16,
    paddingBottom: 24,
  },
  footerLinkText: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
