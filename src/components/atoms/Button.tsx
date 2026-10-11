import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-bold tracking-[-0.005em] transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 select-none";
/** Destello que cruza el botón al pasar el mouse (primario y oscuro). */
const SHEEN = "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.22)_50%,transparent_70%)] after:bg-[length:240%_100%] after:bg-[position:130%_0] after:transition-[background-position] after:duration-700 hover:after:bg-[position:-30%_0]";
const variants: Record<Variant, string> = {
  primary: SHEEN + " bg-primary text-on-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_10px_24px_-12px_rgb(58_69_39/0.7)] hover:bg-primary-hover hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_16px_30px_-12px_rgb(58_69_39/0.75)]",
  dark: SHEEN + " bg-night text-[#f6f1e8] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] hover:bg-night-2",
  light: "bg-[#fffdf8] text-night hover:bg-white",
  secondary: "border border-ink/15 bg-surface text-ink hover:border-ink/30 hover:bg-accent/40",
  ghost: "text-primary hover:bg-accent/60",
  danger: "text-danger hover:bg-danger-soft",
};
const sizes: Record<Size, string> = { sm: "min-h-10 px-4 text-sm", md: "min-h-12 px-6 text-[15px]", lg: "min-h-14 px-8 text-base" };

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string): string {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...props} />;
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
