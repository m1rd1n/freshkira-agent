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

const FRESHKIRA_PRICES = `FK-TON-001 Luminous Rice Toner 150ml — RM45
FK-SER-002 Snail Repair Serum 30ml — RM89
FK-MSK-003 Blemish Control Clay Mask 75ml — RM58
FK-MOI-004 Barrier Boost Moisturiser 50ml — RM72
FK-EYE-005 Brightening Vitamin C Eye Cream 15ml — RM95
FK-CLN-006 Gentle Foam Cleanser 150ml — RM38
FK-SUN-007 SPF 50 PA++++ Sunscreen Fluid 50ml — RM65
FK-EXF-008 AHA BHA Exfoliating Essence 30ml — RM79
FK-MSK-009 Overnight Sleeping Mask 60ml — RM68
FK-MST-010 Pore Minimising Essence Mist 100ml — RM42`;

const FIELDS = [
  {
    key: 'freshkiraPrice',
    label: 'FreshKira Price List',
    multiline: true,
    numberOfLines: 8,
  },
  {
    key: 'competitorPricing',
    label: 'Competitor Pricing Data',
    placeholder: 'e.g. GlowMY Toner 150ml — RM42\nSkintific Toner 100ml — RM39',
    multiline: true,
    numberOfLines: 5,
  },
  {
    key: 'saleEvents',
    label: 'Upcoming Sale Events',
    placeholder: 'e.g. 11.11, 12.12, Raya',
  },
  {
    key: 'context',
    label: 'Additional Context (optional)',
    placeholder: 'Margin targets, stock levels, bundles, etc.',
    multiline: true,
    numberOfLines: 3,
  },
];

const DEFAULTS: Record<string, string> = {
  freshkiraPrice: FRESHKIRA_PRICES,
  competitorPricing: '',
  saleEvents: '',
  context: '',
};

export default function PriceReviewScreen() {
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
      `FreshKira prices:\n${values.freshkiraPrice}`,
      values.competitorPricing ? `Competitor pricing:\n${values.competitorPricing}` : '',
      values.saleEvents ? `Upcoming sale events: ${values.saleEvents}` : '',
      values.context ? `Additional context: ${values.context}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    runAgent({ mode: 'PRICE_REVIEW', userInput: base + kb.buildContext() });
  };

  const showForm = isDesktop || !isActive;
  const showOutput = isDesktop || isActive;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Price Review" showBack accentColor={Colors.modePriceReview} />

      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        {showForm && (
          <View style={isDesktop ? styles.formPaneDesktop : styles.pane}>
            <InputForm
              fields={FIELDS}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitLabel="Run Price Review"
              submitColor={Colors.modePriceReview}
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
