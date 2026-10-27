import { api } from "../lib/api";
import type { ComparisonMetrics, DashboardMetrics, RecentQuery } from "../lib/types";

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return api.get<DashboardMetrics>("/v1/metrics/dashboard");
}

export async function getRecentQueries(): Promise<RecentQuery[]> {
  return api.get<RecentQuery[]>("/v1/metrics/recent-queries");
}

export async function getComparisonMetrics(): Promise<ComparisonMetrics> {
  return api.get<ComparisonMetrics>("/v1/metrics/comparisons");
}
