/**
 * Fixed, non-derived colors for specific financial metrics (income/saving/gold/expense/obligation).
 * These are metric IDENTITY colors — always the same regardless of percentage, budget, or status —
 * as opposed to lib/status.ts, which colors things by financial health (green/gold/coral by %).
 * Never compute one of these from statusColorForPercent() or a category's identity color.
 */
export const METRIC_COLORS = {
  income: "#22C55E",
  saving: "#8B5CF6",
  gold: "#FBBF24",
  expense: "#EF4444",
  obligation: "#B9CBE0",
} as const;

export type MetricKey = keyof typeof METRIC_COLORS;
