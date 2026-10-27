import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import { getRecentQueries } from "../../services/metrics";
import type { RecentQuery } from "../../lib/types";

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groundednessColor(g: RecentQuery["groundedness"]) {
  if (g === "High") return "success";
  if (g === "Medium") return "warning";
  return "error";
}

export default function RecentQueries({ refreshKey = 0 }: { refreshKey?: number }) {
  const [rows, setRows] = useState<RecentQuery[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoaded(false);
    setError(null);
    getRecentQueries()
      .then((r) => setRows(r))
      .catch((e) => {
        setRows([]);
        setError(e instanceof Error ? e.message : "Could not load recent queries");
      })
      .finally(() => setLoaded(true));
  }, [refreshKey]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Recent queries
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Latest requests processed by the pipeline
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[650px]">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Query
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Timestamp
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Groundedness
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Latency
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {error ? (
                <TableRow>
                  <TableCell className="px-6 py-4 text-sm text-error-600 dark:text-error-400">
                    {error}
                  </TableCell>
                </TableRow>
              ) : loaded && rows.length === 0 ? (
                <TableRow>
                  <TableCell className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    No queries yet. Ask a question in the RAG Lab to see results here.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-800 line-clamp-1 dark:text-white/90">
                        {row.question}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {formatTimestamp(row.timestamp)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge color={groundednessColor(row.groundedness)} size="sm">
                        {row.groundedness}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {row.latencyMs} ms
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        color={row.status === "success" ? "success" : "error"}
                        size="sm"
                      >
                        {row.status === "success" ? "Success" : "Failed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
