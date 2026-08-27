import { useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { List } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import Button from "../components/ui/Button";
import MonthYearPicker from "../components/common/MonthYearPicker";
import CategoryGrid from "../components/activity/CategoryGrid";
import CategoryDetail from "../components/activity/CategoryDetail";
import TransactionList from "../components/activity/TransactionList";
import { useDream } from "../context/DreamContext";
import type { Category } from "../types";

type View = { mode: "categories" } | { mode: "category"; category: Category } | { mode: "all"; tab?: "all" | "income" | "expense" };

interface ActivityNavState {
  initialView?: "all" | "category";
  initialCategoryId?: string;
  initialTab?: "all" | "income" | "expense";
}

export default function Activity() {
  const { categories } = useDream();
  const location = useLocation();
  const navState = (location.state as ActivityNavState | null) ?? null;

  const [view, setView] = useState<View>(() => {
    if (navState?.initialView === "category" && navState.initialCategoryId) {
      const category = categories.find((c) => c.id === navState.initialCategoryId);
      if (category) return { mode: "category", category };
    }
    if (navState?.initialView === "all") {
      return { mode: "all", tab: navState.initialTab ?? "all" };
    }
    return { mode: "categories" };
  });

  return (
    <AppShell>
      <Header
        title={view.mode === "category" ? view.category.name : "Aktivitas"}
        onBack={view.mode !== "categories" ? () => setView({ mode: "categories" }) : undefined}
        right={<MonthYearPicker />}
      />

      <AnimatePresence mode="wait">
        {view.mode === "categories" && (
          <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CategoryGrid onSelectCategory={(category) => setView({ mode: "category", category })} />

            <Button variant="secondary" fullWidth size="sm" icon={<List size={14} />} onClick={() => setView({ mode: "all" })}>
              Lihat semua aktivitas
            </Button>
          </motion.div>
        )}

        {view.mode === "category" && (
          <motion.div key="category" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <CategoryDetail category={view.category} onBack={() => setView({ mode: "categories" })} />
          </motion.div>
        )}

        {view.mode === "all" && (
          <motion.div key="all" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            <TransactionList initialTab={view.tab} />
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
