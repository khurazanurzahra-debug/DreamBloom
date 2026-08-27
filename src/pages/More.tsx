import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Tag, Bell, Archive, Info, Settings as SettingsIcon, LogOut } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import Avatar from "../components/ui/Avatar";
import Modal from "../components/ui/Modal";
import { useDream } from "../context/DreamContext";

type MenuItem = { label: string; description: string; icon: typeof Tag; to?: string; onClick?: () => void };

export default function More() {
  const navigate = useNavigate();
  const { activeProfile } = useDream();
  const [modal, setModal] = useState<"notifications" | "about" | null>(null);

  const menuItems: MenuItem[] = [
    { label: "Categories", description: "Kelola kategori & anggaran", icon: Tag, to: "/app/more/categories" },
    { label: "Notifications", description: "Pengingat & pemberitahuan", icon: Bell, onClick: () => setModal("notifications") },
    { label: "Data & Backup", description: "Kenangan & dokumen", icon: Archive, to: "/app/more/import" },
    { label: "Preferences", description: "Brand / Logo", icon: SettingsIcon, to: "/app/more/settings" },
    { label: "About DreamBloom", description: "Tentang aplikasi ini", icon: Info, onClick: () => setModal("about") },
  ];

  return (
    <AppShell>
      <Header title="Profile" />

      <Link to="/profile">
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15 }}
          className="card mb-5 flex items-center gap-3.5 rounded-2xl p-4"
        >
          <Avatar photoUrl={activeProfile?.photoUrl} size={56} />
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-ink">{activeProfile?.name || "there"}</p>
            <p className="text-xs text-muted">{activeProfile?.role ?? "DreamBloom member"}</p>
          </div>
          <span className="label-caps text-gold">Edit Profile</span>
        </motion.div>
      </Link>

      <div className="card mb-5 overflow-hidden rounded-2xl">
        {menuItems.map((item, i) => {
          const row = (
            <motion.div
              whileHover={{ backgroundColor: "rgba(43,38,32,0.03)" }}
              transition={{ duration: 0.15 }}
              className={`flex min-h-[44px] items-center gap-3 px-4 py-3.5 active:scale-[0.99] ${
                i !== menuItems.length - 1 ? "border-b border-ink/[0.06]" : ""
              }`}
            >
              <item.icon size={18} strokeWidth={1.7} className="text-ink/60" />
              <div className="flex-1">
                <p className="text-sm font-medium text-ink">{item.label}</p>
                <p className="text-[11px] text-muted">{item.description}</p>
              </div>
              <ChevronRight size={16} className="text-muted" />
            </motion.div>
          );
          return item.to ? (
            <Link key={item.label} to={item.to}>
              {row}
            </Link>
          ) : (
            <button key={item.label} type="button" onClick={item.onClick} className="block w-full text-left">
              {row}
            </button>
          );
        })}
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate("/profile")}
        className="card flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-red-500 transition"
      >
        <LogOut size={16} />
        Logout
      </motion.button>

      <AnimatePresence>
        {modal === "notifications" && (
          <Modal title="Notifications" onClose={() => setModal(null)}>
            <p className="text-sm leading-relaxed text-ink/70">
              Pengingat lembut muncul sebagai notifikasi kecil di layar Home — tidak ada daftar
              notifikasi terpisah untuk dijaga.
            </p>
          </Modal>
        )}
        {modal === "about" && (
          <Modal title="About DreamBloom" onClose={() => setModal(null)}>
            <p className="mb-2 accent-serif text-base italic text-ink/70">
              Tabungan yang tumbuh bersama mimpi.
            </p>
            <p className="text-sm leading-relaxed text-ink/70">
              DreamBloom adalah ruang finansial pribadi untuk pasangan — mengatur pemasukan,
              pengeluaran, tabungan bersama, dan emas untuk masa depan, dalam satu tempat yang
              tenang.
            </p>
          </Modal>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
