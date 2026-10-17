"use client";
import { Check, Copy, Ticket } from "lucide-react";
import { dropDiscount, missingForDrop } from "@/demo/engine/campaign-drop";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { useCurrentTheme } from "../themes/useCurrentTheme";
import { useThemeCoupon } from "../themes/useThemeCoupon";
import { campaignCopy } from "./copy";

type Where = "ficha" | "carrito" | "seguimiento" | "club";

interface SeasonTicketProps {
  where: Where;
  /** En la ficha: solo aparece si el producto es parte de la campaña. */
  productSlug?: string;
  /** En el carrito: cuánto falta para el mínimo del cupón. */
  subtotal?: number;
  className?: string;
}

const ACTION = "inline-flex min-h-11 shrink-0 items-center justify-center gap-1.5 border border-line px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-ink hover:border-ink/50 disabled:opacity-100";

/**
 * La fecha en la ficha, el carrito, el seguimiento y el club (R3a, regla de marca): un ticket de la campaña con el
 * talón y el filo del color de la fecha (`--season-accent`). Es lo único que tiñe: los botones de compra y los precios
 * de la página no cambian (test `r3a-campanas` → regla del tinte). Sin temática no aparece.
 */
export function SeasonTicket({ where, productSlug, subtotal, className }: SeasonTicketProps) {
  const { theme, offer } = useCurrentTheme();
  const { copy, apply, applied } = useThemeCoupon();
  if (!theme || !offer) return null;
  if (where === "ficha" && (!productSlug || !theme.productSlugs.includes(productSlug))) return null;
  const code = offer.coupon.code;
  const off = dropDiscount(offer.coupon).label;
  const kind = campaignCopy(theme).kind;
  const missing = subtotal === undefined ? 0 : missingForDrop(subtotal, offer.coupon);
  const title = {
    ficha: theme.sport ? `Para el ${theme.name}` : `Parte del ${kind.toLowerCase()} ${theme.name}`,
    carrito: `${theme.name}: ${off} con ${code}`,
    seguimiento: `Pedido en ${theme.name}`,
    club: `${theme.name} en el club`,
  }[where];
  const detail = where === "carrito"
    ? (missing > 0 ? `Te faltan ${formatARS(missing)} para el ${off}.` : "Tu carrito ya llega: se aplica al pagar.")
    : `${off} con ${code}${offer.condition ? ` · ${offer.condition.toLowerCase()}` : ""}.`;
  const on = applied === code;
  return (
    <aside aria-label={`Campaña ${theme.name}`} data-season-ticket={where}
      className={cn("flex items-stretch overflow-hidden rounded-sm border border-line border-l-0 bg-surface shadow-[0_0_0_1px_var(--season-glow)]", className)}>
      <span className="grid w-12 shrink-0 place-items-center border-r-2 border-dashed border-(--season-accent-ink)/30 bg-(--season-accent) text-(--season-accent-ink)">
        <Ticket size={18} aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 p-3">
        <p className="min-w-0 flex-1 basis-48">
          <strong className="block text-sm">{title}</strong>
          <span className="block text-xs text-muted">{detail}</span>
        </p>
        {where === "carrito" ? (
          <button type="button" onClick={() => apply(code)} disabled={on} aria-label={on ? "Cupón en tu carrito" : `Usar ${code}`} className={ACTION}>
            {on ? <><Check size={15} aria-hidden="true" />En tu carrito</> : `Usar ${code}`}
          </button>
        ) : (
          <button type="button" onClick={() => copy(code)} aria-label={`Copiar el código ${code}`} className={ACTION}>
            {code} <Copy size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </aside>
  );
}
