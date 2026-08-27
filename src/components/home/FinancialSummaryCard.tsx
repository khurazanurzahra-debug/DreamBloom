import { Link } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Coins, Gem } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useMonthTotals, useGoldSummary } from "../../hooks/useFilteredTransactions";
import { formatCompact, formatGrams } from "../../lib/format";
import { METRIC_COLORS } from "../../lib/metricColors";
import { monthlyFlowTrend, cumulativeGramsTrend } from "../../lib/trend";
import { softCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";
import Chart from "../ui/Chart";

export default function FinancialSummaryCard() {
  const { transactions, selectedYear, selectedMonth } = useDream();
  const { income, expense, saving } = useMonthTotals();
  const { totalGrams } = useGoldSummary();

  // Each Financial Overview metric has a FIXED identity color (income=green, saving=purple,
  // gold=gold, expense=red) — never derived from statusColorForPercent() or a category color,
  // so unrelated metrics can never coincidentally collide onto the same hue.
  const stats = [
    {
      label: "Pemasukan Bulan Ini",
      value: formatCompact(income),
      icon: ArrowDownLeft,
      color: METRIC_COLORS.income,
      trend: monthlyFlowTrend(transactions, "income", selectedYear, selectedMonth),
      to: "/app/activity",
      state: { initialView: "all", initialTab: "income" },
    },
    {
      label: "Tabungan Bersama",
      value: formatCompact(saving),
      icon: Coins,
      color: METRIC_COLORS.saving,
      trend: monthlyFlowTrend(transactions, "saving", selectedYear, selectedMonth),
      to: "/app/goals",
      state: undefined,
    },
    {
      label: "Future Child",
      value: formatGrams(totalGrams),
      icon: Gem,
      color: METRIC_COLORS.gold,
      trend: cumulativeGramsTrend(transactions, selectedYear, selectedMonth),
      to: "/app/goals",
      state: undefined,
    },
    {
      label: "Pengeluaran Rumah Tangga",
      value: formatCompact(expense),
      icon: ArrowUpRight,
      color: METRIC_COLORS.expense,
      trend: monthlyFlowTrend(transactions, "expense", selectedYear, selectedMonth),
      to: "/app/activity",
      state: { initialView: "all", initialTab: "expense" },
    },
  ];

  return (
    <section className="card mb-5 rounded-2xl p-5">
      <p className="label-caps mb-3.5">Financial Overview</p>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            state={s.state}
            className="block rounded-xl border px-3 py-3 transition active:scale-[0.98]"
            style={{
              background: softCardGradient(s.color),
              borderColor: softCardBorder(s.color),
              boxShadow: softCardShadow(),
            }}
          >
            <div className="flex items-start gap-2.5">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: softIconBackground(s.color) }}
              >
                <s.icon size={22} style={{ color: s.color }} />
              </div>
              <div className="min-w-0">
                <p className="label-caps mb-0.5 leading-tight">{s.label}</p>
                <p className="truncate text-sm font-bold text-ink">{s.value}</p>
              </div>
            </div>
            <div className="mt-2">
              <Chart data={s.trend} color={s.color} height={40} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
