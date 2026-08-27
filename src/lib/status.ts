export const STATUS_GREEN = "#22C55E";
export const STATUS_GOLD = "#F59E0B";
export const STATUS_CORAL = "#EF4444";

export type StatusLevel = "green" | "gold" | "coral";

/** pct: 0-100, higher = healthier (e.g. % of budget remaining, or % of a goal achieved). */
export function statusLevelForPercent(pct: number): StatusLevel {
  if (pct >= 70) return "green";
  if (pct >= 40) return "gold";
  return "coral";
}

export function statusColorForPercent(pct: number): string {
  const level = statusLevelForPercent(pct);
  if (level === "green") return STATUS_GREEN;
  if (level === "gold") return STATUS_GOLD;
  return STATUS_CORAL;
}

export function statusLabelForPercent(pct: number): string {
  const level = statusLevelForPercent(pct);
  if (level === "green") return "Aman";
  if (level === "gold") return "Cukup";
  return "Menipis";
}

/** Remaining % (0-100) of a budget given spent and budget amount. */
export function budgetRemainingPct(spent: number, budget: number): number {
  if (budget <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((budget - spent) / budget) * 100)));
}
