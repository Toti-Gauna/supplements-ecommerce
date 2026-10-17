"use client";
import { BookmarkCheck, CalendarCheck, RotateCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { getProduct } from "@/demo/engine/catalog";
import type { Gift } from "@/demo/engine/gifts";
import { formatDay } from "@/lib/date";
import { SceneStyle } from "../kit";
import { HowTo } from "./HowTo";
import { STUDIO_CSS } from "./studio-css";
import { StoryShare } from "./StoryShare";
import { brand } from "@/config/brand";

export interface AthleteCardProps {
  gift: Gift;
  /** Ya está en Mis regalos (se guardó o llegó al email de la cuenta abierta). */
  saved: boolean;
  /** Vista previa de quien regala: no se guarda nada. */
  preview: boolean;
  onSave: () => void;
  onReplay: () => void;
  /**
   * Lugar para elegir sabor o tamaño cuando quien regala lo dejó abierto (`gift.openChoice`): va entre el producto y
   * "Guardá tu regalo". Lo arma quien conecta el regalo (motor y store), la tarjeta solo le da el lugar.
   */
  choice?: ReactNode;
}

/** Lo que se ve de la variante: la que eligió quien recibe, la que vino o "a elección" si quedó abierta. */
function variantLine(gift: Gift, label: string | undefined): string {
  if (label) return label;
  const open = gift.openChoice;
  if (open?.flavor || open?.size) return open.flavor && open.size ? "Sabor y tamaño a elección" : open.flavor ? "Sabor a elección" : "Tamaño a elección";
  return gift.item.variant;
}

/**
 * Revelación del regalo: la "tarjeta de atleta" sobre un estudio neutro (nunca el color de una fecha). El producto
 * como héroe, para quién es, "cómo tomarlo", el mensaje escrito a mano y quién lo manda; cierra con "Guardá tu regalo"
 * y "Compartí en tu historia". Sin precio y sin links a la ficha (que lo muestra).
 */
export function AthleteCard({ gift, saved, preview, onSave, onReplay, choice }: AthleteCardProps) {
  const box = useRef<HTMLDivElement>(null);
  // Lo de adentro reemplaza a la apertura: el foco pasa acá para que el lector de pantalla lo lea.
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);
  const product = getProduct(gift.item.slug);
  const chosen = gift.chosenVariantId ? product?.variants.find((v) => v.id === gift.chosenVariantId) : undefined;
  const variant = chosen ?? product?.variants.find((v) => v.label === gift.item.variant);
  const line = [variantLine(gift, chosen?.label), gift.item.detail].filter(Boolean).join(" · ");
  return (
    <div ref={box} tabIndex={-1} data-reveal-card="" className="gift-card relative flex w-full max-w-md flex-col items-stretch text-center outline-none lg:max-w-4xl">
      <SceneStyle id="athlete-studio" css={STUDIO_CSS} />
      <div aria-hidden="true" className="athlete-studio pointer-events-none fixed inset-0 -z-10" />
      <article className="athlete-card grid overflow-hidden rounded-sm border border-white/10 bg-night-2 text-left shadow-[0_50px_120px_-50px_rgb(0_0_0/0.95)] lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="flex items-center justify-between border-b border-white/10 py-2.5 pl-4 pr-10 font-mono text-[10.5px] font-bold uppercase tracking-[0.16em] text-night-muted lg:col-span-2">
          <span>Tarjeta de atleta · regalo</span>
          <span aria-hidden="true">Nº {gift.code.slice(-4)}</span>
        </div>
        <div className="relative">
          <div className="athlete-art relative aspect-square w-full overflow-hidden">
            {product ? <ProductArt art={product.art} pack={product.pack} tint={variant?.colorHex} label={gift.item.name} className="h-full w-full [&>svg]:h-full" />
              : <div className="grid h-full place-items-center text-sm text-night-muted">Un producto de {brand.name}</div>}
            <p className="athlete-to font-display pointer-events-none absolute bottom-3 left-4 right-4 text-[clamp(2.4rem,11vw,4.2rem)] uppercase italic leading-[0.85] text-on-night">
              Para {gift.to}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div>
            <p className="eyebrow text-volt-soft">Regalo de {gift.from}</p>
            <h2 className="font-display mt-2 text-[clamp(1.7rem,6vw,2.4rem)] leading-[0.95] text-on-night">{gift.item.name}</h2>
            {line && <p className="mt-1.5 font-mono text-xs font-bold uppercase tracking-[0.08em] text-night-muted">{line}</p>}
          </div>
          {product?.usage && <HowTo usage={product.usage} />}
          {gift.message && (
            <blockquote className="font-script gift-card-note rounded-sm bg-on-night px-5 py-4 text-[1.45rem] leading-snug text-night shadow-lg">
              “{gift.message}”
              <footer className="mt-1 text-right text-lg text-night/75">— {gift.from}</footer>
            </blockquote>
          )}
          {gift.eta && (
            <p className="flex items-center gap-2 text-sm text-night-muted"><CalendarCheck size={16} aria-hidden="true" className="text-volt-soft" /> Sale del local el {formatDay(gift.eta, "long")}</p>
          )}
          {choice && <div data-choice-slot="">{choice}</div>}
        </div>
      </article>
      <div className="mt-5 grid w-full gap-2 sm:grid-cols-2">
        {preview ? (
          <p className="rounded-sm bg-white/10 px-4 py-3 text-sm text-night-muted sm:col-span-2">Vista previa: así lo ve {gift.to}. No se guardó nada.</p>
        ) : saved ? (
          <Link href="/cuenta/#regalos" className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-volt-soft px-6 font-bold text-night">
            <BookmarkCheck size={18} aria-hidden="true" /> Está en mis regalos
          </Link>
        ) : (
          <button type="button" onClick={onSave} className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-volt-soft px-6 font-bold text-night hover:brightness-105">
            <BookmarkCheck size={18} aria-hidden="true" /> Guardá tu regalo
          </button>
        )}
        <StoryShare code={gift.code} to={gift.to} from={gift.from} product={gift.item.name} variant={line} message={gift.message}
          art={product?.art ?? "tub"} pack={product?.pack} tint={variant?.colorHex} />
        {/* A la tienda, no a la ficha: la ficha muestra el precio y quien recibe nunca lo ve. */}
        <Link href="/" className="flex min-h-12 items-center justify-center gap-2 rounded-sm bg-white/10 px-6 font-bold text-on-night ring-1 ring-white/15 hover:bg-white/20">
          <ShoppingBag size={18} aria-hidden="true" /> Conocer {brand.name}
        </Link>
        <button type="button" onClick={onReplay} className="flex min-h-12 items-center justify-center gap-2 text-sm font-semibold text-night-muted hover:text-on-night">
          <RotateCcw size={15} aria-hidden="true" /> Abrirlo otra vez
        </button>
      </div>
    </div>
  );
}
