import { ShieldCheck } from "lucide-react";
import { BadgeGlyph } from "@/components/illustrations/BadgeGlyph";
import { pricePerServing } from "@/demo/engine/servings";
import type { ProductBadge, Product } from "@/demo/types";
import { formatARS } from "@/lib/money";

const BADGE_LABEL: Record<ProductBadge, string> = {
  "sin-tacc": "Sin TACC", vegano: "Vegano", "sin-azucar": "Sin azúcar", keto: "Keto", "marca-propia": "Marca propia", "sin-cafeina": "Sin cafeína",
};

/** Sellos del rótulo (sin TACC, vegano, sin azúcar…), cada uno con su ícono. */
export function ProductBadges({ badges }: { badges: ProductBadge[] }) {
  if (badges.length === 0) return null;
  return (
    <ul aria-label="Sellos" className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <li key={b} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold">
          <BadgeGlyph badge={b} className="h-4 w-4 text-volt-ink" />{BADGE_LABEL[b]}
        </li>
      ))}
    </ul>
  );
}

/** "$ 1.830 por servicio · 30 servicios": el dato que más se compara entre suplementos. */
export function ServingPrice({ price, servings }: { price: number; servings?: number }) {
  const pps = pricePerServing(price, servings);
  if (pps === null || !servings || servings < 2) return null;
  return (
    <p className="font-lab inline-flex items-center gap-2 rounded-full bg-night px-3 py-1 text-xs font-bold text-on-night ring-1 ring-volt/30">
      <span className="text-volt">{formatARS(pps)}</span> por servicio <span className="text-night-muted">· {servings} servicios</span>
    </p>
  );
}

/** Lote y vencimiento del envase disponible (confianza: "es original y no está por vencer"). */
export function LotNote({ product }: { product: Product }) {
  if (!product.lot) return null;
  const [y, m] = product.lot.expires.split("-");
  return (
    <p className="font-lab flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
      <ShieldCheck size={15} aria-hidden="true" className="text-success" />
      <span>Lote <strong className="text-ink">{product.lot.code}</strong></span>
      <span aria-hidden="true">·</span>
      <span>Vence <strong className="text-ink">{m}/{y}</strong></span>
      <span aria-hidden="true">·</span>
      <span>{product.brand}</span>
    </p>
  );
}
