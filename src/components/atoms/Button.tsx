import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "dark" | "light";
type Size = "sm" | "md" | "lg";

/**
 * Botones del sistema BOX: rectos, rótulo en mono mayúscula y golpe seco al apretar.
 * - `primary`: el de compra. Placa llena (voltio de noche, grafito con letra voltio de día) con filo de luz arriba y
 *   canto oscuro abajo, como una placa apoyada.
 * - `secondary`: placa de acero con filo fino.
 * - `ghost`: solo el rótulo.
 * - `dark` / `light`: para bandas noche (oscuras en los dos modos).
 */
const base =
  "group/btn relative inline-flex select-none items-center justify-center gap-2 rounded-sm font-mono font-bold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow,border-color,filter] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45";
const EDGE = "shadow-[inset_0_1px_0_rgb(255_255_255/0.35),inset_0_-3px_0_rgb(0_0_0/0.28)]";
const variants: Record<Variant, string> = {
  primary: cn(EDGE, "bg-primary text-on-primary hover:bg-primary-hover"),
  dark: "bg-night text-on-night shadow-[inset_0_1px_0_rgb(255_255_255/0.08)] ring-1 ring-inset ring-white/20 hover:bg-night-2 hover:ring-volt/60",
  light: cn(EDGE, "bg-volt text-night hover:bg-volt-soft"),
  secondary: "plate border border-line text-ink hover:border-ink/50",
  ghost: "text-volt-ink hover:bg-accent/70",
  danger: "text-danger hover:bg-danger-soft",
};
const sizes: Record<Size, string> = { sm: "min-h-10 px-3.5 text-[12px]", md: "min-h-12 px-5 text-[13px]", lg: "min-h-14 px-7 text-sm" };

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
