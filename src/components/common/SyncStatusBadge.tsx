import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDream } from "../../context/DreamContext";
import type { SyncStatus } from "../../lib/cloud/cloudWrite";

const LABELS: Record<SyncStatus, string> = {
  idle: "",
  saving: "Menyimpan…",
  saved: "Tersimpan",
  offline: "Offline — akan disinkron otomatis",
  error: "Gagal menyimpan, mencoba lagi…",
};

const DOT_COLOR: Record<SyncStatus, string> = {
  idle: "#22C55E",
  saving: "#F59E0B",
  saved: "#22C55E",
  offline: "#F59E0B",
  error: "#EF4444",
};

/** Small, non-blocking cloud sync indicator. Only ever renders when Supabase is
 * actually configured — in pure local mode (no env vars) this is always invisible,
 * so it never affects the app's existing look. */
export default function SyncStatusBadge() {
  const { isCloudConfigured, syncStatus } = useDream();
  const [savedDismissed, setSavedDismissed] = useState(false);

  useEffect(() => {
    if (syncStatus !== "saved") return;
    setSavedDismissed(false);
    const timer = setTimeout(() => setSavedDismissed(true), 2000);
    return () => clearTimeout(timer);
  }, [syncStatus]);

  const visible =
    isCloudConfigured && syncStatus !== "idle" && !(syncStatus === "saved" && savedDismissed);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ opacity: 1, height: "auto", marginBottom: 10 }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-ink/70">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: DOT_COLOR[syncStatus] }} />
            {LABELS[syncStatus]}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
