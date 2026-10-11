"use client";
import { LineThumb } from "@/components/organisms/LineThumb";
import type { CartLine } from "@/demo/engine/cart-types";
import { collarLineDetail, getProduct } from "@/demo/engine/catalog";
import { quoteLines } from "@/demo/engine/pricing";
import { demoData } from "@/demo/engine/source";
import { formatARS } from "@/lib/money";

const KIND = { TEXT: "Texto", PHOTO: "Foto", PHOTO_REFERENCE: "Foto de referencia" };

/** Ítems con la personalización exactamente como se aprobó (en la demo, fotos ilustrativas). */
export function OrderItems({ lines }: { lines: CartLine[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {quoteLines(lines).map(({ line, lineTotal }) => {
        const product = getProduct(line.productSlug);
        const variant = product?.variants.find((v) => v.id === line.variantId);
        const p = line.personalization;
        if (!product) return null;
        return (
          <li key={line.id} className="flex flex-wrap gap-3 rounded-3xl bg-surface shadow-[var(--shadow-card)] p-3">
            <div className="w-20 shrink-0"><LineThumb art={product.art} tint={variant?.colorHex} name={product.name} personalization={p} zone={demoData().textZones[product.art]} /></div>
            <div className="min-w-0 flex-1 basis-40 text-sm">
              <p className="font-bold">{line.quantity} × {product.name}</p>
              <p className="text-muted">Variante: {variant?.label ?? "—"}</p>
              {p ? (
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2">
                  <dt className="text-muted">Personalización</dt><dd className="font-semibold">{KIND[p.kind]} · aprobada</dd>
                  {p.text && (<><dt className="text-muted">Texto</dt><dd className="font-semibold">“{p.text}” · {p.font} · {p.colorName}</dd></>)}
                  {p.collar && (<><dt className="text-muted">Collar</dt><dd className="font-semibold">{collarLineDetail(line)}</dd></>)}
                  {p.notes && (<><dt className="text-muted">Notas</dt><dd>{p.notes}</dd></>)}
                  {p.kind !== "TEXT" && !p.previewDataUrl && !p.referenceDataUrl && (<><dt className="text-muted">Archivo</dt><dd>Foto original ficticia (en producción: descarga privada en calidad completa)</dd></>)}
                </dl>
              ) : <p className="text-muted">Sin personalización</p>}
              {line.gift && (
                <p className="mt-2 rounded-xl bg-accent/60 px-3 py-2 text-[13px]">
                  <strong>Es un regalo</strong> para {line.gift.to}, de {line.gift.from}: envolver y no poner el precio.
                  {line.gift.message && <span className="mt-0.5 block text-muted">Mensaje: “{line.gift.message}”</span>}
                </p>
              )}
            </div>
            <span className="ml-auto font-bold tabular-nums">{formatARS(lineTotal)}</span>
          </li>
        );
      })}
    </ul>
  );
}
