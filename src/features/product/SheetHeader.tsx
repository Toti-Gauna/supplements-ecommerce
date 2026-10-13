import { ProductVisual } from "@/components/illustrations/ProductVisual";
import type { Product } from "@/demo/types";
import { FavoriteButton } from "./FavoriteButton";
import { ProductBadges } from "./SupplementFacts";

interface Props {
  product: Product;
  category?: string;
  tint?: string;
  /** Vista previa del panel: sin favoritos. */
  preview: boolean;
}

/**
 * Encabezado de la hoja técnica. En el celular el pote chico acompaña al nombre: el primer pantallazo ya dice qué es,
 * de qué marca y con qué sellos (la galería grande va más abajo).
 */
export function SheetHeader({ product: p, category, tint, preview }: Props) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className="plate grid size-[5.5rem] shrink-0 place-items-center overflow-hidden rounded-sm lg:hidden">
        <ProductVisual art={p.art} pack={p.pack} photoUrl={p.photoDataUrl} tint={tint} label="" showBadge={false} className="size-full" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-lab text-[11px] font-bold uppercase tracking-[0.14em] text-volt-ink">{category}{p.brand ? ` · ${p.brand}` : ""}{p.isNew ? " · Nuevo" : ""}</p>
        <h1 className="font-display mt-1.5 text-[clamp(1.9rem,4.4vw,3.4rem)] leading-[0.98] [text-wrap:balance] lg:mt-3">{p.name}</h1>
        <p className="mt-2 text-[15px] text-muted max-sm:line-clamp-2 sm:text-lg">{p.short}</p>
        {(p.badges?.length ?? 0) > 0 && <div className="mt-3"><ProductBadges badges={p.badges!} /></div>}
      </div>
      {!preview && <FavoriteButton slug={p.slug} name={p.name} className="h-11 w-11 sm:h-12 sm:w-12" />}
    </div>
  );
}
