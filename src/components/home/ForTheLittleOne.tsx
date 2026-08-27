import { Link } from "react-router-dom";
import { Gem } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useGoldSummary } from "../../hooks/useFilteredTransactions";
import ProgressBar from "../common/ProgressBar";
import { formatCompact, formatGrams } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { METRIC_COLORS } from "../../lib/metricColors";
import { softCardGradient, softCardBorder, softIconBackground } from "../../lib/cardGradient";

export default function ForTheLittleOne() {
  const { goldTargetGrams } = useDream();
  const { totalGrams, estimatedValue } = useGoldSummary();
  const pct = goldTargetGrams > 0 ? Math.min(100, Math.round((totalGrams / goldTargetGrams) * 100)) : 0;

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">For the Little One</h2>
        <Link to="/app/goals" className="label-caps text-gold">
          Lihat semua
        </Link>
      </div>

      <Link
        to="/app/goals"
        className="block rounded-xl border p-4 transition active:scale-[0.98]"
        style={{ background: softCardGradient(METRIC_COLORS.gold), borderColor: softCardBorder(METRIC_COLORS.gold) }}
      >
        <div className="mb-2.5 flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: softIconBackground(METRIC_COLORS.gold) }}
          >
            <Gem size={20} style={{ color: METRIC_COLORS.gold }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="accent-serif text-sm italic text-ink/60">Menyiapkan masa depan, sedikit demi sedikit.</p>
          </div>
        </div>

        <div className="mb-1.5 flex items-center justify-between text-xs text-ink/70">
          <span className="font-semibold">{formatGrams(totalGrams)}</span>
          <span>{pct}%</span>
        </div>
        <ProgressBar value={pct} color={statusColorForPercent(pct)} />
        <p className="mt-2.5 text-[11px] text-muted">≈ {formatCompact(estimatedValue)}</p>
      </Link>
    </section>
  );
}
