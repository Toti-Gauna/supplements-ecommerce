import { DISPATCH_PROMISE } from "@/demo/engine/lead-time";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { isGear } from "@/demo/engine/catalog";
import type { Product } from "@/demo/types";
import { brand } from "@/config/brand";

function Item({ title, children, open }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-bold [&::-webkit-details-marker]:hidden">
        {title}<ChevronDown size={18} aria-hidden="true" className="shrink-0 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="animate-fade-in pb-5 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}

/** Descripción, envase o medidas, envíos y cambios (distintos para suplementos y equipamiento) y preguntas del producto. */
export function ProductAccordions({ product }: { product: Product }) {
  const d = product.dims;
  const gear = isGear(product);
  return (
    <div className="border-t border-line">
      <Item title="Descripción" open>{product.description}</Item>
      <Item title={gear ? "Medidas y disponibilidad" : "Envase y disponibilidad"}>
        {gear
          ? (d ? <p>Medidas: {d.lengthCm} × {d.widthCm} × {d.heightCm} cm · {d.weightG} g.</p> : <p>Medidas a confirmar por {brand.name}.</p>)
          : d?.weightG ? <p>Peso con envase: {d.weightG} g.</p> : <p>Peso del envase a confirmar por {brand.name}.</p>}
        {product.madeToOrderDays ? <p className="mt-1">Por encargo: llega al local en {product.madeToOrderDays} días hábiles desde la confirmación del pago.</p> : <p className="mt-1">En stock: sale {DISPATCH_PROMISE}.</p>}
      </Item>
      <Item title="Envíos, retiro y cambios">
        <p>Cadete en Mar del Plata {DISPATCH_PROMISE}, envío al resto del país o retiro en el local. {gear
          ? "Cambio dentro de los 10 días, sin uso y con la etiqueta; el cambio de talle en Mar del Plata no tiene costo (ver términos)."
          : "Por higiene, los suplementos abiertos o sin precinto no tienen cambio (ver términos)."}</p>
      </Item>
      {product.faqs.length > 0 && (
        <Item title="Preguntas frecuentes">
          <dl className="flex flex-col gap-3">{product.faqs.map((f) => <div key={f.q}><dt className="font-bold text-ink">{f.q}</dt><dd>{f.a}</dd></div>)}</dl>
        </Item>
      )}
    </div>
  );
}
