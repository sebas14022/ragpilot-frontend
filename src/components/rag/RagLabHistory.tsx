import { useEffect, useState } from "react";
import { BoltIcon, CompareIcon, FolderIcon } from "../../icons";
import MetricCards from "./MetricCards";
import { getComparisonMetrics } from "../../services/metrics";
import type { ComparisonMetrics } from "../../lib/types";

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function ComparisonCards({ data }: { data: ComparisonMetrics | null }) {
  if (!data) {
    return null;
  }

  const latencyDelta = data.avgRagLatencyMs - data.avgBaselineLatencyMs;

  const cards = [
    {
      label: "Comparisons",
      value: data.total.toLocaleString("en-US"),
      icon: <CompareIcon className="text-gray-800 dark:text-white/90" />,
    },
    {
      // The money shot: how often each branch produced an answer its context
      // fully supported. Persisted per comparison, so it survives reloads.
      label: "Grounded answers (RAG / full-doc)",
      value: `${data.ragGroundedRate}% / ${data.baselineGroundedRate}%`,
      icon: <FolderIcon className="text-gray-800 dark:text-white/90" />,
    },
    {
      label: "Avg latency delta (RAG − full-doc)",
      value: `${latencyDelta > 0 ? "+" : ""}${latencyDelta} ms`,
      icon: <BoltIcon className="text-gray-800 dark:text-white/90" />,
    },
    {
      label: "Tokens across comparisons",
      value: formatCompact(data.tokensUsed),
      icon: <CompareIcon className="text-gray-800 dark:text-white/90" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            {card.icon}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-[11px] text-gray-500 dark:text-gray-400">
              {card.label}
            </span>
            <h4 className="mt-0.5 truncate font-semibold text-gray-800 dark:text-white/90">
              {card.value}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RagLabHistory({ refreshKey = 0 }: { refreshKey?: number }) {
  const [comparisons, setComparisons] = useState<ComparisonMetrics | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getComparisonMetrics()
      .then((m) => setComparisons(m))
      .catch(() => setComparisons(null))
      .finally(() => setLoaded(true));
  }, [refreshKey]);

  return (
    <section className="space-y-3 md:space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Analytics
        </h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Your RAG vs full-doc pipeline at a glance
        </p>
      </header>

      {loaded ? <ComparisonCards data={comparisons} /> : null}

      <MetricCards refreshKey={refreshKey} />
    </section>
  );
}
