import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import IconButton from "./IconButton";

export default function Header({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {onBack && (
            <IconButton aria-label="Kembali" onClick={onBack}>
              <ChevronLeft size={18} />
            </IconButton>
          )}
          <h1 className="truncate text-2xl font-bold" style={{ color: "#1F1F1F" }}>
            {title}
          </h1>
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {subtitle && (
        <p className="accent-serif text-[13px] italic" style={{ color: "#9B968D" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
