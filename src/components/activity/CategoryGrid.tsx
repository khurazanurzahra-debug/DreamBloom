import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { useCategorySpend } from "../../hooks/useFilteredTransactions";
import CategoryCard from "./CategoryCard";
import CategoryEditModal from "./CategoryEditModal";
import type { Category } from "../../types";

export default function CategoryGrid({
  title = "Kategori",
  onSelectCategory,
  activeCategoryId,
}: {
  title?: string;
  onSelectCategory?: (category: Category) => void;
  activeCategoryId?: string;
}) {
  const { categories } = useDream();
  const totals = useCategorySpend();
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);

  return (
    <section className="mb-6">
      <h2 className="mb-2.5 text-sm font-bold text-ink">{title}</h2>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c) => (
          <CategoryCard
            key={c.id}
            category={c}
            total={totals.get(c.id) ?? 0}
            active={activeCategoryId === c.id}
            onClick={() => (onSelectCategory ? onSelectCategory(c) : setEditing(c))}
          />
        ))}

        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() => setEditing(null)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-muted transition active:scale-95"
        >
          <Plus size={18} />
          <span className="text-xs font-medium">Tambah kategori</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {editing !== undefined && <CategoryEditModal category={editing} onClose={() => setEditing(undefined)} />}
      </AnimatePresence>
    </section>
  );
}
