"use client";

import { forwardRef } from "react";
import { cx } from "@/lib/format";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "icon";
type Size = "lg" | "md" | "sm";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold text-[15px] transition-all duration-150 ease-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-text hover:bg-accent-hover",
  secondary: "bg-dark text-white hover:bg-black",
  outline: "bg-transparent border border-border-input text-text hover:bg-surface",
  ghost: "bg-transparent text-text hover:bg-black/5",
  destructive: "bg-error text-white hover:bg-[#B02A37]",
  icon: "bg-transparent text-text hover:bg-black/5 rounded-full p-2",
};

const sizes: Record<Size, string> = {
  lg: "h-[52px] px-6",
  md: "h-12 px-5",
  sm: "h-10 px-4 text-sm",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", loading, className, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cx(base, variants[variant], variant !== "icon" ? sizes[size] : "", className)}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
