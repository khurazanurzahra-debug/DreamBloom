import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Image as ImageIcon, Video, Loader2, X, Receipt, FolderOpen } from "lucide-react";
import AppShell from "../components/layout/AppShell";
import Header from "../components/ui/Header";
import { useDream } from "../context/DreamContext";
import { UploadTooLargeError } from "../lib/base44";
import { formatDateID } from "../lib/format";
import type { FileCategory } from "../types";

const ACCEPT =
  "image/jpeg,image/png,video/mp4,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,.pdf,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4";

function fileIcon(fileType: string) {
  if (fileType.startsWith("image")) return ImageIcon;
  if (fileType.startsWith("video")) return Video;
  return FileText;
}

function extensionLabel(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "FILE";
}

export default function ImportFiles() {
  const navigate = useNavigate();
  const { files, addFile, removeFile } = useDream();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<FileCategory>("receipt");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const documentFiles = files.filter((f) => f.category === "receipt" || f.category === "document");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      await addFile(file, uploadTarget);
    } catch (err) {
      setError(err instanceof UploadTooLargeError ? err.message : "Tidak bisa mengunggah berkas ini.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function openPicker(category: FileCategory) {
    setUploadTarget(category);
    setError(null);
    requestAnimationFrame(() => inputRef.current?.click());
  }

  return (
    <AppShell>
      <Header
        title="Data & Backup"
        subtitle="Simpan struk dan dokumen pendukung agar mudah ditemukan kembali."
        onBack={() => navigate("/app/more")}
      />

      <div className="mb-6 grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => openPicker("receipt")}
          className="card flex flex-col items-center gap-2 rounded-xl py-5 text-xs font-semibold text-ink"
        >
          <Receipt size={20} className="text-gold" />
          Unggah Struk
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => openPicker("document")}
          className="card flex flex-col items-center gap-2 rounded-xl py-5 text-xs font-semibold text-ink"
        >
          <FolderOpen size={20} className="text-gold" />
          Unggah Dokumen
        </motion.button>
      </div>

      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />

      {uploading && (
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <Loader2 size={14} className="animate-spin" /> Mengunggah…
        </div>
      )}
      {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

      <p className="mb-2.5 text-sm font-bold text-ink">Berkas Tersimpan</p>
      {documentFiles.length > 0 ? (
        <div className="card divide-y divide-ink/[0.06] rounded-xl px-4">
          {documentFiles.map((f) => {
            const Icon = fileIcon(f.fileType);
            return (
              <div key={f.id} className="flex items-center gap-3 py-3.5">
                <div className="glass-tint flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ ["--tint" as string]: "#E4D9C4" }}>
                  <Icon size={16} className="text-ink/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{f.fileName}</p>
                  <p className="text-[11px] text-muted">
                    {extensionLabel(f.fileName)} · {f.category === "receipt" ? "Struk" : "Dokumen"} · {formatDateID(f.createdAt.slice(0, 10))}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={`Hapus ${f.fileName}`}
                  onClick={() => removeFile(f.id)}
                  className="shrink-0 text-muted"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card rounded-xl py-10 text-center">
          <p className="text-sm text-muted">Belum ada berkas yang diunggah.</p>
        </div>
      )}

      <p className="mt-4 text-[11px] text-muted">
        Mendukung JPG, JPEG, PNG, MP4, PDF, XLS, XLSX, PPT, dan PPTX. Isi berkas Excel/PDF/PPT belum dibaca
        otomatis oleh sistem — berkas disimpan sebagai arsip untuk saat ini.
      </p>
    </AppShell>
  );
}
