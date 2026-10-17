"use client";
import { useEffect, useRef } from "react";
import { openingLine } from "@/demo/engine/gift-opening";
import { cn } from "@/lib/cn";
import { CARD_H, CARD_W, drawGiftCard, loadCardFonts, type GiftCardArtData } from "./drawGiftCard";

/** Lectura de la tarjeta para lectores de pantalla (y para los tests): lo mismo que dice la imagen. */
export function cardLabel(d: GiftCardArtData): string {
  const message = d.message.trim();
  return [`Tarjeta para ${d.to.trim() || "…"}, de ${d.from.trim() || "…"}`, message ? `“${message}”` : "", openingLine({ occasion: d.occasion, opening: d.opening }).replace(/\.$/, ""), d.code ?? ""]
    .filter(Boolean).join(". ");
}

/**
 * Vista previa en vivo de la tarjeta (R3b): el mismo dibujo que se manda como imagen, así lo que se ve es lo que llega.
 * Se redibuja en el próximo cuadro después de cada cambio y otra vez cuando terminan de cargar las fuentes.
 */
export function GiftCardCanvas({ data, className }: { data: GiftCardArtData; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify(data);
  useEffect(() => {
    let alive = true;
    const paint = () => { const ctx = canvas.current?.getContext("2d"); if (alive && ctx) drawGiftCard(ctx, JSON.parse(key) as GiftCardArtData); };
    const frame = requestAnimationFrame(paint);
    void loadCardFonts().then(paint);
    return () => { alive = false; cancelAnimationFrame(frame); };
  }, [key]);
  return (
    <canvas ref={canvas} width={CARD_W} height={CARD_H} role="img" aria-label={cardLabel(data)}
      className={cn("block aspect-[4/5] h-auto w-full rounded-sm shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] ring-1 ring-ink/10", className)} />
  );
}
