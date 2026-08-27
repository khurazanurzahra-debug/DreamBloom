import { isPeriodValid, isSamePeriod } from "./dateFilter";
import type { Transaction, TransactionType } from "../types";

const POINTS = 7;
const MIN_MONTHS_FOR_MONTHLY_TREND = 4;

/** Walks backward from (year, month), collecting up to `count` valid periods (oldest first). */
function getTrailingMonths(year: number, month: number, count: number): { year: number; month: number }[] {
  const out: { year: number; month: number }[] = [];
  let y = year;
  let m = month;
  for (let i = 0; i < count; i++) {
    if (!isPeriodValid(y, m)) break;
    out.unshift({ year: y, month: m });
    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
  }
  return out;
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Not enough month-over-month history yet (the app's data starts this month) — instead of a flat
 * 2-point line, show the shape of the current month's activity so far: real transaction amounts
 * bucketed into POINTS evenly-spaced day-ranges across the month (not cumulative, so the line can
 * genuinely rise and fall with actual spending/income bursts).
 */
function intraMonthBucketFlow(
  transactions: Transaction[],
  type: TransactionType,
  year: number,
  month: number
): number[] {
  const total = daysInMonth(year, month);
  const monthTx = transactions.filter((t) => t.type === type && isSamePeriod(t.date, year, month));
  const values: number[] = [];
  let rangeStart = 0;
  for (let i = 1; i <= POINTS; i++) {
    const rangeEnd = Math.round((i / POINTS) * total);
    const bucketSum = monthTx
      .filter((t) => {
        const day = new Date(t.date + "T00:00:00").getDate();
        return day > rangeStart && day <= rangeEnd;
      })
      .reduce((s, t) => s + t.amount, 0);
    values.push(bucketSum);
    rangeStart = rangeEnd;
  }
  return values;
}

function intraMonthCumulativeGrams(
  transactions: Transaction[],
  year: number,
  month: number,
  baseline: number
): number[] {
  const total = daysInMonth(year, month);
  const goldTx = transactions.filter((t) => t.type === "gold" && isSamePeriod(t.date, year, month));
  const values: number[] = [];
  for (let i = 1; i <= POINTS; i++) {
    const day = Math.round((i / POINTS) * total);
    const withinMonth = goldTx
      .filter((t) => new Date(t.date + "T00:00:00").getDate() <= day)
      .reduce((s, t) => s + (t.grams ?? 0), 0);
    values.push(baseline + withinMonth);
  }
  return values;
}

/** Per-month totals for a transaction type, for the trailing valid months ending at (year, month). */
export function monthlyFlowTrend(
  transactions: Transaction[],
  type: TransactionType,
  year: number,
  month: number,
  count = POINTS
): number[] {
  const months = getTrailingMonths(year, month, count);
  if (months.length >= MIN_MONTHS_FOR_MONTHLY_TREND) {
    return months.map(({ year: y, month: m }) =>
      transactions.filter((t) => t.type === type && isSamePeriod(t.date, y, m)).reduce((s, t) => s + t.amount, 0)
    );
  }
  return intraMonthBucketFlow(transactions, type, year, month);
}

/** Cumulative gold grams — a running total, since gold is an accumulated asset rather than a monthly flow. */
export function cumulativeGramsTrend(
  transactions: Transaction[],
  year: number,
  month: number,
  count = POINTS
): number[] {
  const months = getTrailingMonths(year, month, count);
  const goldTx = transactions.filter((t) => t.type === "gold");

  if (months.length >= MIN_MONTHS_FOR_MONTHLY_TREND) {
    return months.map(({ year: y, month: m }) =>
      goldTx
        .filter((t) => {
          const d = new Date(t.date + "T00:00:00");
          return d.getFullYear() < y || (d.getFullYear() === y && d.getMonth() + 1 <= m);
        })
        .reduce((s, t) => s + (t.grams ?? 0), 0)
    );
  }

  const current = months[months.length - 1] ?? { year, month };
  const baseline = goldTx
    .filter((t) => {
      const d = new Date(t.date + "T00:00:00");
      return d.getFullYear() < current.year || (d.getFullYear() === current.year && d.getMonth() + 1 < current.month);
    })
    .reduce((s, t) => s + (t.grams ?? 0), 0);
  return intraMonthCumulativeGrams(transactions, current.year, current.month, baseline);
}

/** How the latest point compares to the trailing average, as a 0-100 score usable with statusColorForPercent. */
export function trendHealthPct(values: number[]): number {
  if (values.length < 2) return 100;
  const current = values[values.length - 1];
  const priorAvg = values.slice(0, -1).reduce((s, v) => s + v, 0) / (values.length - 1);
  if (priorAvg <= 0) return current > 0 ? 100 : 0;
  return Math.max(0, Math.min(100, Math.round((current / priorAvg) * 100)));
}
