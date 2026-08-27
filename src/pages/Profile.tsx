import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useDream } from "../context/DreamContext";
import ProfileSelect from "../components/profile/ProfileSelect";
import Button from "../components/ui/Button";

export default function Profile() {
  const navigate = useNavigate();
  const { profiles, updateProfile, activeProfileId, setActiveProfileId, hasOnboarded } = useDream();

  function handleContinue() {
    if (!activeProfileId) return;
    if (hasOnboarded) {
      navigate("/app/home");
    } else {
      navigate("/our-beginning");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <p className="label-caps mb-1 text-center">DreamBloom</p>
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">Selamat datang di DreamBloom</h1>
        <p className="accent-serif mb-8 text-center text-base italic text-ink/60">
          Siapa yang sedang mengatur ruang finansial hari ini?
        </p>

        <div className="mb-8 grid grid-cols-2 gap-3">
          {profiles.map((p) => {
            const isSelected = activeProfileId === p.id;
            return (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveProfileId(p.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveProfileId(p.id);
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`Pilih profil ${p.name}`}
                className={`card relative flex cursor-pointer flex-col items-center gap-3 rounded-2xl px-3 py-6 transition active:scale-[0.98] ${
                  isSelected ? "ring-2 ring-gold" : ""
                }`}
              >
                {isSelected && (
                  <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-white">
                    <Check size={12} strokeWidth={3} />
                  </div>
                )}
                <ProfileSelect
                  photoUrl={p.photoUrl}
                  onChange={(url) => updateProfile(p.id, { photoUrl: url })}
                  fallbackLabel={p.name.charAt(0).toUpperCase()}
                  size={72}
                />
                <div className="text-center">
                  <p className="text-sm font-bold text-ink">{p.name}</p>
                  <p className="label-caps mt-0.5">{p.role}</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button fullWidth onClick={handleContinue} disabled={!activeProfileId}>
          {hasOnboarded ? "Simpan" : "Lanjutkan"}
        </Button>
      </motion.div>
    </div>
  );
}
