import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import type { CSSProperties } from "react";

const iconMap = icons as unknown as Record<string, React.ComponentType<LucideProps>>;

export default function Icon({
  name,
  size = 20,
  className,
  strokeWidth = 1.6,
  style,
}: {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  const Cmp = iconMap[name] ?? icons.Circle;
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} style={style} />;
}
