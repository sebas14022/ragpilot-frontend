import { api } from "../lib/api";
import type { ComparisonResult } from "../lib/types";

export async function runComparison(
  query: string,
  documentIds?: string[],
): Promise<ComparisonResult> {
  return api.post<ComparisonResult>("/v1/compare", {
    query,
    documentIds: documentIds && documentIds.length > 0 ? documentIds : undefined,
  });
}

// These examples are deliberately AMBIGUOUS: the correct nuance lives in one
// section while similar or contradictory facts appear elsewhere, so retrieval
// has a fair shot at it without reading the whole document. Whether the
// "full-doc" baseline (whole document in one prompt) lands the same answer
// varies by model and run — the reliable, measurable contrast here is token
// and latency cost, not a guaranteed wrong answer.
export const exampleQueries = [
  // "90 days" appears for raw Sandbox files, audit logs, and query logs. The
  // correct nuance: raw files only auto-delete at 90 days on Sandbox; paid plans
  // retain them for the project's life.
  "Are all RagPilot retention periods exactly 90 days, or do some data types differ?",
  // v2.8 (Mar 4 2025) is listed before v2.4 (Jun 2025) — the list is NOT
  // chronological. The correct answer is v2.4.
  "Which version was released more recently by date, v2.4 or v2.8?",
  // Two different "14-day" periods exist: the Sandbox Pro trial (Part 2) and the
  // project soft-delete grace (Part 5). The correct answer is 14 days of soft-delete
  // grace. The full doc can grab the Sandbox 14-day trial instead.
  "How many days is the soft-delete grace period for a deleted project?",
];
