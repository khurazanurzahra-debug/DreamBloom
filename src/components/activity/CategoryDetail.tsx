import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Pencil, Plus } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useFilteredTransactions } from "../../hooks/useFilteredTransactions";
import { budgetRemainingPct, statusColorForPercent, statusLabelForPercent } from "../../lib/status";
import { vividCardGradient, softCardBorder, softIconBackground, softCardShadow } from "../../lib/cardGradient";
import { formatCompact, formatDateID } from "../../lib/format";
import type { Category, Transaction } from "../../types";
import Icon from "../common/Icon";
import ProgressBar from "../common/ProgressBar";
import TransactionItem from "./TransactionItem";
import CategoryEditModal from "./CategoryEditModal";
import AddSheet from "../addsheet/AddSheet";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";

export default function CategoryDetail({ category, onBack }: { category: Category; onBack: () => void }) {
  const { profiles } = useDream();
  const filtered = useFilteredTransactions();
  const [editingCategory, setEditingCategory] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const items = useMemo(
    () => filtered.filter((t) => t.categoryId === category.id).sort((a, b) => b.date.localeCompare(a.date)),
    [filtered, category.id]
  );

  const total = items.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const budget = category.budgetAmount;
  const remainingPct = budget ? budgetRemainingPct(total, budget) : null;

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    items.forEach((t) => {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    });
    return Array.from(map.entries());
  }, [items]);

  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
      <div className="mb-4 flex items-center gap-3">
        <IconButton aria-label="Kembali ke kategori" onClick={onBack}>
          <ChevronLeft size={18} />
        </IconButton>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: softIconBackground(category.color, 36) }}
        >
          <Icon name={category.icon} size={23} style={{ color: category.color }} />
        </div>
        <h2 className="min-w-0 flex-1 truncate text-lg font-bold text-ink">{category.name}</h2>
        <IconButton aria-label="Ubah kategori" onClick={() => setEditingCategory(true)}>
          <Pencil size={14} />
        </IconButton>
      </div>

      {budget !== undefined && remainingPct !== null && (
        <div
          className="mb-4 rounded-xl border p-4"
          style={{
            background: vividCardGradient(category.color),
            borderColor: softCardBorder(category.color, 28),
            boxShadow: softCardShadow(),
          }}
        >
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-semibold" style={{ color: statusColorForPercent(remainingPct) }}>
              {statusLabelForPercent(remainingPct)}
            </span>
            <span className="text-muted">
              {formatCompact(total)} / {formatCompact(budget)}
            </span>
          </div>
          <ProgressBar value={100 - remainingPct} color={statusColorForPercent(remainingPct)} />
        </div>
      )}

      <Button variant="secondary" size="sm" fullWidth icon={<Plus size={14} />} onClick={() => setAddOpen(true)} className="mb-4">
        Tambah transaksi
      </Button>

      {groups.length > 0 ? (
        <div className="flex flex-col gap-3">
          {groups.map(([date, dayItems]) => (
            <div key={date} className="card rounded-xl px-4 py-1">
              <p className="label-caps py-2.5">{formatDateID(date)}</p>
              {dayItems.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  category={category}
                  person={profiles.find((p) => p.id === t.personId)}
                  onClick={() => setEditingTransaction(t)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card rounded-xl py-10 text-center">
          <p className="text-sm text-muted">Belum ada pengeluaran di kategori ini bulan ini.</p>
        </div>
      )}

      <AnimatePresence>
        {editingCategory && <CategoryEditModal category={category} onClose={() => setEditingCategory(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingTransaction && (
          <AddSheet editTransaction={editingTransaction} onClose={() => setEditingTransaction(null)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {addOpen && <AddSheet initialType="expense" onClose={() => setAddOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
