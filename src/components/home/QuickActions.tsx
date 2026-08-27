import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ArrowDownLeft, Coins, Wallet } from "lucide-react";
import AddSheet from "../addsheet/AddSheet";
import CategoryEditModal from "../activity/CategoryEditModal";
import { METRIC_COLORS } from "../../lib/metricColors";
import { softIconBackground, softCardShadow } from "../../lib/cardGradient";
import type { TransactionType } from "../../types";

const ACTIONS = [
  { key: "expense", label: "Pengeluaran", icon: ArrowUpRight, tint: METRIC_COLORS.expense },
  { key: "income", label: "Pemasukan", icon: ArrowDownLeft, tint: METRIC_COLORS.income },
  { key: "saving", label: "Tabungan", icon: Coins, tint: METRIC_COLORS.saving },
  { key: "budget", label: "Anggaran", icon: Wallet, tint: METRIC_COLORS.gold },
] as const;

export default function QuickActions() {
  const [addType, setAddType] = useState<TransactionType | null>(null);
  const [addingBudget, setAddingBudget] = useState(false);

  return (
    <section className="mb-5">
      <h2 className="mb-2.5 text-sm font-bold text-ink">Quick Action</h2>
      <div className="grid grid-cols-4 gap-2">
        {ACTIONS.map((a) => (
          <motion.button
            key={a.key}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.15 }}
            onClick={() => (a.key === "budget" ? setAddingBudget(true) : setAddType(a.key))}
            className="flex flex-col items-center gap-1.5 rounded-xl border px-1 py-3 text-center text-[11px] font-semibold text-ink"
            style={{
              backgroundColor: softIconBackground(a.tint, 20),
              borderColor: softIconBackground(a.tint, 28),
              boxShadow: softCardShadow(),
            }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{ backgroundColor: softIconBackground(a.tint, 38) }}
            >
              <a.icon size={22} style={{ color: a.tint }} />
            </div>
            {a.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence>{addType && <AddSheet initialType={addType} onClose={() => setAddType(null)} />}</AnimatePresence>
      <AnimatePresence>
        {addingBudget && <CategoryEditModal category={null} onClose={() => setAddingBudget(false)} />}
      </AnimatePresence>
    </section>
  );
}
