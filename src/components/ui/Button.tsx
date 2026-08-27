import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "text";
type Size = "md" | "sm";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-ink text-white",
  secondary: "bg-white text-ink border border-border",
  outline: "bg-transparent text-ink border border-border",
  text: "bg-transparent text-ink",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  sm: "h-9 px-4 text-xs",
};

const SIZE_RADIUS: Record<Size, string> = {
  md: "rounded-xl",
  sm: "rounded-lg",
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  /** Rounds the button to a full pill regardless of size (e.g. hero CTAs, upload actions). */
  pill?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  pill = false,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  const radiusClass = pill ? "rounded-full" : SIZE_RADIUS[size];
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition disabled:opacity-40 ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${radiusClass} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
}
