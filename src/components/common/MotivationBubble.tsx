import { motion, AnimatePresence } from "framer-motion";

export default function MotivationBubble({ message }: { message: string | null }) {
  return (
    <AnimatePresence mode="wait">
      {message && (
        <motion.div
          key={message}
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="glass mt-3 inline-flex max-w-full items-center rounded-full px-3.5 py-2"
        >
          <p className="font-display truncate text-[11px] italic text-ink/75">{message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
