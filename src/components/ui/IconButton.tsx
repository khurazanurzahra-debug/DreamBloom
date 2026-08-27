import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "solid" | "dark" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  solid: "card text-ink/70",
  dark: "glass-dark text-white",
  ghost: "bg-transparent text-ink/70",
  danger: "bg-white border border-border text-red-500",
};

const SIZE_PX: Record<Size, number> = { sm: 32, md: 36, lg: 40 };

interface IconButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  shape?: "circle" | "square";
  "aria-label": string;
  children: ReactNode;
}

export default function IconButton({
  variant = "solid",
  size = "md",
  shape = "circle",
  children,
  className = "",
  ...rest
}: IconButtonProps) {
  const px = SIZE_PX[size];
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.15 }}
      style={{ height: px, width: px }}
      className={`flex shrink-0 items-center justify-center transition ${
        shape === "circle" ? "rounded-full" : "rounded-xl"
      } ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
