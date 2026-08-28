import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import type { Goal } from "../../types";
import IconPicker from "../common/IconPicker";
import ColorSwatchPicker from "../common/ColorSwatchPicker";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function GoalEditModal({ goal, onClose }: { goal: Goal | null; onClose: () => void }) {
  const { addGoal, updateGoal, deleteGoal } = useDream();
  const [title, setTitle] = useState(goal?.title ?? "");
  const [subtitle, setSubtitle] = useState(goal?.subtitle ?? "");
  const [icon, setIcon] = useState(goal?.icon ?? "Target");
  const [color, setColor] = useState(goal?.color ?? "#BFD3BC");
  const [targetAmount, setTargetAmount] = useState(goal ? String(goal.targetAmount) : "");
  const [currentAmount, setCurrentAmount] = useState(goal ? String(goal.currentAmount) : "0");
  const [targetDate, setTargetDate] = useState(goal?.targetDate ?? "2027-01-01");
  const [notes, setNotes] = useState(goal?.notes ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // TEMPORARY diagnostic — remove once selection is confirmed fixed.
  useEffect(() => {
    console.log("[DreamBloom icon state]", icon);
  }, [icon]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !targetAmount) return;
    const patch = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      icon,
      color,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount) || 0,
      targetDate,
      notes: notes.trim() || undefined,
    };
    if (goal) updateGoal(goal.id, patch);
    else addGoal(patch);
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
        className="glass relative z-10 max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-2xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">{goal ? "Ubah Target" : "Target Baru"}</h2>
          <IconButton aria-label="Tutup" size="sm" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>

        <label className="label-caps mb-1.5 block">Nama</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="mis. Dana Darurat"
          className="field mb-3 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Deskripsi singkat</label>
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="mis. Ketenangan untuk hal tak terduga"
          className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Ikon</label>
        <div className="mb-4">
          <IconPicker value={icon} onChange={setIcon} />
        </div>

        <label className="label-caps mb-1.5 block">Warna</label>
        <div className="mb-4">
          <ColorSwatchPicker value={color} onChange={setColor} />
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div>
            <label className="label-caps mb-1.5 block">Terkumpul</label>
            <input
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className="field w-full rounded-xl px-3.5 py-3 text-sm"
            />
          </div>
          <div>
            <label className="label-caps mb-1.5 block">Target</label>
            <input
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              className="field w-full rounded-xl px-3.5 py-3 text-sm"
            />
          </div>
        </div>

        <label className="label-caps mb-1.5 block">Target tanggal</label>
        <input
          type="date"
          value={targetDate}
          onChange={(e) => setTargetDate(e.target.value)}
          className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        <label className="label-caps mb-1.5 block">Catatan (opsional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="field mb-5 w-full resize-none rounded-xl px-3.5 py-2.5 text-sm"
        />

        <div className="flex gap-2.5">
          {goal && (
            <IconButton
              variant="danger"
              shape="square"
              size="lg"
              aria-label="Hapus target"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={18} />
            </IconButton>
          )}
          <Button type="submit" fullWidth>
            {goal ? "Simpan Perubahan" : "Tambah Target"}
          </Button>
        </div>
      </motion.form>

      <AnimatePresence>
        {confirmDelete && goal && (
          <ConfirmDialog
            title="Hapus target?"
            message="Target ini akan dihapus secara permanen dan tidak dapat dikembalikan."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={() => {
              deleteGoal(goal.id);
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
