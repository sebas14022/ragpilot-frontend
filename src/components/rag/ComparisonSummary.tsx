import type { ComparisonResult, ContextUsage, Groundedness } from "../../lib/types";

type Side = "rag" | "baseline";

type SummaryRow = {
  label: string;
  rag: string;
  baseline: string;
  delta?: string;
  winner: Side | null;
};

const GROUNDEDNESS_RANK: Record<Groundedness, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatChars(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K chars` : `${n} chars`;
}

function describeContext(context: ContextUsage): string {
  if (context.kind === "retrieval") {
    const similarity =
      context.avgSimilarity === null
        ? "no matches"
        : `${Math.round(context.avgSimilarity * 100)}% match`;
    const chunks = `${context.chunks} ${context.chunks === 1 ? "chunk" : "chunks"}`;
    return `${chunks} · ${similarity}`;
  }

  const documents = `${context.documents} ${context.documents === 1 ? "doc" : "docs"}`;
  return `${documents} · ${formatChars(context.characters)}`;
}

/** Lower is better for both latency and tokens. */
function cheaper(rag: number, baseline: number): Side | null {
  if (rag === baseline) return null;
  return rag < baseline ? "rag" : "baseline";
}

function percentDelta(rag: number, baseline: number): string {
  if (!baseline) return "—";
  const delta = ((rag - baseline) / baseline) * 100;
  if (Math.round(delta) === 0) return "±0%";
  return `${delta > 0 ? "+" : "−"}${Math.abs(Math.round(delta))}%`;
}

function betterGroundedness(rag: Groundedness, baseline: Groundedness): Side | null {
  const diff = GROUNDEDNESS_RANK[rag] - GROUNDEDNESS_RANK[baseline];
  if (diff === 0) return null;
  return diff > 0 ? "rag" : "baseline";
}

function groundednessTone(value: Groundedness): string {
  if (value === "High") return "text-success-600 dark:text-success-400";
  if (value === "Medium") return "text-warning-600 dark:text-warning-400";
  return "text-error-600 dark:text-error-400";
}

function Cell({
  children,
  winner,
  className = "",
}: {
  children: React.ReactNode;
  winner: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg px-2 py-1.5 text-sm tabular-nums ${
        winner
          ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          : "text-gray-600 dark:text-gray-400"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function ComparisonSummary({ result }: { result: ComparisonResult }) {
  const { rag, baseline } = result;

  const rows: SummaryRow[] = [
    {
      label: "Groundedness",
      rag: rag.groundedness,
      baseline: baseline.groundedness,
      winner: betterGroundedness(rag.groundedness, baseline.groundedness),
    },
    {
      label: "Context sent",
      rag: describeContext(rag.context),
      baseline: describeContext(baseline.context),
      winner: null,
    },
    {
      label: "Tokens",
      rag: formatNumber(rag.tokensUsed),
      baseline: formatNumber(baseline.tokensUsed),
      delta: percentDelta(rag.tokensUsed, baseline.tokensUsed),
      winner: cheaper(rag.tokensUsed, baseline.tokensUsed),
    },
    {
      label: "Latency",
      rag: `${formatNumber(rag.latencyMs)} ms`,
      baseline: `${formatNumber(baseline.latencyMs)} ms`,
      delta: percentDelta(rag.latencyMs, baseline.latencyMs),
      winner: cheaper(rag.latencyMs, baseline.latencyMs),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h5 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Side by side
        </h5>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          Highlighted cell = better result. Δ is RAG relative to full-doc.
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,1.4fr)_minmax(0,0.7fr)] items-center gap-x-2 gap-y-1.5">
        <span />
        <span className="px-2 text-[11px] font-medium uppercase tracking-wide text-brand-600 dark:text-brand-400">
          RAG
        </span>
        <span className="px-2 text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Full-doc
        </span>
        <span className="px-2 text-right text-[11px] font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Δ
        </span>

        {rows.map((row) => (
          <div key={row.label} className="contents">
            <span className="text-xs text-gray-500 dark:text-gray-400">{row.label}</span>
            <Cell
              winner={row.winner === "rag"}
              className={row.label === "Groundedness" ? groundednessTone(rag.groundedness) : ""}
            >
              {row.rag}
            </Cell>
            <Cell
              winner={row.winner === "baseline"}
              className={
                row.label === "Groundedness" ? groundednessTone(baseline.groundedness) : ""
              }
            >
              {row.baseline}
            </Cell>
            <span className="px-2 text-right text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {row.delta ?? "—"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
