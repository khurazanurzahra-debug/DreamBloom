import { Link } from "react-router-dom";
import { useDream } from "../../context/DreamContext";
import { useFilteredTransactions } from "../../hooks/useFilteredTransactions";
import { getBudgetDescription } from "../../lib/reminder";
import { formatCompact } from "../../lib/format";
import { budgetRemainingPct, statusColorForPercent, statusLabelForPercent } from "../../lib/status";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";

const BUDGET_CATEGORY_IDS = ["makan", "bensin", "cash"];

export default function TodayBudget() {
  const { categories } = useDream();
  const filtered = useFilteredTransactions();

  const todayIso = new Date().toISOString().slice(0, 10);
  // The curated 3 (Makan/Bensin/Cash) stay exactly as before — but a custom category
  // with a budget was previously never eligible here at all, regardless of having a
  // perfectly valid color, purely because its id wasn't in this hardcoded list.
  const items = categories.filter((c) => (BUDGET_CATEGORY_IDS.includes(c.id) || c.isCustom) && c.budgetAmount);
  if (items.length === 0) return null;

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">Budget Hari Ini</h2>
        <Link to="/app/more/categories" className="label-caps text-gold">
          Kelola
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((c) => {
          const budget = c.budgetAmount ?? 0;
          const spent =
            c.budgetPeriod === "daily"
              ? filtered.filter((t) => t.categoryId === c.id && t.type === "expense" && t.date === todayIso)
                  .reduce((s, t) => s + t.amount, 0)
              : filtered.filter((t) => t.categoryId === c.id && t.type === "expense")
                  .reduce((s, t) => s + t.amount, 0);
          const description = getBudgetDescription(c.id);
          const remainingPct = budgetRemainingPct(spent, budget);
          const statusColor = statusColorForPercent(remainingPct);
          const remaining = Math.max(budget - spent, 0);

          return (
            <Link
              key={c.id}
              to="/app/activity"
              state={{ initialView: "category", initialCategoryId: c.id }}
              className="block w-full rounded-xl border px-4 py-3.5 text-left transition active:scale-[0.99]"
              style={{
                background: vividCardGradient(c.color),
                borderColor: softCardBorder(c.color, 28),
                boxShadow: softCardShadow(),
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: softIconBackground(c.color, 36) }}
                  >
                    <Icon name={c.icon} size={22} style={{ color: c.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {c.name} · {formatCompact(budget)}
                      <span className="text-muted"> /{c.budgetPeriod === "daily" ? "hari" : "bulan"}</span>
                    </p>
                    {description && <p className="mt-0.5 truncate text-[11px] text-muted">{description}</p>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-ink">{formatCompact(remaining)}</p>
                  <p className="text-[10px] font-semibold" style={{ color: statusColor }}>
                    {statusLabelForPercent(remainingPct)}
                  </p>
                </div>
              </div>

              <div className="mt-2.5">
                <ProgressBar value={100 - remainingPct} color={statusColor} />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
