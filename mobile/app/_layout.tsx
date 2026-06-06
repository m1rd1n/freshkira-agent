import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontWeights } from '../constants/fonts';

const SIDEBAR_WIDTH = 220;

const NAV_ITEMS = [
  {
    name: 'index',
    label: 'Home',
    href: '/' as const,
    iconActive: 'home' as const,
    iconInactive: 'home-outline' as const,
  },
  {
    name: 'history',
    label: 'History',
    href: '/history' as const,
    iconActive: 'time' as const,
    iconInactive: 'time-outline' as const,
  },
] as const;

const MODE_PATHS = new Set(['/trend-scan', '/price-review', '/roi-check']);
const MODE_NAMES = new Set(['trend-scan', 'price-review', 'roi-check']);

// ── Desktop sidebar ───────────────────────────────────────────────────────────
function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const activePath = MODE_PATHS.has(pathname) ? '/' : pathname;

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarBrand}>
        <Text style={styles.brandText}>
          <Text style={styles.brandFresh}>Fresh</Text>
          <Text style={styles.brandKira}>Kira</Text>
        </Text>
        <View style={styles.brandDot} />
      </View>

      <View style={styles.sidebarNav}>
        {NAV_ITEMS.map((item) => {
          const isFocused = activePath === item.href;
          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.sidebarItem, isFocused && styles.sidebarItemActive]}
              onPress={() => router.navigate(item.href)}
              activeOpacity={0.75}
            >
              <Ionicons
                name={isFocused ? item.iconActive : item.iconInactive}
                size={20}
                color={isFocused ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.sidebarLabel, isFocused && styles.sidebarLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ── Mobile bottom tab bar ─────────────────────────────────────────────────────
function MobileTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const currentRouteName: string = state.routes[state.index]?.name ?? 'index';

  if (MODE_NAMES.has(currentRouteName)) return null;

  return (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 8 }]}>
      {NAV_ITEMS.map((item) => {
        const isFocused = item.name === currentRouteName;
        return (
          <TouchableOpacity
            key={item.name}
            style={styles.bottomTab}
            onPress={() => { if (!isFocused) navigation.navigate(item.name); }}
            activeOpacity={0.75}
          >
            <Ionicons
              name={isFocused ? item.iconActive : item.iconInactive}
              size={24}
              color={isFocused ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.bottomLabel, isFocused && styles.bottomLabelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Root layout — ONE <Tabs>, conditional wrapper only ────────────────────────
export default function RootLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={[styles.root, isDesktop && styles.rootDesktop]}>
      {isDesktop && <DesktopSidebar />}

      <View style={styles.content}>
        <Tabs
          tabBar={(props) => isDesktop ? null : <MobileTabBar {...props} />}
          screenOptions={{ headerShown: false }}
        >
          <Tabs.Screen name="index"        options={{ title: 'Home' }} />
          <Tabs.Screen name="history"      options={{ title: 'History' }} />
          <Tabs.Screen name="trend-scan"   options={{ href: null }} />
          <Tabs.Screen name="price-review" options={{ href: null }} />
          <Tabs.Screen name="roi-check"    options={{ href: null }} />
        </Tabs>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  rootDesktop: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },

  // ── Desktop sidebar ──────────────────────────────────────────────────────────
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.white,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  brandText: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  brandFresh: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  brandKira: {
    color: Colors.textSecondary,
    fontWeight: FontWeights.regular,
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginTop: 4,
  },
  sidebarNav: {
    paddingHorizontal: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 8,
    marginBottom: 2,
  },
  sidebarItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  sidebarLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: FontWeights.medium,
  },
  sidebarLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeights.semiBold,
  },

  // ── Mobile bottom bar ────────────────────────────────────────────────────────
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 3,
  },
  bottomLabel: {
    fontSize: 11,
    fontWeight: FontWeights.semiBold,
    color: Colors.textMuted,
  },
  bottomLabelActive: {
    color: Colors.primary,
  },
});
