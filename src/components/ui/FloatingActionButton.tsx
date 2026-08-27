import { motion } from "framer-motion";
import { Plus } from "lucide-react";

/**
 * Purely visual — no position/left/top/transform of its own. Positioning is owned
 * entirely by the data-fab-anchor wrapper in BottomNavigation.tsx, so there is only
 * ONE place in the codebase that computes where the FAB sits, not two competing ones.
 */
export default function FloatingActionButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Tambah transaksi"
      data-fab="true"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="flex h-14 w-14 items-center justify-center rounded-full text-white"
      style={{ backgroundColor: "#1F1F1F", boxShadow: "0 10px 24px rgba(31,31,31,0.28)" }}
    >
      <Plus size={24} strokeWidth={1.8} />
    </motion.button>
  );
}
