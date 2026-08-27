import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Goal } from "../../types";
import { useDream } from "../../context/DreamContext";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";
import MotivationBubble from "../common/MotivationBubble";
import { formatCurrency, formatFullDate, formatCompact } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { getMotivationMessage } from "../../lib/motivation";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";

export default function GoalCard({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  const { activeProfile } = useDream();
  const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  const daysToDeadline = useMemo(
    () => Math.ceil((new Date(goal.targetDate + "T00:00:00").getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    [goal.targetDate]
  );
  const message = getMotivationMessage(
    pct,
    daysToDeadline,
    activeProfile?.name ?? "Khuraza",
    goal.id,
    formatCompact(remaining)
  );

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="w-full rounded-2xl border p-5 text-left"
      style={{
        background: vividCardGradient(goal.color),
        borderColor: softCardBorder(goal.color, 28),
        boxShadow: softCardShadow("lg"),
      }}
    >
      <div className="mb-4 flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: softIconBackground(goal.color, 36) }}
        >
          <Icon name={goal.icon} size={23} style={{ color: goal.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-ink">{goal.title}</p>
          <p className="accent-serif text-sm italic text-ink/50">{goal.subtitle}</p>
        </div>
        <span className="text-sm font-bold text-gold">{pct}%</span>
      </div>

      <ProgressBar value={pct} color={statusColorForPercent(pct)} />

      <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="label-caps mb-0.5">Saved</p>
          <p className="text-xs font-bold text-ink">{formatCurrency(goal.currentAmount)}</p>
        </div>
        <div>
          <p className="label-caps mb-0.5">Target</p>
          <p className="text-xs font-bold text-ink">{formatCurrency(goal.targetAmount)}</p>
        </div>
        <div>
          <p className="label-caps mb-0.5">Remaining</p>
          <p className="text-xs font-bold text-ink">{formatCurrency(remaining)}</p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-muted">By {formatFullDate(goal.targetDate)}</p>

      <MotivationBubble message={message} />
    </motion.button>
  );
}
