import type { ReactNode } from "react";
import BottomNavigation from "../ui/BottomNavigation";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-ivory">
      <div className="mx-auto w-full max-w-xl px-4 pb-32 pt-6 sm:px-6">{children}</div>
      <BottomNavigation />
    </div>
  );
}
