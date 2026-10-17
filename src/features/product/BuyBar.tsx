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
 * Botones en columna, del mismo ancho y en este orden (8.2.7): Agregar al carrito (el principal), Comprar ahora y
 * Regalar ahora. En el celular "Agregar" vive en la barra fija de abajo, así no se repite.
 */
export function BuyActions({ canBuy, preview, onAdd, onBuy, onGift }: Omit<Props, "total" | "perServing">) {
  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" disabled={!canBuy} onClick={onAdd} className="w-full max-sm:hidden"><ShoppingBag size={18} aria-hidden="true" />Agregar al carrito</Button>
      <Button variant="dark" disabled={!canBuy} onClick={onBuy} className="w-full"><Zap size={17} aria-hidden="true" className="text-volt" />Comprar ahora</Button>
      <Button variant="secondary" disabled={!canBuy} onClick={onGift} className="w-full"><Gift size={17} aria-hidden="true" className="text-volt-ink" />Regalar ahora</Button>
      {preview
        ? <p className="text-center text-xs font-bold text-warning">Vista previa: comprar y regalar están apagados.</p>
        : <p className="text-center text-xs text-muted">Regalar: le mandás un link o un código y lo abre a golpes, sin ver el precio.</p>}
    </div>
  );
}

/**
 * Barra fija del celular: Regalar a la izquierda y Agregar con el precio total primero (grande) y, abajo en chico,
 * el precio por servicio (L1). En la vista previa del panel no aparece.
 */
export function MobileBuyBar({ total, perServing, canBuy, preview, onAdd, onGift }: Omit<Props, "onBuy">) {
  return (
    <div data-buy-bar hidden={preview} className={cn(FLOATING_BAR, "z-30 sm:hidden")}>
      <Button variant="secondary" disabled={!canBuy} onClick={onGift} aria-label="Regalar" className="h-14 w-16 shrink-0 flex-col gap-0.5 px-0 text-[10.5px] tracking-[0.06em]">
        <Gift size={18} aria-hidden="true" className="text-volt-ink" />Regalar
      </Button>
      <Button size="lg" disabled={!canBuy} onClick={onAdd} className="h-14 min-w-0 flex-1 justify-between gap-2 whitespace-nowrap px-4">
        <span data-bar-total className="flex min-w-0 flex-col items-start leading-tight">
          <span key={total} className="animate-num font-lab text-[17px] font-bold normal-case tracking-[-0.02em] tabular-nums">{formatARS(total)}</span>
          {perServing !== null && <span className="font-lab text-[10.5px] font-semibold normal-case tracking-normal opacity-80">{formatARS(perServing)} por servicio</span>}
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] tracking-[0.06em]"><ShoppingBag size={17} aria-hidden="true" />Agregar<span className="sr-only"> al carrito</span></span>
      </Button>
    </div>
  );
}
