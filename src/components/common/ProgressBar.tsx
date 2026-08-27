import { motion } from "framer-motion";

export default function ProgressBar({
  value,
  color = "#C6A670",
}: {
  value: number; // 0-100
  color?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink/[0.06]">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
    </div>
  );
}
