import type { ReactNode } from "react";

export default function Pill({ children }: { children: ReactNode }) {
  return (
    <div className="card inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs text-ink/80">
      {children}
    </div>
  );
}
