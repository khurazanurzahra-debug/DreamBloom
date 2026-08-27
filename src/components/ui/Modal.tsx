import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import IconButton from "./IconButton";

export default function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 bg-ink/25 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="card relative z-10 w-full max-w-sm rounded-2xl p-5"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <IconButton aria-label="Tutup" size="sm" onClick={onClose}>
            <X size={15} />
          </IconButton>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
