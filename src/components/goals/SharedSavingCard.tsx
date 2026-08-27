import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Pencil, Coins, Plus } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useSavingContributions } from "../../hooks/useFilteredTransactions";
import ProgressBar from "../common/ProgressBar";
import MotivationBubble from "../common/MotivationBubble";
import AddSheet from "../addsheet/AddSheet";
import { formatCurrency, formatCompact } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { getMotivationMessage } from "../../lib/motivation";
import { METRIC_COLORS } from "../../lib/metricColors";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";
import Button from "../ui/Button";

export default function SharedSavingCard() {
  const { profiles, sharedSavingTarget, setSharedSavingTarget, selectedYear, selectedMonth, activeProfile } = useDream();
  const contributions = useSavingContributions();
  const total = contributions.khuraza + contributions.yusuf;
  const pct = sharedSavingTarget > 0 ? Math.min(100, Math.round((total / sharedSavingTarget) * 100)) : 0;

  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState(String(sharedSavingTarget));
  const [addOpen, setAddOpen] = useState(false);

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === selectedYear && now.getMonth() + 1 === selectedMonth;
  const daysToDeadline = isCurrentMonth
    ? new Date(selectedYear, selectedMonth, 0).getDate() - now.getDate()
    : null;
  const remainingLabel = formatCompact(Math.max(sharedSavingTarget - total, 0));
  const message = getMotivationMessage(pct, daysToDeadline, activeProfile?.name ?? "Khuraza", "shared-saving", remainingLabel);

  function saveTarget() {
    const v = Number(targetInput);
    if (v > 0) setSharedSavingTarget(v);
    setEditingTarget(false);
  }

  return (
    <section
      className="mb-4 rounded-2xl border p-5"
      style={{
        background: vividCardGradient(METRIC_COLORS.saving),
        borderColor: softCardBorder(METRIC_COLORS.saving, 28),
        boxShadow: softCardShadow("lg"),
      }}
    >
      <div className="mb-1 flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: softIconBackground(METRIC_COLORS.saving, 36) }}
        >
          <Coins size={23} style={{ color: METRIC_COLORS.saving }} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-ink">Growing Together</h2>
          <p className="accent-serif text-sm italic text-ink/50">
            Tabungan yang tumbuh bersama langkah kami.
          </p>
        </div>
        <span className="shrink-0 text-sm font-bold text-gold">{pct}%</span>
      </div>

      <div className="my-3">
        <ProgressBar value={pct} color={statusColorForPercent(pct)} />
      </div>

      <div className="mb-1 flex items-center justify-between text-xs text-muted">
        <span>{formatCurrency(total)} terkumpul bulan ini</span>
        {editingTarget ? (
          <div className="flex items-center gap-1.5">
            <input
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              autoFocus
              className="field w-28 rounded-md px-2 py-1 text-xs"
            />
            <button type="button" onClick={saveTarget} className="text-xs font-semibold text-gold transition active:scale-95">
              Simpan
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              setTargetInput(String(sharedSavingTarget));
              setEditingTarget(true);
            }}
            className="flex items-center gap-1 text-xs font-medium text-ink/60 transition active:scale-95"
          >
            Target {formatCurrency(sharedSavingTarget)}
            <Pencil size={11} />
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {profiles.map((p) => (
          <div key={p.id} className="rounded-xl border border-border bg-ivory/60 px-3 py-2.5">
            <p className="label-caps mb-0.5">{p.name}</p>
            <p className="text-sm font-bold text-ink">{formatCurrency(contributions[p.id])}</p>
          </div>
        ))}
      </div>

      <MotivationBubble message={message} />

      <Button variant="secondary" size="sm" fullWidth icon={<Plus size={14} />} onClick={() => setAddOpen(true)} className="mt-3.5">
        Tambah setoran
      </Button>

      <AnimatePresence>{addOpen && <AddSheet initialType="saving" onClose={() => setAddOpen(false)} />}</AnimatePresence>
    </section>
  );
}
