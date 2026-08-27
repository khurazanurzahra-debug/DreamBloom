import type { ReactNode } from "react";

const PADDING_CLASSES = {
  none: "",
  sm: "p-3.5",
  md: "p-5",
} as const;

export default function Card({
  children,
  padding = "md",
  className = "",
}: {
  children: ReactNode;
  padding?: keyof typeof PADDING_CLASSES;
  className?: string;
}) {
  return <div className={`card rounded-2xl ${PADDING_CLASSES[padding]} ${className}`}>{children}</div>;
}
