import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useDream } from "../../context/DreamContext";
import { useFilteredTransactions } from "../../hooks/useFilteredTransactions";
import TransactionItem from "./TransactionItem";
import AddSheet from "../addsheet/AddSheet";
import { formatDateID } from "../../lib/format";
import type { Transaction } from "../../types";

type Tab = "all" | "income" | "expense";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "income", label: "Pemasukan" },
  { key: "expense", label: "Pengeluaran" },
];

export default function TransactionList({ initialTab = "all" }: { initialTab?: Tab }) {
  const { categories, profiles } = useDream();
  const filtered = useFilteredTransactions();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const byTab = useMemo(() => {
    if (tab === "income") return filtered.filter((t) => t.type === "income");
    if (tab === "expense") return filtered.filter((t) => t.type === "expense" || t.type === "obligation");
    return filtered;
  }, [filtered, tab]);

  const groups = useMemo(() => {
    const sorted = [...byTab].sort((a, b) => b.date.localeCompare(a.date));
    const map = new Map<string, Transaction[]>();
    sorted.forEach((t) => {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date)!.push(t);
    });
    return Array.from(map.entries());
  }, [byTab]);

  return (
    <section>
      <div className="mb-3 flex rounded-xl bg-ink/[0.05] p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition active:scale-95 ${
              tab === t.key ? "bg-white text-ink shadow-sm" : "text-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {groups.length > 0 ? (
        <div className="flex flex-col gap-3">
          {groups.map(([date, items]) => (
            <div key={date} className="card rounded-xl px-4 py-1">
              <p className="label-caps py-2.5">{formatDateID(date)}</p>
              {items.map((t) => (
                <TransactionItem
                  key={t.id}
                  transaction={t}
                  category={categories.find((c) => c.id === t.categoryId)}
                  person={profiles.find((p) => p.id === t.personId)}
                  onClick={() => setEditing(t)}
                />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="card rounded-xl py-10 text-center">
          <p className="text-sm text-muted">Belum ada transaksi di bulan ini.</p>
        </div>
      )}

      <AnimatePresence>
        {editing && <AddSheet editTransaction={editing} onClose={() => setEditing(null)} />}
      </AnimatePresence>
    </section>
  );
}
