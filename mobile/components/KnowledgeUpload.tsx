import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../constants/colors';
import { BorderRadius, FontSizes, FontWeights, Spacing } from '../constants/fonts';
import { KnowledgeFile } from '../hooks/useKnowledgeFiles';

interface KnowledgeUploadProps {
  files: KnowledgeFile[];
  error: string | null;
  totalSizeKB: number;
  onAdd: (files: KnowledgeFile[]) => void;
  onRemove: (index: number) => void;
}

async function pickFilesWeb(): Promise<KnowledgeFile[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.md,.csv';
    input.multiple = true;
    input.onchange = async () => {
      const picked = Array.from(input.files ?? []);
      const loaded: KnowledgeFile[] = [];
      for (const file of picked) {
        try {
          const content = await file.text();
          loaded.push({
            name: file.name,
            content,
            sizeKB: Math.round(file.size / 1024),
          });
        } catch {
          // skip unreadable files
        }
      }
      resolve(loaded);
    };
    input.oncancel = () => resolve([]);
    input.click();
  });
}

export function KnowledgeUpload({
  files,
  error,
  totalSizeKB,
  onAdd,
  onRemove,
}: KnowledgeUploadProps) {
  const [picking, setPicking] = useState(false);

  const handlePick = async () => {
    if (Platform.OS !== 'web') return;
    setPicking(true);
    try {
      const loaded = await pickFilesWeb();
      if (loaded.length > 0) onAdd(loaded);
    } finally {
      setPicking(false);
    }
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="documents-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.headerLabel}>Knowledge Files</Text>
          {files.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{files.length}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.addButton, picking && styles.addButtonDisabled]}
          onPress={handlePick}
          disabled={picking}
          activeOpacity={0.8}
        >
          {picking ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons name="add" size={14} color={Colors.primary} />
              <Text style={styles.addButtonLabel}>Add Files</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {files.length === 0 && (
        <Text style={styles.hint}>
          Attach .txt, .md, or .csv files — the agent will read them as extra context.
        </Text>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      {files.length > 0 && (
        <View style={styles.chipRow}>
          {files.map((file, i) => (
            <View key={`${file.name}-${i}`} style={styles.chip}>
              <Ionicons name="document-text-outline" size={12} color={Colors.primary} />
              <Text style={styles.chipName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.chipSize}>{file.sizeKB}KB</Text>
              <TouchableOpacity
                onPress={() => onRemove(i)}
                hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
              >
                <Ionicons name="close-circle" size={14} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {files.length > 0 && (
        <Text style={styles.totalSize}>
          {files.length} file{files.length !== 1 ? 's' : ''} · {totalSizeKB} KB total
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.offWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerLabel: {
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.semiBold,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  countBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    fontSize: 10,
    color: Colors.white,
    fontWeight: FontWeights.bold,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonLabel: {
    fontSize: FontSizes.caption,
    color: Colors.primary,
    fontWeight: FontWeights.semiBold,
  },
  hint: {
    fontSize: FontSizes.caption,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 4,
  },
  errorText: {
    fontSize: FontSizes.caption,
    color: Colors.danger,
    marginBottom: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 220,
  },
  chipName: {
    fontSize: FontSizes.caption,
    color: Colors.textPrimary,
    fontWeight: FontWeights.medium,
    flex: 1,
  },
  chipSize: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  totalSize: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
