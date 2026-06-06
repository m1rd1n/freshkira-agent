import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Header } from '../components/Header';
import { InputForm } from '../components/InputForm';
import { KnowledgeUpload } from '../components/KnowledgeUpload';
import { StreamingOutput } from '../components/StreamingOutput';
import { Colors } from '../constants/colors';
import { useAgent } from '../hooks/useAgent';
import { useKnowledgeFiles } from '../hooks/useKnowledgeFiles';

const FIELDS = [
  {
    key: 'category',
    label: 'Product Category',
    placeholder: 'e.g. skincare, toner, sunscreen',
  },
  {
    key: 'audience',
    label: 'Target Audience',
    placeholder: 'e.g. Gen Z Malaysian women 18–32',
  },
  {
    key: 'competitor',
    label: 'Key Competitor to Monitor',
    placeholder: 'e.g. GlowMY',
  },
  {
    key: 'context',
    label: 'Additional Context (optional)',
    placeholder: 'Any campaign context, upcoming events, etc.',
    multiline: true,
    numberOfLines: 3,
  },
];

const DEFAULTS: Record<string, string> = {
  category: 'Malaysian skincare (toner, serum, moisturiser, sunscreen, sleeping mask)',
  audience: 'Gen Z and Millennial Malaysian women, aged 18–32, Klang Valley',
  competitor: 'GlowMY',
  context: '',
};

export default function TrendScanScreen() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const { output, status, error, runAgent, reset } = useAgent();
  const kb = useKnowledgeFiles();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const isActive = status !== 'idle';
  const isRunning = status === 'loading' || status === 'streaming';

  const handleChange = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    const base = [
      `Product category: ${values.category}`,
      `Target audience: ${values.audience}`,
      `Competitor to monitor: ${values.competitor}`,
      values.context ? `Additional context: ${values.context}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    runAgent({ mode: 'TREND_SCAN', userInput: base + kb.buildContext() });
  };

  const showForm = isDesktop || !isActive;
  const showOutput = isDesktop || isActive;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Trend Scan" showBack accentColor={Colors.modeTrendScan} />

      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        {showForm && (
          <View style={isDesktop ? styles.formPaneDesktop : styles.pane}>
            <InputForm
              fields={FIELDS}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitLabel="Run Trend Scan"
              submitColor={Colors.modeTrendScan}
              disabled={isRunning}
            />
            <KnowledgeUpload
              files={kb.files}
              error={kb.error}
              totalSizeKB={kb.totalSizeKB}
              onAdd={kb.addFiles}
              onRemove={kb.removeFile}
            />
          </View>
        )}

        {showOutput && (
          <View style={isDesktop ? styles.outputPaneDesktop : styles.pane}>
            <StreamingOutput
              output={output}
              status={status}
              error={error}
              onRetry={reset}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.offWhite },
  body: { flex: 1 },
  bodyDesktop: { flexDirection: 'row' },
  pane: { flex: 1 },
  formPaneDesktop: {
    width: 380,
    flexShrink: 0,
    alignSelf: 'stretch',
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  outputPaneDesktop: { flex: 1 },
});
