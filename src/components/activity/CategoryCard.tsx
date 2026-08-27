import { motion } from "framer-motion";
import type { Category } from "../../types";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";
import { formatCompact } from "../../lib/format";
import { budgetRemainingPct, statusColorForPercent, statusLabelForPercent } from "../../lib/status";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";

export default function CategoryCard({
  category,
  total,
  onClick,
  active = false,
}: {
  category: Category;
  total: number;
  onClick: () => void;
  active?: boolean;
}) {
  const budget = category.budgetAmount;
  const remainingPct = budget ? budgetRemainingPct(total, budget) : null;
  const statusColor = remainingPct !== null ? statusColorForPercent(remainingPct) : null;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`flex min-h-[144px] flex-col rounded-xl border p-4 text-left transition ${
        active ? "ring-2 ring-gold" : ""
      }`}
      style={{
        background: vividCardGradient(category.color),
        borderColor: softCardBorder(category.color, 28),
        boxShadow: softCardShadow(),
      }}
    >
      <div
        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full transition"
        style={{ backgroundColor: softIconBackground(category.color, 36) }}
      >
        <Icon name={category.icon} size={23} style={{ color: category.color }} />
      </div>
      <p className="mb-0.5 truncate text-sm font-semibold text-ink">{category.name}</p>
      <p className="mb-2 text-xs text-muted">
        {formatCompact(total)}
        {budget ? ` / ${formatCompact(budget)}` : ""}
      </p>
      <div className="mt-auto">
        {statusColor !== null && remainingPct !== null && (
          <>
            <ProgressBar value={100 - remainingPct} color={statusColor} />
            <p className="mt-1.5 text-[10px] font-semibold" style={{ color: statusColor }}>
              {statusLabelForPercent(remainingPct)}
            </p>
          </>
        )}
      </div>
    </motion.button>
  );
}
