import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  BoltIcon,
  ChatIcon,
  FolderIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";

type Metric = {
  label: string;
  value: string;
  unit?: string;
  change: number;
  icon: React.ReactNode;
};

const metrics: Metric[] = [
  {
    label: "Indexed documents",
    value: "1,248",
    change: 8.2,
    icon: <FolderIcon className="text-gray-800 dark:text-white/90" />,
  },
  {
    label: "Chunks",
    value: "25,431",
    change: 12.4,
    icon: <BoxIconLine className="text-gray-800 dark:text-white/90" />,
  },
  {
    label: "Queries",
    value: "8,960",
    change: 5.1,
    icon: <ChatIcon className="text-gray-800 dark:text-white/90" />,
  },
  {
    label: "Tokens used",
    value: "1.24M",
    change: -3.4,
    icon: <BoltIcon className="text-gray-800 dark:text-white/90" />,
  },
];

export default function MetricCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
              {metric.icon}
            </div>
            <Badge
              color={metric.change >= 0 ? "success" : "error"}
              size="sm"
              startIcon={
                metric.change >= 0 ? (
                  <ArrowUpIcon className="size-3.5" />
                ) : (
                  <ArrowDownIcon className="size-3.5" />
                )
              }
            >
              {Math.abs(metric.change)}%
            </Badge>
          </div>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {metric.label}
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {metric.value}
              </h4>
            </div>
            <span className="mb-1 text-sm text-gray-400 dark:text-gray-500">
              vs last week
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}