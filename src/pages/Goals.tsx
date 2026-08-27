import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import MonthYearPicker from "../components/common/MonthYearPicker";
import SharedSavingCard from "../components/goals/SharedSavingCard";
import GoldCard from "../components/goals/GoldCard";
import ObligationCard from "../components/goals/ObligationCard";
import ObligationEditModal from "../components/goals/ObligationEditModal";
import GoalCard from "../components/goals/GoalCard";
import GoalEditModal from "../components/goals/GoalEditModal";
import { useDream } from "../context/DreamContext";
import type { Goal, Obligation } from "../types";

export default function Goals() {
  const { goals, obligations } = useDream();
  const [editingGoal, setEditingGoal] = useState<Goal | null | undefined>(undefined);
  const [editingObligation, setEditingObligation] = useState<Obligation | null | undefined>(undefined);

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Goals</h1>
        <MonthYearPicker />
      </div>

      <p className="accent-serif mb-6 text-lg italic text-ink/60">
        Every little bit brings us closer.
      </p>

      <SharedSavingCard />
      <GoldCard />

      <section className="mb-6">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Kewajiban</h2>
          <button
            type="button"
            onClick={() => setEditingObligation(null)}
            className="label-caps flex items-center gap-1 text-gold"
          >
            <Plus size={12} /> Tambah
          </button>
        </div>
        {obligations.length > 0 ? (
          <div className="flex flex-col gap-3">
            {obligations.map((o) => (
              <ObligationCard key={o.id} obligation={o} onEdit={() => setEditingObligation(o)} />
            ))}
          </div>
        ) : (
          <div className="card rounded-xl py-8 text-center">
            <p className="text-sm text-muted">Belum ada kewajiban tercatat.</p>
          </div>
        )}
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">Target Lainnya</h2>
          <button
            type="button"
            onClick={() => setEditingGoal(null)}
            className="label-caps flex items-center gap-1 text-gold"
          >
            <Plus size={12} /> Tambah
          </button>
        </div>
        {goals.length > 0 ? (
          <div className="flex flex-col gap-4">
            {goals.map((g) => (
              <GoalCard key={g.id} goal={g} onClick={() => setEditingGoal(g)} />
            ))}
          </div>
        ) : (
          <div className="card rounded-xl py-10 text-center">
            <p className="text-sm text-muted">Belum ada target. Yuk buat satu.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {editingGoal !== undefined && <GoalEditModal goal={editingGoal} onClose={() => setEditingGoal(undefined)} />}
      </AnimatePresence>
      <AnimatePresence>
        {editingObligation !== undefined && (
          <ObligationEditModal obligation={editingObligation} onClose={() => setEditingObligation(undefined)} />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
