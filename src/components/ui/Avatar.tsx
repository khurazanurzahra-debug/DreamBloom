import { User } from "lucide-react";

export default function Avatar({
  photoUrl,
  fallback,
  size = 40,
  rounded = "full",
}: {
  photoUrl?: string | null;
  fallback?: string;
  size?: number;
  rounded?: "full" | "xl";
}) {
  return (
    <div
      className={`card flex shrink-0 items-center justify-center overflow-hidden ${
        rounded === "full" ? "rounded-full" : "rounded-2xl"
      }`}
      style={{ height: size, width: size }}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : fallback ? (
        <span className="accent-serif italic text-ink/60" style={{ fontSize: size * 0.32 }}>
          {fallback}
        </span>
      ) : (
        <User size={size * 0.4} strokeWidth={1.4} className="text-muted" />
      )}
    </div>
  );
}
