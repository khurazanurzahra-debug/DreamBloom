import { useMemo } from "react";
import { useDream } from "../context/DreamContext";
import { isSamePeriod } from "../lib/dateFilter";
import { GOLD_PRICE_PER_GRAM } from "../lib/mockData";
import type { PersonId, Transaction } from "../types";

export function useFilteredTransactions(): Transaction[] {
  const { transactions, selectedYear, selectedMonth } = useDream();
  return useMemo(
    () => transactions.filter((t) => isSamePeriod(t.date, selectedYear, selectedMonth)),
    [transactions, selectedYear, selectedMonth]
  );
}

export function useMonthTotals() {
  const filtered = useFilteredTransactions();
  return useMemo(() => {
    const sum = (type: Transaction["type"]) =>
      filtered.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
    const income = sum("income");
    const expense = sum("expense");
    const saving = sum("saving");
    const obligation = sum("obligation");
    return { income, expense, saving, obligation, balance: income - expense };
  }, [filtered]);
}

export function useSavingContributions(): Record<PersonId, number> {
  const filtered = useFilteredTransactions();
  return useMemo(() => {
    const totals: Record<PersonId, number> = { khuraza: 0, yusuf: 0 };
    filtered
      .filter((t) => t.type === "saving" && t.personId)
      .forEach((t) => {
        totals[t.personId as PersonId] += t.amount;
      });
    return totals;
  }, [filtered]);
}

export function useGoldSummary() {
  const { transactions } = useDream();
  return useMemo(() => {
    const goldTx = transactions.filter((t) => t.type === "gold");
    const totalGrams = goldTx.reduce((s, t) => s + (t.grams ?? 0), 0);
    return { totalGrams, estimatedValue: totalGrams * GOLD_PRICE_PER_GRAM };
  }, [transactions]);
}

export function useCategorySpend(): Map<string, number> {
  const filtered = useFilteredTransactions();
  return useMemo(() => {
    const map = new Map<string, number>();
    filtered
      .filter((t) => t.type === "expense" && t.categoryId)
      .forEach((t) => map.set(t.categoryId as string, (map.get(t.categoryId as string) ?? 0) + t.amount));
    return map;
  }, [filtered]);
}
