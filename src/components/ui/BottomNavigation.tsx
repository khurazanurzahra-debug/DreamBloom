import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Activity as ActivityIcon, Target, Menu } from "lucide-react";
import AddSheet from "../addsheet/AddSheet";
import FloatingActionButton from "./FloatingActionButton";

const navItemsLeft = [
  { to: "/app/home", label: "Home", icon: Home },
  { to: "/app/activity", label: "Aktivitas", icon: ActivityIcon },
];

const navItemsRight = [
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/more", label: "More", icon: Menu },
];

export default function BottomNavigation() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          data-nav-container="true"
          className="glass pointer-events-auto relative mx-4 w-full max-w-md rounded-2xl px-3 py-2"
        >
          <div className="grid grid-cols-[1fr_1fr_64px_1fr_1fr] items-center">
            {navItemsLeft.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}

            {/*
              The 64px center column, deterministic by CSS Grid regardless of the other
              four columns' content. This is the ONLY element the FAB is ever measured
              against — not the row, not the bar, not a sibling's width.
            */}
            <div data-fab-slot="true" className="relative h-full w-16">
              <div
                data-fab-anchor="true"
                className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-[calc(50%_+_10px)]"
              >
                <FloatingActionButton onClick={() => setAddOpen(true)} />
              </div>
            </div>

            {navItemsRight.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <AnimatePresence>{addOpen && <AddSheet onClose={() => setAddOpen(false)} />}</AnimatePresence>
    </>
  );
}

function NavItem({ to, label, icon: IconCmp }: { to: string; label: string; icon: typeof Home }) {
  return (
    <NavLink to={to} className="flex h-11 w-full min-w-0 flex-col items-center justify-center gap-1">
      {({ isActive }) => (
        <motion.div
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.15 }}
          className="relative flex flex-col items-center gap-1 px-2.5 py-1"
        >
          {isActive && (
            <motion.div
              layoutId="nav-active-pill"
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="absolute inset-0 rounded-xl bg-champagne/60"
            />
          )}
          <IconCmp size={20} strokeWidth={1.8} className={`relative ${isActive ? "text-gold" : "text-muted"}`} />
          <span className={`relative text-[10px] font-medium ${isActive ? "text-ink" : "text-muted"}`}>{label}</span>
        </motion.div>
      )}
    </NavLink>
  );
}
