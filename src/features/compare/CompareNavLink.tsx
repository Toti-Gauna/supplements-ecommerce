"use client";
import Link from "next/link";
import { GitCompareArrows } from "lucide-react";
import { plural } from "@/lib/plural";
import { useCompareTray } from "./useCompareTray";

/**
 * Acceso discreto al comparador: solo existe si la bandeja tiene algo (no suma un link fijo a la navegación).
 * `icon`: el botón del header, con el número; `row`: la fila del menú del celular.
 */
export function CompareNavLink({ variant, className, onClick }: { variant: "icon" | "row"; className?: string; onClick?: () => void }) {
  const { slugs, href } = useCompareTray();
  if (!slugs.length) return null;
  if (variant === "row") {
    return (
      <Link href={href} onClick={onClick} className={className}>
        <GitCompareArrows size={18} aria-hidden="true" className="text-volt-ink" />Comparar ({slugs.length})
      </Link>
    );
  }
  return (
    <Link href={href} aria-label={`Comparar, ${plural(slugs.length, "producto elegido", "productos elegidos")}`} className={className}>
      <span className="relative">
        <GitCompareArrows size={20} aria-hidden="true" />
        <span aria-hidden="true" className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center bg-primary px-0.5 font-mono text-[10px] font-bold leading-4 text-on-primary">{slugs.length}</span>
      </span>
    </Link>
  );
}
