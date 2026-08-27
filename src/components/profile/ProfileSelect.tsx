import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, User } from "lucide-react";
import { base44, UploadTooLargeError } from "../../lib/base44";

export default function ProfileSelect({
  photoUrl,
  onChange,
  fallbackLabel,
  size = 96,
}: {
  photoUrl: string | null;
  onChange: (url: string) => void;
  fallbackLabel?: string;
  size?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      setError(err instanceof UploadTooLargeError ? err.message : "Tidak bisa mengunggah foto ini.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col items-center">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        transition={{ duration: 0.15 }}
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
        aria-label="Ubah foto profil"
        style={{ height: size, width: size }}
        className="card relative flex items-center justify-center overflow-hidden rounded-full"
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Foto profil" className="h-full w-full object-cover" />
        ) : fallbackLabel ? (
          <span className="accent-serif text-2xl italic text-ink/60">{fallbackLabel}</span>
        ) : (
          <User size={size * 0.35} strokeWidth={1.4} className="text-muted" />
        )}
        <div className="glass-dark absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full">
          <Camera size={12} />
        </div>
      </motion.button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <p className="label-caps mt-2.5">{loading ? "Mengunggah…" : "Ketuk untuk ubah foto"}</p>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
