import Link from "next/link";
import { Gift, Trash2 } from "lucide-react";
import type { LineGift } from "@/demo/engine/cart-types";
import type { ArtKey, PackStyle } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { QuantityStepper } from "@/components/molecules/QuantityStepper";
import { LineThumb } from "./LineThumb";

export interface CartLineView {
  id: string;
  slug: string;
  name: string;
  variantLabel: string;
  art: ArtKey;
  pack?: PackStyle;
  tint?: string;
  /** Servicios de la presentación (para "30 servicios"). */
  servings?: number;
  unitPrice: number;
  lineTotal: number;
  quantity: number;
  maxQuantity: number;
  gift?: LineGift;
  photoUrl?: string;
  /** Días que dura lo de esta línea con el consumo de referencia; null si no aplica (accesorios). */
  lastsDays?: number | null;
}

interface CartLineItemProps {
  line: CartLineView;
  onQuantity: (q: number) => void;
  onRemove: () => void;
  /** `compact`: la del carrito lateral (pote más chico, sin precio unitario). */
  size?: "compact" | "full";
  /** Al tocar el nombre (el carrito lateral se cierra al ir a la ficha). */
  onNavigate?: () => void;
}

/** Línea del bolso: el pote, cuánto te dura, la cantidad y el total de la línea. */
export function CartLineItem({ line, onQuantity, onRemove, size = "full", onNavigate }: CartLineItemProps) {
  const compact = size === "compact";
  return (
    <li className={cn("relative flex gap-3 rounded-sm bg-surface p-3", compact ? "border border-line" : "animate-fade-up shadow-[var(--shadow-card)] sm:gap-5 sm:p-4")}>
      <div className={cn("shrink-0", compact ? "w-16" : "w-20 sm:w-32")}><LineThumb art={line.art} pack={line.pack} tint={line.tint} name={line.name} /></div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Link href={`/p/${line.slug}/`} onClick={onNavigate} className={cn("line-clamp-2 pr-8 font-bold leading-snug hover:underline", compact ? "text-sm" : "text-[15px] sm:text-base")}>{line.name}</Link>
        <p className="text-[13px] text-muted">{line.variantLabel}{!compact && line.servings && line.servings > 1 ? <span className="font-lab"> · {line.servings} serv.</span> : null}</p>
        {line.lastsDays ? <p className="font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-volt-ink">Te dura {line.lastsDays} días</p> : null}
        {line.gift && <GiftTag gift={line.gift} />}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
          <QuantityStepper size="sm" label={`Cantidad de ${line.name}`} value={line.quantity} max={line.maxQuantity} onChange={onQuantity} />
          <div className="text-right">
            <p className="font-extrabold tabular-nums">{formatARS(line.lineTotal)}</p>
            {!compact && line.quantity > 1 && <p className="text-xs text-muted">{formatARS(line.unitPrice)} c/u</p>}
          </div>
        </div>
      </div>
      <button type="button" onClick={onRemove} aria-label={`Quitar ${line.name}`} className="absolute right-1.5 top-1.5 grid h-10 w-10 place-items-center rounded-sm text-danger hover:bg-danger-soft">
        <Trash2 size={18} aria-hidden="true" />
      </button>
    </li>
  );
}

/** Marca de regalo en la línea: para quién es y de parte de quién. */
export function GiftTag({ gift }: { gift: LineGift }) {
  return (
    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-bold text-volt-ink">
      <Gift size={14} aria-hidden="true" /> Regalo para {gift.to} · de {gift.from}
    </p>
  );
}
