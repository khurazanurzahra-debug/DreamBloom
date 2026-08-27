import { useRef, useState } from "react";
import { Flower2, Upload, RotateCcw } from "lucide-react";
import { useDream } from "../../context/DreamContext";
import { base44, UploadTooLargeError } from "../../lib/base44";
import Button from "../ui/Button";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/svg+xml";

export default function BrandLogoCard() {
  const { customLogoUrl, setCustomLogoUrl } = useDream();
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
      setCustomLogoUrl(file_url);
    } catch (err) {
      setError(err instanceof UploadTooLargeError ? err.message : "Tidak bisa mengunggah logo ini.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <section className="card rounded-2xl p-6">
      <p className="label-caps mb-1 text-center">Brand / Logo</p>
      <p className="mb-4 text-center text-[11px] text-muted">Upload a logo from your device</p>

      <div className="mb-4 flex justify-center">
        <div className="card flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl">
          {customLogoUrl ? (
            <img src={customLogoUrl} alt="Logo DreamBloom" className="h-full w-full object-cover" />
          ) : (
            <Flower2 size={32} strokeWidth={1.5} className="text-gold" />
          )}
        </div>
      </div>

      <div className="flex justify-center gap-2.5">
        <Button pill size="sm" icon={<Upload size={14} />} onClick={() => inputRef.current?.click()}>
          {loading ? "Mengunggah…" : customLogoUrl ? "Ganti Logo" : "Import Logo"}
        </Button>

        {customLogoUrl && (
          <Button variant="secondary" pill size="sm" icon={<RotateCcw size={14} />} onClick={() => setCustomLogoUrl("")}>
            Hapus Logo
          </Button>
        )}
      </div>

      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFile} />
      {error && <p className="mt-3 text-center text-xs text-red-500">{error}</p>}
      <p className="mt-3 text-center text-[11px] text-muted">Mendukung PNG, JPG, JPEG, dan SVG.</p>
    </section>
  );
}
