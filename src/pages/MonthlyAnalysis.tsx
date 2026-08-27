import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowDownLeft, ArrowUpRight, Coins, Gem, Landmark } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import MonthYearPicker from "../components/common/MonthYearPicker";
import ProgressBar from "../components/common/ProgressBar";
import Chart from "../components/ui/Chart";
import Icon from "../components/common/Icon";
import { useDream } from "../context/DreamContext";
import { useCategorySpend, useFilteredTransactions, useMonthTotals } from "../hooks/useFilteredTransactions";
import { isSamePeriod } from "../lib/dateFilter";
import { formatCompact } from "../lib/format";
import {
  budgetRemainingPct,
  statusColorForPercent,
  statusLabelForPercent,
  statusLevelForPercent,
  type StatusLevel,
} from "../lib/status";
import { METRIC_COLORS } from "../lib/metricColors";
import { softCardGradient, softCardBorder, softIconBackground } from "../lib/cardGradient";
import { monthlyFlowTrend, cumulativeGramsTrend } from "../lib/trend";

const OVERALL_COPY: Record<StatusLevel, { emoji: string; text: string }> = {
  green: { emoji: "🟢", text: "Keuanganmu masih dalam perjalanan yang baik." },
  gold: { emoji: "🟡", text: "Sebagian alokasi mulai terpakai, tapi masih terkendali." },
  coral: { emoji: "🔴", text: "Beberapa anggaran mulai menipis bulan ini." },
};

export default function MonthlyAnalysis() {
  const navigate = useNavigate();
  const { categories, transactions, selectedYear, selectedMonth } = useDream();
  const { income, expense, saving, obligation } = useMonthTotals();
  const filtered = useFilteredTransactions();
  const categorySpend = useCategorySpend();

  const goldValueThisMonth = useMemo(
    () => filtered.filter((t) => t.type === "gold").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const prevExpense = useMemo(() => {
    let y = selectedYear;
    let m = selectedMonth - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    return transactions
      .filter((t) => t.type === "expense" && isSamePeriod(t.date, y, m))
      .reduce((s, t) => s + t.amount, 0);
  }, [transactions, selectedYear, selectedMonth]);

  const makanCategory = categories.find((c) => c.id === "makan");
  const makanSpent = categorySpend.get("makan") ?? 0;
  const makanBudget = makanCategory?.budgetAmount ? makanCategory.budgetAmount * 30 : null;

  const insights: string[] = [];
  if (income > 0) {
    insights.push(
      expense + saving <= income
        ? "Sebagian besar pemasukan bulan ini sudah dialokasikan untuk kebutuhan utama dan tabungan."
        : "Pengeluaran bulan ini mendekati atau melebihi pemasukan — mungkin saat yang baik untuk meninjau alokasi bersama."
    );
  }
  if (makanBudget && makanSpent <= makanBudget) {
    insights.push("Pengeluaran makan bulan ini masih berada dalam batas yang kamu tentukan.");
  }
  if (prevExpense > 0 && expense < prevExpense) {
    insights.push("Pengeluaran bulan ini terlihat lebih rendah dibanding bulan sebelumnya.");
  }

  const householdBudget = categories.reduce((sum, c) => {
    if (!c.budgetAmount) return sum;
    return sum + (c.budgetPeriod === "daily" ? c.budgetAmount * 30 : c.budgetAmount);
  }, 0);
  const overallLevel: StatusLevel | null =
    householdBudget > 0 ? statusLevelForPercent(budgetRemainingPct(expense, householdBudget)) : null;

  const summaryCards = [
    {
      key: "income",
      label: "Pemasukan",
      value: income,
      icon: ArrowDownLeft,
      color: METRIC_COLORS.income as string,
      trend: monthlyFlowTrend(transactions, "income", selectedYear, selectedMonth),
    },
    {
      key: "expense",
      label: "Pengeluaran",
      value: expense,
      icon: ArrowUpRight,
      color: METRIC_COLORS.expense,
      trend: monthlyFlowTrend(transactions, "expense", selectedYear, selectedMonth),
    },
    {
      key: "saving",
      label: "Tabungan Bersama",
      value: saving,
      icon: Coins,
      color: METRIC_COLORS.saving,
      trend: monthlyFlowTrend(transactions, "saving", selectedYear, selectedMonth),
    },
    {
      key: "gold",
      label: "Tabungan Emas",
      value: goldValueThisMonth,
      icon: Gem,
      color: METRIC_COLORS.gold,
      trend: cumulativeGramsTrend(transactions, selectedYear, selectedMonth),
    },
  ];
  if (obligation > 0) {
    summaryCards.push({
      key: "obligation",
      label: "Kewajiban",
      value: obligation,
      icon: Landmark,
      color: METRIC_COLORS.obligation,
      trend: monthlyFlowTrend(transactions, "obligation", selectedYear, selectedMonth),
    });
  }

  return (
    <AppShell>
      <div className="-mx-4 px-5 sm:-mx-6">
        <Header
          title="Monthly Analysis"
          subtitle="Melihat perjalanan finansial bulan ini."
          onBack={() => navigate("/app/more")}
          right={<MonthYearPicker />}
        />

        <section className="card mb-5 rounded-2xl p-5">
          <p className="label-caps mb-3.5">Ringkasan</p>
          <div className="grid grid-cols-2 gap-3">
            {summaryCards.map((s) => (
              <div
                key={s.key}
                className="rounded-xl border px-3 py-3"
                style={{ background: softCardGradient(s.color), borderColor: softCardBorder(s.color) }}
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
                    <p className="truncate text-sm font-bold text-ink">{formatCompact(s.value)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <Chart data={s.trend} color={s.color} height={40} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {overallLevel && (
          <section className="card mb-5 rounded-2xl p-5">
            <p className="label-caps mb-2.5">Perjalanan Bulan Ini</p>
            <div className="flex items-center gap-2.5">
              <span className="text-lg leading-none">{OVERALL_COPY[overallLevel].emoji}</span>
              <p className="accent-serif italic text-[15px] text-ink/80">{OVERALL_COPY[overallLevel].text}</p>
            </div>
          </section>
        )}

        <section className="card mb-5 rounded-2xl p-5">
          <p className="label-caps mb-3.5">Kategori Pengeluaran</p>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c) => {
              const spent = categorySpend.get(c.id) ?? 0;
              const budget = c.budgetAmount;
              const remainingPct = budget ? budgetRemainingPct(spent, budget) : null;
              const statusColor = remainingPct !== null ? statusColorForPercent(remainingPct) : null;
              return (
                <div
                  key={c.id}
                  className="rounded-xl border p-3"
                  style={{ background: softCardGradient(c.color), borderColor: softCardBorder(c.color) }}
                >
                  <div
                    className="mb-2 flex h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: softIconBackground(c.color, 28) }}
                  >
                    <Icon name={c.icon} size={22} style={{ color: c.color }} />
                  </div>
                  <p className="truncate text-sm font-semibold text-ink">{c.name}</p>
                  <p className="mb-2 text-xs text-muted">
                    {formatCompact(spent)}
                    {budget ? ` / ${formatCompact(budget)}` : ""}
                  </p>
                  {statusColor !== null && remainingPct !== null && (
                    <>
                      <ProgressBar value={100 - remainingPct} color={statusColor} />
                      <p className="mt-1.5 text-[10px] font-semibold" style={{ color: statusColor }}>
                        {statusLabelForPercent(remainingPct)}
                      </p>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {insights.length > 0 && (
          <section className="glass-tint rounded-2xl p-5" style={{ ["--tint" as string]: "#D9CFE8" }}>
            <p className="label-caps mb-2.5">Catatan Lembut</p>
            <div className="flex flex-col gap-2">
              {insights.slice(0, 3).map((text) => (
                <p key={text} className="accent-serif text-[13px] italic leading-snug" style={{ color: "#8B5CF6" }}>
                  {text}
                </p>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
