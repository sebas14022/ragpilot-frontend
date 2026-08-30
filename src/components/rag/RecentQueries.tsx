import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

type Status = "success" | "warning" | "error";

type QueryRow = {
  id: string;
  query: string;
  source: string;
  chunks: number;
  latency: string;
  status: Status;
};

const rows: QueryRow[] = [
  {
    id: "q-1041",
    query: "What does the onboarding policy say about remote work?",
    source: "hr-handbook-2026.pdf",
    chunks: 4,
    latency: "312 ms",
    status: "success",
  },
  {
    id: "q-1042",
    query: "Summarize the S3 bucket retention rules.",
    source: "cloud-architecture.md",
    chunks: 6,
    latency: "489 ms",
    status: "success",
  },
  {
    id: "q-1043",
    query: "Which API endpoints require OAuth scopes?",
    source: "api-reference.md",
    chunks: 3,
    latency: "1.2 s",
    status: "warning",
  },
  {
    id: "q-1044",
    query: "Did we ship v2.4.0 on the planned date?",
    source: "release-notes.md",
    chunks: 2,
    latency: "2.0 s",
    status: "error",
  },
  {
    id: "q-1045",
    query: "How is p95 latency monitored in production?",
    source: "observability-guide.pdf",
    chunks: 5,
    latency: "398 ms",
    status: "success",
  },
];

const statusLabel: Record<Status, string> = {
  success: "Success",
  warning: "Slow",
  error: "Failed",
};

export default function RecentQueries() {
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
                  Source
                </TableCell>
                <TableCell
                  isHeader
                  className="px-6 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Chunks
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
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-800 line-clamp-1 dark:text-white/90">
                      {row.query}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.source}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.chunks}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {row.latency}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge
                      color={
                        row.status === "success"
                          ? "success"
                          : row.status === "warning"
                          ? "warning"
                          : "error"
                      }
                      size="sm"
                    >
                      {statusLabel[row.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}