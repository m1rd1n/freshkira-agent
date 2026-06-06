export type AgentMode = 'TREND_SCAN' | 'PRICE_REVIEW' | 'ROI_CHECK';

export type AgentStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export interface AgentRequest {
  mode: AgentMode;
  userInput: string;
}

export interface AgentStreamChunk {
  content: string;
  done: boolean;
}

export interface HistoryItem {
  id: string;
  mode: AgentMode;
  timestamp: string;
  input: string;
  output: string;
}

export interface ModeConfig {
  mode: AgentMode;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  model: 'deepseek-chat' | 'deepseek-reasoner';
}
