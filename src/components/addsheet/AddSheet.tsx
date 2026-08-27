import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight, ArrowDownLeft, Coins, Gem, Landmark, Trash2, ChevronLeft } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import type { PersonId, Transaction, TransactionType } from "../../types";
import { INCOME_CATEGORY_NAMES, GOLD_PRICE_PER_GRAM } from "../../lib/mockData";
import { METRIC_COLORS } from "../../lib/metricColors";
import { softIconBackground, softCardShadow } from "../../lib/cardGradient";
import Icon from "../common/Icon";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import ConfirmDialog from "../ui/ConfirmDialog";

const TYPE_META: { type: TransactionType; label: string; description: string; icon: typeof ArrowUpRight; tint: string }[] = [
  { type: "expense", label: "Pengeluaran", description: "Belanja & pengeluaran harian", icon: ArrowUpRight, tint: METRIC_COLORS.expense },
  { type: "income", label: "Pemasukan", description: "Gaji, bonus, dan lainnya", icon: ArrowDownLeft, tint: METRIC_COLORS.income },
  { type: "saving", label: "Tabungan", description: "Setoran tabungan bersama", icon: Coins, tint: METRIC_COLORS.saving },
  { type: "gold", label: "Emas", description: "Setoran tabungan emas", icon: Gem, tint: METRIC_COLORS.gold },
  { type: "obligation", label: "Kewajiban", description: "Cicilan & pembayaran rutin", icon: Landmark, tint: METRIC_COLORS.obligation },
];

export default function AddSheet({
  onClose,
  editTransaction,
  initialType,
}: {
  onClose: () => void;
  editTransaction?: Transaction;
  initialType?: TransactionType;
}) {
  const {
    categories,
    profiles,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recordObligationPayment,
    obligations,
    selectedYear,
    selectedMonth,
  } = useDream();

  const [type, setType] = useState<TransactionType | null>(editTransaction?.type ?? initialType ?? null);
  const isEdit = Boolean(editTransaction);

  const today = new Date();
  const defaultDay = Math.min(
    today.getFullYear() === selectedYear && today.getMonth() + 1 === selectedMonth
      ? today.getDate()
      : 1,
    28
  );
  const defaultIsoDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(
    defaultDay
  ).padStart(2, "0")}`;

  const [name, setName] = useState(editTransaction?.name ?? "");
  const [amount, setAmount] = useState(editTransaction ? String(editTransaction.amount) : "");
  const [categoryId, setCategoryId] = useState(editTransaction?.categoryId ?? categories[0]?.id ?? "");
  const [personId, setPersonId] = useState<PersonId | "">(editTransaction?.personId ?? "");
  const [date, setDate] = useState(editTransaction?.date ?? defaultIsoDate);
  const [grams, setGrams] = useState(editTransaction?.grams ? String(editTransaction.grams) : "");
  const [note, setNote] = useState(editTransaction?.note ?? "");
  const [obligationId, setObligationId] = useState(editTransaction?.obligationId ?? obligations[0]?.id ?? "");

  // New obligation payments default the amount to the selected obligation's
  // monthlyAmount, so pressing Simpan without touching the dropdown still works.
  useEffect(() => {
    if (isEdit || type !== "obligation") return;
    const ob = obligations.find((o) => o.id === obligationId);
    if (ob) setAmount(String(ob.monthlyAmount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function handleGramsChange(v: string) {
    const cleaned = v.replace(/[^\d.]/g, "");
    setGrams(cleaned);
    const g = Number(cleaned);
    if (g > 0) setAmount(String(Math.round(g * GOLD_PRICE_PER_GRAM)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) return;
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    if (type === "obligation" && !isEdit) {
      if (!obligationId) return;
      recordObligationPayment(obligationId, date);
      onClose();
      return;
    }

    if (type === "expense" && (!name.trim() || !categoryId)) return;
    if (type === "income" && (!name.trim() || !personId)) return;
    if (type === "saving" && !personId) return;
    if (type === "gold" && !(Number(grams) > 0)) return;

    const payload: Omit<Transaction, "id"> = {
      type,
      name:
        type === "saving" ? "Tabungan Bersama" : type === "gold" ? "Tabungan Emas" : name.trim(),
      amount: parsedAmount,
      date,
      categoryId: type === "expense" ? categoryId : undefined,
      personId: personId || undefined,
      grams: type === "gold" ? Number(grams) : undefined,
      note: type === "gold" ? note.trim() || undefined : undefined,
      obligationId: type === "obligation" ? obligationId : undefined,
    };

    if (isEdit && editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    onClose();
  }

  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDelete() {
    if (editTransaction) deleteTransaction(editTransaction.id);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="glass relative z-10 max-h-[88vh] w-full max-w-xl overflow-y-auto rounded-t-2xl px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type && !isEdit && (
              <button
                type="button"
                aria-label="Kembali"
                onClick={() => setType(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            <h2 className="text-lg font-bold text-ink">
              {isEdit ? "Ubah Transaksi" : type ? TYPE_META.find((m) => m.type === type)?.label : "Tambah Baru"}
            </h2>
          </div>
          <button type="button" aria-label="Tutup" onClick={onClose} className="text-muted">
            <X size={20} />
          </button>
        </div>

        {!type && (
          <div className="grid grid-cols-3 gap-2.5 pb-2">
            {TYPE_META.map((m) => (
              <motion.button
                key={m.type}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.15 }}
                onClick={() => setType(m.type)}
                className="flex flex-col items-center gap-2 rounded-xl border px-2 py-4 text-center text-xs font-semibold text-ink"
                style={{
                  backgroundColor: softIconBackground(m.tint, 20),
                  borderColor: softIconBackground(m.tint, 28),
                  boxShadow: softCardShadow(),
                }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: softIconBackground(m.tint, 38) }}
                >
                  <m.icon size={22} style={{ color: m.tint }} />
                </div>
                {m.label}
                <p className="-mt-1 text-[9px] font-normal leading-tight text-muted">{m.description}</p>
              </motion.button>
            ))}
          </div>
        )}

        {type && (
          <form onSubmit={handleSubmit}>
            {(type === "expense" || type === "income") && (
              <>
                <label className="label-caps mb-1.5 block">Nama</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={type === "income" ? "mis. Gaji Pokok" : "mis. Belanja mingguan"}
                  className="field mb-3 w-full rounded-xl px-3.5 py-3 text-sm"
                />
                {type === "income" && (
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {INCOME_CATEGORY_NAMES.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setName(n)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                          name === n ? "bg-ink text-white" : "bg-ivory text-ink/70"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <label className="label-caps mb-1.5 block">
              {type === "gold" ? "Nilai Rupiah" : "Jumlah (IDR)"}
            </label>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="0"
              readOnly={type === "obligation"}
              className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
            />

            {type === "expense" && (
              <>
                <label className="label-caps mb-1.5 block">Kategori</label>
                <div className="mb-4 grid grid-cols-3 gap-2">
                  {categories.map((c) => (
                    <motion.button
                      key={c.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setCategoryId(c.id)}
                      className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[11px] transition ${
                        categoryId === c.id ? "border-gold bg-champagne/40" : "border-border bg-ivory"
                      }`}
                    >
                      <Icon name={c.icon} size={17} className="text-ink/70" />
                      {c.name}
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {(type === "income" || type === "saving" || type === "expense") && (
              <>
                <label className="label-caps mb-1.5 block">
                  {type === "expense" ? "Untuk siapa (opsional)" : "Untuk siapa"}
                </label>
                <div className="mb-4 flex gap-2">
                  {type === "expense" && (
                    <PersonChip label="Bersama" active={personId === ""} onClick={() => setPersonId("")} />
                  )}
                  {profiles.map((p) => (
                    <PersonChip
                      key={p.id}
                      label={p.name}
                      active={personId === p.id}
                      onClick={() => setPersonId(p.id)}
                    />
                  ))}
                </div>
              </>
            )}

            {type === "gold" && (
              <>
                <label className="label-caps mb-1.5 block">Berat (gram)</label>
                <input
                  value={grams}
                  onChange={(e) => handleGramsChange(e.target.value)}
                  inputMode="decimal"
                  placeholder="0.000"
                  className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
                />
                <label className="label-caps mb-1.5 block">Catatan (opsional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="mis. Cicilan emas bulanan"
                  className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
                />
              </>
            )}

            {type === "obligation" && (
              <>
                <label className="label-caps mb-1.5 block">Kewajiban</label>
                <select
                  value={obligationId}
                  onChange={(e) => {
                    setObligationId(e.target.value);
                    const ob = obligations.find((o) => o.id === e.target.value);
                    if (ob) setAmount(String(ob.monthlyAmount));
                  }}
                  disabled={isEdit}
                  className="field mb-4 w-full rounded-xl px-3.5 py-3 text-sm"
                >
                  {obligations.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                {obligations.length === 0 && (
                  <p className="mb-4 text-xs text-muted">
                    Belum ada kewajiban. Tambahkan dari halaman Goals terlebih dahulu.
                  </p>
                )}
              </>
            )}

            <label className="label-caps mb-1.5 block">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="field mb-5 w-full rounded-xl px-3.5 py-3 text-sm"
            />

            <div className="flex gap-2.5">
              {isEdit && (
                <IconButton
                  variant="danger"
                  shape="square"
                  size="lg"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Hapus transaksi"
                >
                  <Trash2 size={18} />
                </IconButton>
              )}
              <Button type="submit" fullWidth disabled={type === "obligation" && obligations.length === 0}>
                {isEdit ? "Simpan Perubahan" : "Simpan"}
              </Button>
            </div>
          </form>
        )}
      </motion.div>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDialog
            title="Hapus transaksi?"
            message="Transaksi ini akan dihapus secara permanen dan tidak dapat dikembalikan."
            onCancel={() => setConfirmDelete(false)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PersonChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition active:scale-95 ${
        active ? "bg-ink text-white" : "bg-ivory text-ink/70"
      }`}
    >
      {label}
    </button>
  );
}
