import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Gem, Pencil, Plus } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useFilteredTransactions, useGoldSummary } from "../../hooks/useFilteredTransactions";
import { GOLD_PRICE_PER_GRAM } from "../../lib/mockData";
import ProgressBar from "../common/ProgressBar";
import MotivationBubble from "../common/MotivationBubble";
import AddSheet from "../addsheet/AddSheet";
import { formatCompact, formatGrams, formatDateID } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { getMotivationMessage } from "../../lib/motivation";
import { METRIC_COLORS } from "../../lib/metricColors";
import { softCardGradient, softCardBorder, softIconBackground } from "../../lib/cardGradient";
import Button from "../ui/Button";

export default function GoldCard() {
  const { transactions, activeProfile, goldTargetGrams, setGoldTargetGrams } = useDream();
  const filtered = useFilteredTransactions();
  const { totalGrams, estimatedValue } = useGoldSummary();
  // Actual grams always come from real gold-type transactions (useGoldSummary); the target
  // is a manually-entered value from the user, never derived/fabricated. progress = actual / target.
  const pct = goldTargetGrams > 0 ? Math.min(100, Math.round((totalGrams / goldTargetGrams) * 100)) : 0;
  const [addOpen, setAddOpen] = useState(false);

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(goldTargetGrams));

  const depositedThisMonth = filtered.some((t) => t.type === "gold");
  const message = depositedThisMonth
    ? getMotivationMessage(100, null, activeProfile?.name ?? "Yusuf", "gold-saving")
    : null;

  const deposits = transactions
    .filter((t) => t.type === "gold")
    .sort((a, b) => b.date.localeCompare(a.date));

  function saveTarget() {
    const v = Number(targetInput);
    if (v > 0) setGoldTargetGrams(v);
    setEditingTarget(false);
  }

  return (
    <section
      className="mb-4 rounded-2xl border p-5"
      style={{ background: softCardGradient(METRIC_COLORS.gold), borderColor: softCardBorder(METRIC_COLORS.gold) }}
    >
      <div className="mb-1 flex items-start gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: softIconBackground(METRIC_COLORS.gold) }}
        >
          <Gem size={22} style={{ color: METRIC_COLORS.gold }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-ink">For the Little One</h2>
          <p className="accent-serif text-sm italic text-ink/50">
            Menyiapkan masa depan, sedikit demi sedikit.
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-gold">{pct}%</span>
      </div>

      <div className="my-3">
        <ProgressBar value={pct} color={statusColorForPercent(pct)} />
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span className="font-semibold text-ink">{formatGrams(totalGrams)}</span>
        <span>≈ {formatCompact(estimatedValue)}</span>
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>terkumpul</span>
        {editingTarget ? (
          <div className="flex items-center gap-1.5">
            <input
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value.replace(/[^\d.]/g, ""))}
              inputMode="decimal"
              autoFocus
              className="field w-20 rounded-md px-2 py-1 text-xs"
            />
            <span className="text-[11px] text-muted">gram</span>
            <button type="button" onClick={saveTarget} className="text-xs font-semibold text-gold transition active:scale-95">
              Simpan
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTargetInput(String(goldTargetGrams));
              setEditingTarget(true);
            }}
            className="flex items-center gap-1 text-xs font-medium text-ink/60 transition active:scale-95"
          >
            Target {formatGrams(goldTargetGrams)} · ≈ {formatCompact(goldTargetGrams * GOLD_PRICE_PER_GRAM)}
            <Pencil size={11} />
          </button>
        )}
      </div>

      {deposits.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {deposits.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border bg-ivory/60 px-3 py-2.5 text-xs">
              <div>
                <p className="font-semibold text-ink">{formatGrams(d.grams ?? 0)}</p>
                <p className="text-muted">{formatDateID(d.date)}{d.note ? ` · ${d.note}` : ""}</p>
              </div>
              <p className="font-semibold text-ink/70">{formatCompact(d.amount)}</p>
            </div>
          ))}
        </div>
      )}

      <MotivationBubble message={message} />

      <Button variant="secondary" size="sm" fullWidth icon={<Plus size={14} />} onClick={() => setAddOpen(true)} className="mt-3.5">
        Tambah setoran emas
      </Button>

      <AnimatePresence>{addOpen && <AddSheet initialType="gold" onClose={() => setAddOpen(false)} />}</AnimatePresence>
    </section>
  );
}
