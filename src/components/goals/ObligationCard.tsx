import { Landmark, CheckCircle2 } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import ProgressBar from "../common/ProgressBar";
import { formatCurrency } from "../../lib/format";
import { statusColorForPercent } from "../../lib/status";
import { METRIC_COLORS } from "../../lib/metricColors";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";
import type { Obligation } from "../../types";
import Button from "../ui/Button";

export default function ObligationCard({
  obligation,
  onEdit,
}: {
  obligation: Obligation;
  onEdit: () => void;
}) {
  const { recordObligationPayment, selectedYear, selectedMonth } = useDream();
  const pct = Math.round((obligation.paidMonths / obligation.totalMonths) * 100);
  const remainingMonths = Math.max(obligation.totalMonths - obligation.paidMonths, 0);
  const isSettled = remainingMonths === 0;

  function handlePay() {
    const day = String(new Date().getDate()).padStart(2, "0");
    recordObligationPayment(obligation.id, `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${day}`);
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{
        background: vividCardGradient(METRIC_COLORS.obligation),
        borderColor: softCardBorder(METRIC_COLORS.obligation, 28),
        boxShadow: softCardShadow("lg"),
      }}
    >
      <button type="button" onClick={onEdit} className="mb-3 flex w-full items-start gap-3 text-left">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: softIconBackground(METRIC_COLORS.obligation, 36) }}
        >
          <Landmark size={23} style={{ color: METRIC_COLORS.obligation }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-ink">{obligation.name}</p>
          <p className="text-xs text-muted">{formatCurrency(obligation.monthlyAmount)} / bulan</p>
        </div>
        <span className="text-sm font-bold text-gold">{pct}%</span>
      </button>

      <ProgressBar value={pct} color={statusColorForPercent(pct)} />

      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <span>
          {obligation.paidMonths} dari {obligation.totalMonths} bulan terbayar
        </span>
        <span>{isSettled ? "Lunas" : `${remainingMonths} bulan tersisa`}</span>
      </div>

      {!isSettled && (
        <Button variant="secondary" size="sm" fullWidth icon={<CheckCircle2 size={14} />} onClick={handlePay} className="mt-3.5">
          Tandai lunas bulan ini
        </Button>
      )}
    </div>
  );
}
