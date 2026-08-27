import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronDown } from "lucide-react";
import { getAvailableMonths, getAvailableYears, monthLabel } from "../../lib/dateFilter";
import { useDream } from "../../context/DreamContext";

export default function MonthYearPicker({ variant = "default" }: { variant?: "default" | "compact" }) {
  const { selectedYear, selectedMonth, setSelectedPeriod } = useDream();
  const [open, setOpen] = useState(false);
  const years = getAvailableYears();
  const isCompact = variant === "compact";

  function handleYearChange(year: number) {
    const months = getAvailableMonths(year);
    const stillValid = months.some((m) => m.value === selectedMonth);
    setSelectedPeriod(year, stillValid ? selectedMonth : months[0].value);
  }

  return (
    <div className="relative">
      {isCompact ? (
        <motion.button
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Pilih bulan dan tahun"
          className="flex h-9 w-[120px] shrink-0 items-center justify-center gap-1 rounded-[18px] bg-white px-2 text-xs font-semibold shadow-sm"
          style={{ border: "1px solid #E8E1D7", color: "#1F1F1F" }}
        >
          <Calendar size={13} className="shrink-0" style={{ color: "#8B8B82" }} />
          <span className="truncate">
            {monthLabel(selectedMonth).slice(0, 3)} {selectedYear}
          </span>
          <ChevronDown size={13} className="shrink-0" style={{ color: "#8B8B82" }} />
        </motion.button>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Pilih bulan dan tahun"
          className="card flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-ink"
        >
          {monthLabel(selectedMonth)} {selectedYear}
          <ChevronDown size={16} className="text-muted" />
        </motion.button>
      )}

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="card absolute right-0 z-50 mt-2 w-64 rounded-xl p-3"
            >
              <p className="label-caps mb-2">Tahun</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {years.map((y) => (
                  <button
                    key={y}
                    onClick={() => handleYearChange(y)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition active:scale-95 ${
                      y === selectedYear ? "bg-ink text-white" : "bg-ivory text-ink hover:bg-champagne/60"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              <p className="label-caps mb-2">Bulan</p>
              <div className="grid grid-cols-3 gap-1.5">
                {getAvailableMonths(selectedYear).map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setSelectedPeriod(selectedYear, m.value);
                      setOpen(false);
                    }}
                    className={`rounded-lg px-2 py-1.5 text-xs font-medium transition active:scale-95 ${
                      m.value === selectedMonth
                        ? "bg-gold text-white"
                        : "bg-ivory text-ink hover:bg-champagne/60"
                    }`}
                  >
                    {m.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
