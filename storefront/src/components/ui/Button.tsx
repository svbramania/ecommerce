import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger-ghost";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-50",
  secondary:
    "rounded-full border border-border bg-surface px-5 py-2 text-sm font-medium text-foreground disabled:opacity-50",
  ghost: "text-sm font-medium text-accent underline disabled:opacity-50",
  "danger-ghost": "text-xs text-red-600 underline dark:text-red-400 disabled:opacity-50",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${VARIANT_CLASSES[variant]} ${className}`} {...props} />;
}
