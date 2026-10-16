import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { LedPrice } from "@/components/atoms/Led";

export interface TrainCardProps {
  hue: string;
  name: string;
  pitch: string;
  /** El dibujo (silueta de atleta o deporte), en `currentColor`. */
  art: ReactNode;
  href: string;
  /** Rótulo del precio ("Su producto", "Su stack"). */
  priceLabel: string;
  price: number;
  /** Líneas chicas debajo del precio. */
  lines: ReactNode[];
  /** Link secundario por encima del link de la tarjeta (el pack del deporte). */
  extra?: { href: string; label: string };
  /** Guarda el lugar del link secundario aunque no haya (los precios de la fila quedan alineados). */
  reserveExtra?: boolean;
}

/**
 * Panel alto de "Entrená por objetivo o por deporte": el dibujo contra la luz del box en el color del objetivo o del
 * deporte, el nombre (link estirado al armador), el precio grande en el marcador y líneas chicas debajo. El link
 * secundario va por encima del estirado, como el botón de la tarjeta de pack.
 */
export function TrainCard({ hue, name, pitch, art, href, priceLabel, price, lines, extra, reserveExtra = false }: TrainCardProps) {
  return (
    <article style={{ "--hue": hue } as CSSProperties}
      className="group relative flex h-full min-h-[23rem] flex-col overflow-hidden bg-night text-on-night shadow-[inset_0_2px_0_var(--hue)] transition-shadow hover:shadow-[inset_0_2px_0_var(--hue),0_0_0_1px_var(--hue)] has-[h3_a:focus-visible]:outline-2 has-[h3_a:focus-visible]:outline-offset-2 has-[h3_a:focus-visible]:outline-primary">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-2/3 bg-[radial-gradient(60%_70%_at_50%_10%,color-mix(in_srgb,var(--hue)_28%,transparent),transparent_70%)]" />
      <span aria-hidden="true" className="relative mx-auto mt-4 block h-36 text-(--hue) opacity-90 transition-transform duration-300 group-hover:-translate-y-1 [&>svg]:h-full [&>svg]:w-auto">{art}</span>
      <div className="relative mt-auto flex flex-col gap-1 p-3 pb-2">
        <h3 className="font-display text-xl leading-none">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">{name}</Link>
        </h3>
        <p className="text-[12px] leading-snug text-night-muted">{pitch}</p>
      </div>
      <div className="relative border-t border-white/10 px-3 pb-3 pt-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-(--hue)">{priceLabel}</p>
        <div className="mt-1"><LedPrice amount={price} tone="chalk" motion="none" className="h-6 max-w-full" signClassName="text-lg" /></div>
        <ul className="mt-1.5 flex flex-col gap-0.5 font-mono text-[10.5px] leading-tight text-night-muted">
          {lines.map((l, i) => <li key={i} className="truncate">{l}</li>)}
        </ul>
        {extra && (
          <Link href={extra.href} className="relative z-[2] mt-2 inline-flex min-h-8 items-center gap-1 font-mono text-[10.5px] font-bold uppercase tracking-[0.08em] text-on-night underline decoration-(--hue) decoration-2 underline-offset-4 hover:text-(--hue)">
            {extra.label} <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        )}
        {!extra && reserveExtra && <span aria-hidden="true" className="mt-2 block min-h-8" />}
      </div>
    </article>
  );
}
