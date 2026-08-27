import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { pickRandomReminder } from "../../lib/reminder";

export default function PersonalReminder() {
  const [message] = useState(() => pickRandomReminder());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass fixed inset-x-0 bottom-[6.5rem] z-40 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-full px-4 py-2.5"
        >
          <Sparkles size={13} className="shrink-0 text-gold" />
          <p className="font-display truncate text-xs italic text-ink/80">{message}</p>
          <button
            type="button"
            aria-label="Tutup pengingat"
            onClick={() => setVisible(false)}
            className="shrink-0 text-ink/40 transition active:scale-90"
          >
            <X size={12} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
