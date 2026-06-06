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

const DEFAULT_BUDGET_BREAKDOWN = `TikTok Shop affiliate creators (3 micro, 10K–50K followers): RM1,500
Shopee Sponsored Ads (CPC): RM1,000
TikTok Shop LIVE sessions (team-run, 2x/week): RM0
Shopee Flash Sale slots (seller discount only): RM0
Content creation (smartphone + AI tools): RM0
Product seeding (5 micro-influencers, COGS only): RM500
Paid TikTok/Instagram boosting: RM500
Contingency: RM1,000
TOTAL: RM4,500`;

const FIELDS = [
  {
    key: 'totalBudget',
    label: 'Total Monthly Budget',
    keyboardType: 'numeric' as const,
    prefix: 'RM',
  },
  {
    key: 'budgetBreakdown',
    label: 'Budget Breakdown',
    multiline: true,
    numberOfLines: 8,
  },
  {
    key: 'aov',
    label: 'Average Order Value',
    keyboardType: 'numeric' as const,
    prefix: 'RM',
  },
  {
    key: 'targetFollowers',
    label: '30-Day Follower Target',
    keyboardType: 'numeric' as const,
    placeholder: '10000',
  },
  {
    key: 'targetOrders',
    label: '30-Day Order Target',
    keyboardType: 'numeric' as const,
    placeholder: '500',
  },
  {
    key: 'context',
    label: 'Additional Context (optional)',
    placeholder: 'Current follower count, best-selling SKUs, etc.',
    multiline: true,
    numberOfLines: 3,
  },
];

const DEFAULTS: Record<string, string> = {
  totalBudget: '5000',
  budgetBreakdown: DEFAULT_BUDGET_BREAKDOWN,
  aov: '75',
  targetFollowers: '10000',
  targetOrders: '500',
  context: '',
};

export default function ROICheckScreen() {
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
      `Total monthly budget: RM${values.totalBudget}`,
      `Budget breakdown:\n${values.budgetBreakdown}`,
      `Average order value: RM${values.aov}`,
      `30-day targets: ${values.targetFollowers} followers, ${values.targetOrders} orders`,
      values.context ? `Additional context: ${values.context}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    runAgent({ mode: 'ROI_CHECK', userInput: base + kb.buildContext() });
  };

  const showForm = isDesktop || !isActive;
  const showOutput = isDesktop || isActive;

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="ROI Check" showBack accentColor={Colors.modeROICheck} />

      <View style={[styles.body, isDesktop && styles.bodyDesktop]}>
        {showForm && (
          <View style={isDesktop ? styles.formPaneDesktop : styles.pane}>
            <InputForm
              fields={FIELDS}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              submitLabel="Run ROI Check"
              submitColor={Colors.modeROICheck}
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
              badge="Powered by DeepSeek R1"
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
