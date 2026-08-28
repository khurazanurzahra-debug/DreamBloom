import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Flower2 } from "lucide-react";
import { useDream } from "../context/DreamContext";
import Button from "../components/ui/Button";

export default function ConnectHousehold() {
  const navigate = useNavigate();
  const { connectHousehold } = useDream();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConnect() {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    const result = await connectHousehold(code);
    setLoading(false);
    if (result.ok) {
      navigate("/profile");
    } else {
      setError(result.error ?? "Tidak bisa terhubung. Coba lagi.");
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
        <div className="card mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
          <Flower2 size={26} strokeWidth={1.5} className="text-gold" />
        </div>

        <p className="label-caps mb-1 text-center">DreamBloom</p>
        <h1 className="mb-2 text-center text-2xl font-bold text-ink">Hubungkan rumah tangga</h1>
        <p className="accent-serif mb-8 text-center text-base italic text-ink/60">
          Masukkan kode yang sama di kedua perangkat agar data kalian selalu sinkron.
        </p>

        <label className="label-caps mb-1.5 block">Kode rumah tangga</label>
        <input
          value={code}
          onChange={(e) => {
            setError(null);
            setCode(e.target.value);
          }}
          placeholder="Masukkan kode"
          autoCapitalize="none"
          autoCorrect="off"
          className="field mb-2 w-full rounded-xl px-3.5 py-3 text-sm"
        />
        {error && <p className="mb-4 text-xs text-red-500">{error}</p>}

        <Button fullWidth onClick={handleConnect} disabled={!code.trim() || loading} className={error ? "" : "mt-4"}>
          {loading ? "Menghubungkan…" : "Hubungkan"}
        </Button>

        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="mt-3 w-full py-2 text-center text-xs font-medium text-muted"
        >
          Lewati untuk sekarang
        </button>
      </motion.div>
    </div>
  );
}
