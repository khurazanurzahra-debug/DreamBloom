import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import type { Obligation } from "../../types";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function ObligationEditModal({
  obligation,
  onClose,
}: {
  obligation: Obligation | null;
  onClose: () => void;
}) {
  const { addObligation, updateObligation, deleteObligation } = useDream();
  const [name, setName] = useState(obligation?.name ?? "");
  const [monthlyAmount, setMonthlyAmount] = useState(obligation ? String(obligation.monthlyAmount) : "");
  const [totalMonths, setTotalMonths] = useState(obligation ? String(obligation.totalMonths) : "");
  const [startDate, setStartDate] = useState(obligation?.startDate ?? new Date().toISOString().slice(0, 10));
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !monthlyAmount || !totalMonths) return;
    const patch = {
      name: name.trim(),
      monthlyAmount: Number(monthlyAmount),
      totalMonths: Number(totalMonths),
      startDate,
    };
    if (obligation) updateObligation(obligation.id, patch);
    else addObligation(patch);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="glass relative z-10 w-full max-w-xl overflow-y-auto rounded-t-2xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{obligation ? "Ubah Kewajiban" : "Kewajiban Baru"}</h2>
          <IconButton aria-label="Tutup" size="sm" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>

        <label className="label-caps mb-1.5 block">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Pinjaman Koperasi"
          className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Jumlah per bulan (IDR)</label>
        <input
          value={monthlyAmount}
          onChange={(e) => setMonthlyAmount(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Durasi (bulan)</label>
        <input
          value={totalMonths}
          onChange={(e) => setTotalMonths(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Mulai</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="field mb-5 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <div className="flex gap-2.5">
          {obligation && (
            <IconButton
              variant="danger"
              shape="square"
              size="lg"
              aria-label="Hapus kewajiban"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={18} />
            </IconButton>
          )}
          <Button type="submit" fullWidth>
            {obligation ? "Simpan Perubahan" : "Tambah Kewajiban"}
          </Button>
        </div>
      </motion.form>

      <AnimatePresence>
        {confirmDelete && obligation && (
          <ConfirmDialog
            title="Hapus kewajiban?"
            message="Kewajiban ini akan dihapus secara permanen dan tidak dapat dikembalikan."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              deleteObligation(obligation.id);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
