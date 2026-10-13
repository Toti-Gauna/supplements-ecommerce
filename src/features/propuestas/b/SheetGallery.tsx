import { ProductArt } from "@/components/illustrations/ProductArt";
import { cn } from "@/lib/cn";
import type { SheetView } from "./sheet-data";
import { LabPack } from "./LabPack";
import s from "./lab.module.css";

/**
 * Galería de la ficha como placas de laboratorio: el frente con cotas, el detalle y el envase en el box (la escena de
 * estudio de la librería) y el rótulo nutricional como placa propia, que es lo que más se busca antes de comprar.
 */
export function SheetGallery({ view }: { view: SheetView }) {
  const { product: p, variant } = view;
  const rows = (p.nutrition?.rows ?? []).filter((r) => !r.sub).slice(0, 5);
  const thumbs = [
    { key: "front", label: "Frente", node: <LabPack art={p.art} pack={p.pack} tint={variant.colorHex} label={p.name} size={0.9} className="h-full w-full" /> },
    { key: "detail", label: "Detalle", node: <ProductArt art={p.art} view="detail" pack={p.pack} tint={variant.colorHex} label={p.name} showBadge={false} className="h-full w-full" /> },
    { key: "context", label: "En el box", node: <ProductArt art={p.art} view="context" pack={p.pack} tint={variant.colorHex} label={p.name} showBadge={false} className="h-full w-full" /> },
    {
      key: "label", label: "Rótulo", node: (
        <span className={cn(s.mono, "flex h-full flex-col justify-center gap-[3px] bg-(--card) px-2 text-left text-[7.5px] leading-none")}>
          {rows.map((r) => <span key={r.label} className="flex justify-between gap-1 border-b border-(--rule) pb-[3px]"><span className="truncate">{r.label}</span><b className="shrink-0 whitespace-nowrap">{r.serving.split(" =")[0]}</b></span>)}
        </span>
      ),
    },
  ];
  return (
    <div className="flex flex-col-reverse gap-2.5 sm:flex-row">
      <ul aria-label="Vistas del producto" className="grid grid-cols-4 gap-2 sm:flex sm:w-[96px] sm:flex-col">
        {thumbs.map((t, i) => (
          <li key={t.key}>
            <button type="button" aria-label={`Ver ${t.label.toLowerCase()}`} aria-pressed={i === 0}
              className={cn("flex w-full flex-col overflow-hidden border text-left", i === 0 ? "border-2 border-(--ink)" : "border-(--rule-2) hover:border-(--ink)")}>
              <span className={cn(s.mm, "block aspect-square overflow-hidden bg-(--paper) [--plate:#f3f3ef]")}>{t.node}</span>
              <span className={cn(s.tag, "border-t border-(--rule) bg-(--card) px-1.5 py-1 text-[10px]")}>{t.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <figure className={cn(s.crop, "relative min-w-0 flex-1 border border-(--ink) bg-(--card) [--plate:#fcfcfa]")}>
        <div aria-hidden="true" className={cn(s.mm, "absolute inset-0")} />
        <LabPack art={p.art} pack={p.pack} tint={variant.colorHex} label={p.name} dims={p.dims} className="relative block h-auto w-full" />
        <figcaption className={cn(s.tag, "absolute inset-x-0 top-0 flex justify-between gap-3 px-3 py-2.5 text-(--ink-2)")}>
          <span>Vista 01 / 04 · frente</span><span>Imagen ilustrativa</span>
        </figcaption>
      </figure>
    </div>
  );
}
