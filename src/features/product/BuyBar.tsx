"use client";
import { Gift, ShoppingBag, Zap } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { FLOATING_BAR } from "@/components/organisms/bottomBars";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";

interface Props {
  total: number;
  perServing: number | null;
  canBuy: boolean;
  preview: boolean;
  onAdd: () => void;
  onBuy: () => void;
  onGift: () => void;
}

/**
 * Un solo CTA principal (Agregar al carrito) y dos secundarios del mismo peso: Comprar ahora y Regalar. En el celular,
 * Agregar y Regalar viven en la barra fija de abajo (con el total y el precio por servicio) y acá queda Comprar ahora.
 */
export function BuyActions({ canBuy, preview, onAdd, onBuy, onGift }: Omit<Props, "total" | "perServing">) {
  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" disabled={!canBuy} onClick={onAdd} className="w-full max-sm:hidden"><ShoppingBag size={18} aria-hidden="true" />Agregar al carrito</Button>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
        <Button variant="secondary" disabled={!canBuy} onClick={onBuy} className="w-full"><Zap size={17} aria-hidden="true" className="text-volt-ink" />Comprar ahora</Button>
        <Button variant="secondary" disabled={!canBuy} onClick={onGift} className="w-full max-sm:hidden"><Gift size={17} aria-hidden="true" className="text-volt-ink" />Regalar</Button>
      </div>
      {preview
        ? <p className="text-center text-xs font-bold text-warning">Vista previa: comprar y regalar están apagados.</p>
        : <p className="text-center text-xs text-muted">Regalar: le mandás un link o un código y lo abre a golpes, sin ver el precio.</p>}
    </div>
  );
}

/** Barra fija del celular: Regalar a la izquierda y Agregar con el total y el precio por servicio. */
export function MobileBuyBar({ total, perServing, canBuy, preview, onAdd, onGift }: Omit<Props, "onBuy">) {
  return (
    <div data-buy-bar hidden={preview} className={cn(FLOATING_BAR, "z-30 sm:hidden")}>
      <Button variant="secondary" disabled={!canBuy} onClick={onGift} className="h-14 w-16 shrink-0 flex-col gap-0.5 px-0 text-[10.5px] tracking-[0.06em]">
        <Gift size={18} aria-hidden="true" className="text-volt-ink" />Regalar
      </Button>
      <Button size="lg" disabled={!canBuy} onClick={onAdd} className="h-14 min-w-0 flex-1 justify-between gap-2 whitespace-nowrap px-4 text-[13px] tracking-[0.06em]">
        <span>Agregar<span className="sr-only"> al carrito</span></span>
        <span className="flex flex-col items-end leading-tight">
          <span key={total} className="animate-num tabular-nums">{formatARS(total)}</span>
          {perServing !== null && <span className="text-[10.5px] font-semibold opacity-80">{formatARS(perServing)}/serv.</span>}
        </span>
      </Button>
    </div>
  );
}
