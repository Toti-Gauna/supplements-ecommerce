import { MomentGlyph } from "@/components/illustrations/BadgeGlyph";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { CartLine } from "@/demo/engine/cart-types";
import { getProduct } from "@/demo/engine/catalog";
import { lastingDays } from "@/demo/engine/repurchase";
import type { UsageMoment } from "@/demo/types";

const MOMENT: Record<UsageMoment, string> = { manana: "Mañana", comida: "Con las comidas", pre: "Antes de entrenar", intra: "Durante", post: "Después de entrenar", noche: "Noche" };

/**
 * "Cómo tomar cada producto" de la ficha de entrega: la dosis, el momento del día y cuánto le dura, con el modo de uso
 * que carga el dueño en el producto. Los que no tienen modo de uso (accesorios) no aparecen.
 */
export function HowToTake({ lines }: { lines: CartLine[] }) {
  const items = lines.flatMap((line) => {
    const product = getProduct(line.productSlug);
    const variant = product?.variants.find((v) => v.id === line.variantId);
    return product?.usage ? [{ line, product, variant, usage: product.usage, days: lastingDays(product, variant, line.quantity) }] : [];
  });
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="como-tomarlo" className="flex flex-col gap-3">
      <h2 id="como-tomarlo" className="font-display text-3xl">Cómo tomar cada producto</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map(({ line, product, variant, usage, days }) => (
          <li key={line.id} className="flex gap-3 rounded-sm border border-line bg-surface p-3">
            <div className="w-14 shrink-0"><LineThumb art={product.art} pack={product.pack} tint={variant?.colorHex} name={product.name} /></div>
            <div className="min-w-0 text-sm">
              <p className="font-bold leading-snug">{product.name}</p>
              {usage.dose && <p className="font-mono text-[12px] font-bold uppercase tracking-[0.04em] text-volt-ink">{usage.dose}{days ? ` · te dura ${days} días` : ""}</p>}
              <p className="mt-1 text-muted">{usage.text}</p>
              <p className="mt-1.5 flex flex-wrap gap-1">
                {usage.moments.map((m) => (
                  <span key={m} className="inline-flex items-center gap-1 rounded-xs border border-line px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]">
                    <MomentGlyph moment={m} className="h-3.5 w-3.5" />{MOMENT[m]}
                  </span>
                ))}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
