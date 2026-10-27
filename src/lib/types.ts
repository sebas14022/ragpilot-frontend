export type Groundedness = "High" | "Medium" | "Low";

export interface DocumentSummary {
  id: string;
  filename: string;
  status: "indexed" | "processing" | "failed";
  chunks: number;
  createdAt: string;
  storagePath?: string;
}

export interface DocumentList {
  documents: DocumentSummary[];
  total: number;
}

export interface UploadResult {
  id: string;
  filename: string;
  status: DocumentSummary["status"];
  chunks: number;
}

export interface ChatSource {
  document: string;
  page?: number | null;
  section?: string | null;
  score?: number | null;
}

export interface ContextUsage {
  kind: "retrieval" | "full-document";
  chunks: number;
  documents: number;
  characters: number;
  avgSimilarity: number | null;
}

export interface ComparisonAnswer {
  label: string;
  model: string;
  latencyMs: number;
  groundedness: Groundedness;
  tokensUsed: number;
  context: ContextUsage;
  sources: ChatSource[];
  answer: string;
}

export interface ComparisonResult {
  query: string;
  rag: ComparisonAnswer;
  baseline: ComparisonAnswer;
}

export interface MetricValue {
  value: number;
  change: number | null;
}

export interface DashboardMetrics {
  documents: MetricValue;
  chunks: MetricValue;
  queries: MetricValue;
  tokens: MetricValue;
}

export interface RecentQuery {
  id: string;
  question: string;
  timestamp: string;
  latencyMs: number;
  groundedness: Groundedness;
  status: "success" | "failed";
}

export interface ComparisonMetrics {
  total: number;
  avgRagLatencyMs: number;
  avgBaselineLatencyMs: number;
  tokensUsed: number;
  ragGroundedRate: number;
  baselineGroundedRate: number;
}
