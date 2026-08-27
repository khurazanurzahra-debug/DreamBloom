import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { useDream } from "../context/DreamContext";
import { UploadTooLargeError } from "../lib/base44";
import Button from "../components/ui/Button";

export default function OurBeginning() {
  const navigate = useNavigate();
  const {
    gratitudeText,
    setGratitudeText,
    buildingTogetherText,
    setBuildingTogetherText,
    files,
    addFile,
    removeFile,
  } = useDream();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const memories = files.filter((f) => f.category === "memory");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await addFile(file, "memory");
    } catch (err) {
      setError(err instanceof UploadTooLargeError ? err.message : "Tidak bisa mengunggah berkas ini.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function goHome() {
    navigate("/app/home");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-ivory px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <p className="label-caps mb-1 text-center">Sebelum kita mulai...</p>
        <h1 className="mb-8 text-center text-2xl font-bold text-ink">Sebelum kita mulai...</h1>

        <div className="card mb-4 rounded-2xl p-5">
          <label className="mb-2 block text-sm font-semibold text-ink">
            Apa yang membuat kamu bersyukur hari ini?
          </label>
          <textarea
            value={gratitudeText}
            onChange={(e) => setGratitudeText(e.target.value)}
            placeholder="Tulis sedikit tentang hal yang kamu syukuri..."
            rows={2}
            className="field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="card mb-4 rounded-2xl p-5">
          <label className="mb-2 block text-sm font-semibold text-ink">
            Apa yang sedang kita bangun bersama?
          </label>
          <textarea
            value={buildingTogetherText}
            onChange={(e) => setBuildingTogetherText(e.target.value)}
            placeholder="Rumah, keluarga, perjalanan, masa depan..."
            rows={2}
            className="field w-full resize-none rounded-xl px-3.5 py-2.5 text-sm"
          />
        </div>

        <div className="card mb-8 rounded-2xl p-5">
          <p className="mb-3 text-sm font-semibold text-ink">Tambahkan kenangan</p>

          {memories.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {memories.map((m) => (
                <div key={m.id} className="group relative aspect-square overflow-hidden rounded-lg bg-champagne/40">
                  {m.fileType.startsWith("video") ? (
                    <video src={m.fileUrl} muted playsInline className="h-full w-full object-cover" />
                  ) : (
                    <img src={m.fileUrl} alt={m.fileName} className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    aria-label={`Hapus ${m.fileName}`}
                    onClick={() => removeFile(m.id)}
                    className="glass-dark absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button
            variant="secondary"
            size="sm"
            fullWidth
            icon={uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Mengunggah…" : "Unggah foto atau video"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,video/mp4"
            className="hidden"
            onChange={handleFile}
          />
          <p className="mt-2 text-[11px] text-muted">Mendukung JPG, JPEG, PNG, dan MP4.</p>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        <Button fullWidth onClick={goHome}>
          Lanjutkan
        </Button>

        <button
          type="button"
          onClick={goHome}
          className="mt-3 w-full py-2 text-center text-xs font-medium text-muted"
        >
          Lewati untuk sekarang
        </button>
      </motion.div>
    </div>
  );
}
