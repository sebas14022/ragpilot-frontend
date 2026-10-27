import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  BoltIcon,
  ChatIcon,
  FolderIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { getDashboardMetrics } from "../../services/metrics";
import type { DashboardMetrics } from "../../lib/types";

type Metric = {
  label: string;
  value: string;
  change: number | null;
  icon: React.ReactNode;
};

function formatNumber(n: number) {
  return n.toLocaleString("en-US");
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export default function MetricCards({ refreshKey = 0 }: { refreshKey?: number }) {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getDashboardMetrics()
      .then((m) => setData(m))
      .catch(() => setData(null))
      .finally(() => setLoaded(true));
  }, [refreshKey]);

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading metrics...</p>
      </div>
    );
  }

  const metrics: Metric[] = data
    ? [
        {
          label: "Indexed documents",
          value: formatNumber(data.documents.value),
          change: data.documents.change,
          icon: <FolderIcon className="text-gray-800 dark:text-white/90" />,
        },
        {
          label: "Chunks",
          value: formatNumber(data.chunks.value),
          change: data.chunks.change,
          icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
        },
        {
          label: "Queries",
          value: formatNumber(data.queries.value),
          change: data.queries.change,
          icon: <ChatIcon className="text-gray-800 dark:text-white/90" />,
        },
        {
          label: "Tokens used",
          value: formatCompact(data.tokens.value),
          change: data.tokens.change,
          icon: <BoltIcon className="text-gray-800 dark:text-white/90" />,
        },
      ]
    : [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
            {metric.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-[11px] text-gray-500 dark:text-gray-400">
              {metric.label}
            </span>
            <div className="flex items-center gap-1.5">
              <h4 className="truncate font-semibold text-gray-800 dark:text-white/90">
                {metric.value}
              </h4>
              {metric.change !== null && (
                <Badge
                  color={metric.change >= 0 ? "success" : "error"}
                  size="sm"
                  startIcon={
                    metric.change >= 0 ? (
                      <ArrowUpIcon className="size-3" />
                    ) : (
                      <ArrowDownIcon className="size-3" />
                    )
                  }
                >
                  {Math.abs(metric.change)}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
