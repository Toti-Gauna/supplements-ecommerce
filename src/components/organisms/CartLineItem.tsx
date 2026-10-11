import Link from "next/link";
import { Gift, Trash2 } from "lucide-react";
import type { LineGift, LinePersonalization } from "@/demo/engine/cart-types";
import type { ArtKey } from "@/demo/types";
import type { TextZone } from "@/demo/fixtures/templates";
import { formatARS } from "@/lib/money";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { LineThumb } from "./LineThumb";
import { collarLineDetail } from "@/demo/engine/catalog";

export interface CartLineView {
  id: string;
  slug: string;
  name: string;
  variantLabel: string;
  art: ArtKey;
  tint?: string;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
  maxQuantity: number;
  personalization?: LinePersonalization;
  gift?: LineGift;
  zone?: TextZone;
  photoUrl?: string;
}

const KIND = { TEXT: "Texto", PHOTO: "Con tu foto", PHOTO_REFERENCE: "Desde foto de referencia" };

export function CartLineItem({ line, onQuantity, onRemove }: { line: CartLineView; onQuantity: (q: number) => void; onRemove: () => void }) {
  const p = line.personalization;
  return (
    <li className="relative animate-fade-up flex gap-3 rounded-3xl bg-surface p-3 shadow-[var(--shadow-card)] sm:gap-5 sm:p-4">
      <div className="w-20 shrink-0 sm:w-32"><LineThumb art={line.art} tint={line.tint} name={line.name} personalization={p} zone={line.zone} /></div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link href={`/p/${line.slug}/`} className="line-clamp-2 pr-8 text-[15px] font-bold leading-snug hover:underline sm:text-base">{line.name}</Link>
        <p className="text-[13px] text-muted">{line.variantLabel}</p>
        {line.gift && <GiftTag gift={line.gift} />}
        {p && (
          <>
            <p className="line-clamp-2 text-[13px]">
              <span className="font-bold text-success">✓ Aprobada</span> · {KIND[p.kind]}
              {p.text && <> · “{p.text}” ({p.font}, {p.colorName})</>}
              {p.notes && <span className="block truncate text-muted">Notas: {p.notes}</span>}
            </p>
            {/* Fuera del recorte de 2 líneas: el detalle del collar es lo que se fabrica y tiene que leerse entero. */}
            {p.collar && <p className="text-[13px] text-muted">{collarLineDetail({ productSlug: line.slug, personalization: p })}</p>}
          </>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <QuantityStepper size="sm" label={`Cantidad de ${line.name}`} value={line.quantity} max={line.maxQuantity} onChange={onQuantity} />
          <div className="text-right">
            <p className="font-extrabold tabular-nums">{formatARS(line.lineTotal)}</p>
            {line.quantity > 1 && <p className="text-xs text-muted">{formatARS(line.unitPrice)} c/u</p>}
          </div>
        </div>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Quitar ${line.name}`} className="absolute right-2 top-2 grid h-10 w-10 place-items-center rounded-full text-danger hover:bg-danger-soft">
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </li>
  );
}

/** Marca de regalo en la línea: para quién es y de parte de quién. */
export function GiftTag({ gift }: { gift: LineGift }) {
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-bold text-brass-ink">
      <Gift size={14} aria-hidden="true" /> Regalo para {gift.to} · de {gift.from}
    </p>
  );
}
