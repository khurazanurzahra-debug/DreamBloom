import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useDream } from "../../context/DreamContext";
import { useFilteredTransactions } from "../../hooks/useFilteredTransactions";
import TransactionItem from "../activity/TransactionItem";
import AddSheet from "../addsheet/AddSheet";
import type { Transaction } from "../../types";

export default function RecentTransactions() {
  const { categories, profiles } = useDream();
  const filtered = useFilteredTransactions();
  const [editing, setEditing] = useState<Transaction | null>(null);

  const recent = useMemo(() => [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4), [filtered]);

  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-ink">Recent Transactions</h2>
        <Link to="/app/activity" state={{ initialView: "all" }} className="label-caps text-gold">
          Lihat semua
        </Link>
      </div>

      {recent.length > 0 ? (
        <div className="card rounded-xl px-4">
          {recent.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              category={categories.find((c) => c.id === t.categoryId)}
              person={profiles.find((p) => p.id === t.personId)}
              onClick={() => setEditing(t)}
            />
          ))}
        </div>
      ) : (
        <div className="card rounded-xl py-8 text-center">
          <p className="text-sm text-muted">Belum ada transaksi bulan ini.</p>
        </div>
      )}

      <AnimatePresence>
        {editing && <AddSheet editTransaction={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </section>
  );
}
