"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/atoms/Button";
import { LedPrice } from "@/components/atoms/Led";
import { RackShot } from "@/components/illustrations/RackShot";
import { quotePack } from "@/demo/engine/packs";
import type { Pack } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { lastsText, packHref, packRack } from "./packRack";

const TAG = "px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em]";

/**
 * Tarjeta de un pack: el foco (objetivo o deporte), hasta tres envases en su estante y, abajo, el precio de la primera
 * entrega en el marcador con el subtotal tachado, lo que sale por mes y cuánto dura. Misma estructura que la ficha de
 * rack del producto: la caja va en su capa y el botón por encima del link estirado del nombre.
 */
export function PackCard({ pack }: { pack: Pack }) {
  const q = quotePack(pack);
  const lasts = lastsText(q.lastsDays);
  return (
    <article data-pack-card={pack.id} className="group relative flex h-full flex-col border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)] has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-primary">
      <div className="pointer-events-none relative z-[1]">
        <p className="plate flex h-7 items-center justify-between gap-2 px-2.5">
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{pack.focus}</span>
          {pack.discountPct > 0 && <span className={`${TAG} shrink-0 bg-volt text-night`}>{pack.discountPct} % OFF</span>}
        </p>
        <div className="rack-bay relative aspect-[5/4] overflow-hidden">
          <RackShot items={packRack(q)} label={pack.name} className="transition-transform duration-300 group-hover:-translate-y-1" />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
        <div>
          <h3 className="font-display text-[1.6rem] leading-[0.95] sm:text-[1.9rem]">
            <Link href={packHref(pack.id)} className="after:absolute after:inset-0 focus-visible:outline-none">{pack.name}</Link>
          </h3>
          <p className="mt-1.5 text-sm text-muted">{pack.tagline}</p>
        </div>
        <div>
          <p className="eyebrow text-[10px] text-muted">Primera entrega</p>
          <div className="mt-1"><LedPrice amount={q.price} motion="none" className="h-8 max-w-full sm:h-10" signClassName="text-xl sm:text-2xl" /></div>
          {q.discount > 0 && <p className="mt-1.5 font-mono text-[11px] text-muted"><span className="sr-only">Antes </span><s>{formatARS(q.subtotal)}</s></p>}
        </div>
        <ul className="mt-auto flex flex-col gap-1 border-t border-line pt-2.5 font-mono text-[11px] text-muted">
          <li><span className="text-ink">{formatARS(q.monthlyPrice)}</span> por mes suscripto</li>
          {lasts && <li>{lasts[0]!.toUpperCase() + lasts.slice(1)}</li>}
          {!q.available && <li className="font-bold text-danger">Sin stock de {q.missing.join(", ")}</li>}
        </ul>
        <ButtonLink href={packHref(pack.id)} className="z-[2] w-full justify-between">
          <span>Ver pack<span className="sr-only"> {pack.name}</span></span><ArrowRight size={16} aria-hidden="true" />
        </ButtonLink>
      </div>
    </article>
  );
}
