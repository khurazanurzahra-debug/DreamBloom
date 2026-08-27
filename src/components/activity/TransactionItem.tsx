import type { Category, PersonProfile, Transaction } from "../../types";
import Icon from "../common/Icon";
import { formatCurrency, formatGrams } from "../../lib/format";
import { METRIC_COLORS } from "../../lib/metricColors";
import { softIconBackground } from "../../lib/cardGradient";

const TYPE_ICON: Record<Transaction["type"], string> = {
  income: "ArrowDownLeft",
  expense: "ArrowUpRight",
  saving: "Coins",
  gold: "Gem",
  obligation: "Landmark",
};

export default function TransactionItem({
  transaction,
  category,
  person,
  onClick,
}: {
  transaction: Transaction;
  category?: Category;
  person?: PersonProfile;
  onClick: () => void;
}) {
  const isPositive = transaction.type === "income" || transaction.type === "gold";
  const icon = category?.icon ?? TYPE_ICON[transaction.type];
  // Expense transactions carry their category's identity color; every other type
  // (income/saving/gold/obligation) uses its fixed metric identity color instead.
  const tint = category?.color ?? METRIC_COLORS[transaction.type === "expense" ? "expense" : transaction.type];

  const subtitleParts: string[] = [];
  if (transaction.type === "expense") subtitleParts.push(category?.name ?? "Lainnya");
  if (person) subtitleParts.push(person.name);
  if (transaction.type === "gold" && transaction.grams) subtitleParts.push(formatGrams(transaction.grams));
  if (transaction.type === "obligation") subtitleParts.push("Kewajiban");
  if (transaction.type === "saving") subtitleParts.push("Tabungan");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-ink/[0.06] py-3 text-left last:border-0"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: softIconBackground(tint, 28) }}
      >
        <Icon name={icon} size={16} style={{ color: tint }} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink">{transaction.name}</p>
        <p className="truncate text-[11px] text-muted">{subtitleParts.join(" · ") || "—"}</p>
      </div>

      <p className={`shrink-0 text-sm font-bold ${isPositive ? "text-emerald-600" : "text-ink"}`}>
        {isPositive ? "+" : "−"}
        {formatCurrency(transaction.amount).replace("-", "")}
      </p>
    </button>
  );
}
