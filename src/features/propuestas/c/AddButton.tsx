"use client";
import { Check, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import s from "./arena.module.css";

interface AddButtonProps {
  productName: string;
  /** Dato al lado del ícono (el precio en la ficha y en el hero). */
  detail?: string;
  className?: string;
  classNames?: { label?: string; detail?: string };
  /** Variante sin stock: el botón queda deshabilitado y lo dice. */
  soldOut?: boolean;
}

/**
 * "Agregar" de la maqueta: encastra (golpe seco) y queda en "En la bolsa". No toca el carrito real.
 */
export function AddButton({ productName, detail, className, classNames, soldOut = false }: AddButtonProps) {
  const [added, setAdded] = useState(false);
  const add = () => setAdded(true);
  return (
    <button
      type="button"
      onClick={add}
      disabled={soldOut}
      aria-label={soldOut ? `${productName}: sin stock` : added ? `${productName}: en la bolsa` : `Agregar ${productName}`}
      className={cn(
        s.slant,
        added && s.snap,
        s.focusCut,
        "flex h-12 w-full items-center justify-between px-6",
        soldOut ? "cursor-not-allowed bg-[#1c1c24] text-[var(--a-muted)]" : added ? "bg-[var(--a-ink)] text-black" : "bg-[var(--a-volt)] text-black hover:bg-white",
        className,
      )}
    >
      <span className={cn(s.display, "text-xl", classNames?.label)}>{soldOut ? "Sin stock" : added ? "En la bolsa" : "Agregar"}</span>
      <span className={cn(s.display, s.num, "flex items-center gap-2 text-xl", classNames?.detail)}>
        {detail}
        {soldOut ? null : added ? <Check size={20} strokeWidth={3} aria-hidden="true" /> : <Plus size={20} strokeWidth={3} aria-hidden="true" />}
      </span>
    </button>
  );
}
