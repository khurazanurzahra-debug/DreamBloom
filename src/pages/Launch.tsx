import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2, Sparkles } from "lucide-react";

const HOLD_MS = 2300;
const FADE_OUT_MS = 450;

export default function Launch() {
  const navigate = useNavigate();
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const holdTimer = setTimeout(() => setExiting(true), HOLD_MS);
    return () => clearTimeout(holdTimer);
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const navTimer = setTimeout(() => navigate("/onboarding"), FADE_OUT_MS);
    return () => clearTimeout(navTimer);
  }, [exiting, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: exiting ? FADE_OUT_MS / 1000 : 0.6, ease: "easeInOut" }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ivory px-8 text-center"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[42%] h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(198,166,112,0.28), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white"
        style={{ boxShadow: "0 0 28px rgba(198,166,112,0.35), 0 4px 14px rgba(43,38,32,0.06)" }}
      >
        <Flower2 size={32} strokeWidth={1.5} className="text-gold" />
      </motion.div>

      <div
        className="relative z-10 rounded-[32px] px-9 py-7"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(242,232,213,0.35))" }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.5 }}
          className="font-display text-3xl font-bold tracking-tight text-ink"
        >
          DreamBloom
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.6 }}
          className="my-2.5 flex items-center justify-center gap-2"
        >
          <span className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, #C6A670)" }} />
          <Sparkles size={10} className="text-gold" />
          <span className="h-px w-8" style={{ background: "linear-gradient(to left, transparent, #C6A670)" }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.9 }}
          className="accent-serif text-base italic text-ink/60"
        >
          Tabungan yang tumbuh bersama mimpi.
        </motion.p>
      </div>
    </motion.div>
  );
}
