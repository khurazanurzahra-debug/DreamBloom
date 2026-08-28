import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import type { BudgetPeriod, Category } from "../../types";
import IconPicker from "../common/IconPicker";
import ColorSwatchPicker from "../common/ColorSwatchPicker";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import ConfirmDialog from "../ui/ConfirmDialog";
import { deterministicCategoryColor } from "../../lib/categoryColor";

const DEFAULT_COLOR = "#F3C9B4";

export default function CategoryEditModal({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const { addCategory, updateCategory, deleteCategory } = useDream();
  const [name, setName] = useState(category?.name ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "Sparkles");
  const [color, setColor] = useState(category?.color ?? DEFAULT_COLOR);
  const [budgetAmount, setBudgetAmount] = useState(
    category?.budgetAmount ? String(category.budgetAmount) : ""
  );
  const [budgetPeriod, setBudgetPeriod] = useState<BudgetPeriod>(category?.budgetPeriod ?? "monthly");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // TEMPORARY diagnostic — remove once selection is confirmed fixed.
  useEffect(() => {
    console.log("[DreamBloom icon state]", icon);
  }, [icon]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    // New categories the user never touched the swatch picker for get a deterministic
    // color based on their name instead of every new category sharing the same fixed
    // default — editing an existing category never runs this, so its color is untouched
    // unless the user explicitly changes it via the picker.
    const resolvedColor = !category && color === DEFAULT_COLOR ? deterministicCategoryColor(trimmedName) : color;
    const patch = {
      name: trimmedName,
      icon,
      color: resolvedColor,
      budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
      budgetPeriod: budgetAmount ? budgetPeriod : undefined,
    };
    if (category) {
      updateCategory(category.id, patch);
    } else {
      addCategory(patch);
    }
    onClose();
  }

  function handleDelete() {
    if (category) deleteCategory(category.id);
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
          <h2 className="text-lg font-bold text-ink">{category ? "Ubah Kategori" : "Kategori Baru"}</h2>
          <IconButton aria-label="Tutup" size="sm" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>

        <label className="label-caps mb-1.5 block">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="mis. Hiburan"
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

        <label className="label-caps mb-1.5 block">Budget (opsional)</label>
        <input
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric"
          placeholder="0"
          className="field mb-3 w-full rounded-xl px-3.5 py-3 text-sm"
        />

        {budgetAmount && (
          <div className="mb-5 flex rounded-xl bg-ink/[0.05] p-1">
            {(["daily", "monthly"] as BudgetPeriod[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setBudgetPeriod(p)}
                className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                  budgetPeriod === p ? "bg-white text-ink shadow-sm" : "text-muted"
                }`}
              >
                {p === "daily" ? "Harian" : "Bulanan"}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2.5">
          {category && (
            <IconButton
              variant="danger"
              shape="square"
              size="lg"
              onClick={() => setConfirmDelete(true)}
              aria-label="Hapus kategori"
            >
              <Trash2 size={18} />
            </IconButton>
          )}
          <Button type="submit" fullWidth>
            {category ? "Simpan Perubahan" : "Tambah Kategori"}
          </Button>
        </div>
      </motion.form>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="Hapus kategori?"
            message="Kategori ini akan dihapus. Transaksi yang sudah tercatat tidak akan hilang, tapi tidak lagi dikelompokkan ke kategori ini."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
