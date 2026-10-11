"use client";
import { BookmarkCheck, CalendarCheck, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { getProduct } from "@/demo/engine/catalog";
import type { Gift } from "@/demo/engine/gifts";
import { formatDay } from "@/lib/date";

interface Props {
  gift: Gift;
  saved: boolean;
  preview: boolean;
  onSave: () => void;
  onReplay: () => void;
}

/** Lo que había adentro: el producto (sin precio), el mensaje escrito a mano y qué hacer ahora. */
export function GiftCard({ gift, saved, preview, onSave, onReplay }: Props) {
  const box = useRef<HTMLDivElement>(null);
  // Lo de adentro reemplaza al regalo: el foco pasa acá para que el lector de pantalla lo lea.
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);
  const product = getProduct(gift.item.slug);
  const variant = product?.variants.find((v) => v.label === gift.item.variant);
  return (
    <div ref={box} tabIndex={-1} className="gift-card flex max-h-full w-full max-w-md flex-col items-center overflow-y-auto text-center outline-none">
      <p className="eyebrow text-volt-soft">{gift.from} te regaló</p>
      <div className="gift-card-art relative mt-4 aspect-square w-[min(62vw,34dvh,260px)] overflow-hidden rounded-[2rem] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
        {product ? <ProductArt art={product.art} pack={product.pack} tint={variant?.colorHex} label={gift.item.name} className="h-full w-full [&>svg]:h-full" />
          : <div className="grid h-full place-items-center bg-white/5 text-sm text-night-muted">Un producto de Volta</div>}
      </div>
      <h2 className="font-display mt-5 text-[clamp(1.6rem,6vw,2.2rem)] leading-tight">{gift.item.name}</h2>
      <p className="mt-1 text-sm text-night-muted">{[gift.item.variant, gift.item.detail].filter(Boolean).join(" · ")}</p>
      {gift.message && (
        <blockquote className="font-script gift-card-note mt-5 w-full rounded-2xl bg-on-night px-5 py-4 text-left text-[1.45rem] leading-snug text-[#3a3226] shadow-lg" style={{ "--tilt": "-1.5deg" } as CSSProperties}>
          “{gift.message}”
          <footer className="mt-1 text-right text-lg text-[#6b5233]">— {gift.from}</footer>
        </blockquote>
      )}
      {gift.eta && (
        <p className="mt-4 flex items-center gap-2 text-sm text-night-muted"><CalendarCheck size={16} aria-hidden="true" className="text-volt-soft" /> Lo hace el taller y está listo el {formatDay(gift.eta, "long")}</p>
      )}
      <div className="mt-6 grid w-full gap-2">
        {preview ? (
          <p className="rounded-2xl bg-white/10 px-4 py-3 text-sm text-night-muted">Vista previa: así lo ve {gift.to}. No se guardó nada.</p>
        ) : saved ? (
          <Link href="/cuenta/#regalos" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-volt-soft px-6 font-bold text-night">
            <BookmarkCheck size={18} aria-hidden="true" /> Está en mis regalos
          </Link>
        ) : (
          <button type="button" onClick={onSave} className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-volt-soft px-6 font-bold text-night hover:brightness-105">
            <BookmarkCheck size={18} aria-hidden="true" /> Guardar en mis regalos
          </button>
        )}
        {/* A la tienda, no a la ficha: la ficha muestra el precio y quien recibe nunca lo ve. */}
        <Link href="/" className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/10 px-6 font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
          <ShoppingBag size={18} aria-hidden="true" /> Conocer Volta
        </Link>
        <button type="button" onClick={onReplay} className="mt-1 flex items-center justify-center gap-2 text-sm font-semibold text-night-muted hover:text-white">
          <RotateCcw size={15} aria-hidden="true" /> Abrirlo otra vez
        </button>
      </div>
    </div>
  );
}
