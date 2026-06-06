import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSizes, FontWeights } from '../constants/fonts';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  accentColor?: string;
  rightElement?: React.ReactNode;
}

function FreshKiraLogo() {
  return (
    <View style={logo.container}>
      <Text style={logo.text}>
        <Text style={logo.fresh}>Fresh</Text>
        <Text style={logo.kira}>Kira</Text>
      </Text>
      <View style={logo.dot} />
    </View>
  );
}

export function Header({ title, showBack = false, accentColor, rightElement }: HeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {showBack ? (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.side} />
        )}

        {title ? (
          <Text style={styles.title}>{title}</Text>
        ) : (
          <FreshKiraLogo />
        )}

        <View style={styles.side}>
          {rightElement ?? null}
        </View>
      </View>

      {/* Colored accent line beneath the header for mode screens */}
      {accentColor && (
        <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      )}
    </View>
  );
}

const logo = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    fontSize: 20,
    letterSpacing: -0.2,
  },
  fresh: {
    color: Colors.textPrimary,
    fontWeight: FontWeights.bold,
  },
  kira: {
    color: Colors.textSecondary,
    fontWeight: FontWeights.regular,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accent,
    marginBottom: 6,
  },
});

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  title: {
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.1,
  },
  side: {
    width: 32,
    alignItems: 'flex-end',
  },
  accentBar: {
    height: 3,
    width: '100%',
  },
});
