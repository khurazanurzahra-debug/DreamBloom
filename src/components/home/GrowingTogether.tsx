import { Link } from "react-router-dom";
import { Coins } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useSavingContributions } from "../../hooks/useFilteredTransactions";
import ProgressBar from "../common/ProgressBar";
import MotivationBubble from "../common/MotivationBubble";
import { formatCompact } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { getMotivationMessage } from "../../lib/motivation";
import { METRIC_COLORS } from "../../lib/metricColors";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";

export default function GrowingTogether() {
  const { sharedSavingTarget, selectedYear, selectedMonth, activeProfile } = useDream();
  const contributions = useSavingContributions();
  const total = contributions.khuraza + contributions.yusuf;
  const pct = sharedSavingTarget > 0 ? Math.min(100, Math.round((total / sharedSavingTarget) * 100)) : 0;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;
  const daysToDeadline = isCurrentMonth
    ? new Date(selectedYear, selectedMonth, 0).getDate() - now.getDate()
    : null;
  const remainingLabel = formatCompact(Math.max(sharedSavingTarget - total, 0));
  const message = getMotivationMessage(pct, daysToDeadline, activeProfile?.name ?? "Khuraza", "growing-together", remainingLabel);

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">Growing Together</h2>
        <Link to="/app/goals" className="label-caps text-gold">
          Lihat semua
        </Link>
      </div>

      <Link
        to="/app/goals"
        className="block rounded-xl border p-4 transition active:scale-[0.98]"
        style={{
          background: vividCardGradient(METRIC_COLORS.saving),
          borderColor: softCardBorder(METRIC_COLORS.saving, 28),
          boxShadow: softCardShadow("lg"),
        }}
      >
        <div className="mb-2.5 flex items-center gap-2.5">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: softIconBackground(METRIC_COLORS.saving, 36) }}
          >
            <Coins size={22} style={{ color: METRIC_COLORS.saving }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="accent-serif text-sm italic text-ink/60">Tabungan yang tumbuh bersama langkah kami.</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-gold">{pct}%</span>
        </div>
        <ProgressBar value={pct} color={statusColorForPercent(pct)} />
        <p className="mt-2 text-[11px] text-muted">
          {formatCompact(total)} dari target {formatCompact(sharedSavingTarget)} bulan ini
        </p>
        <MotivationBubble message={message} />
      </Link>
    </section>
  );
}
