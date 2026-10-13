import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import type { FlavorPlate, SizePlate } from "./sheet-data";
import s from "./lab.module.css";

const plate = (selected: boolean, disabled = false) => cn(
  "relative flex min-w-0 flex-col items-start gap-1 border p-2.5 text-left",
  selected ? "border-2 border-(--ink) bg-(--card)" : "border-(--rule-2) bg-(--paper) hover:border-(--ink)",
  disabled && "text-(--ink-2) [&_.swatch]:opacity-40",
);

/** Esquina en voltio de la placa elegida: la luz de señal, no un relleno. */
const Notch = () => <span aria-hidden="true" className="absolute right-0 top-0 h-0 w-0 border-l-[14px] border-t-[14px] border-l-transparent border-t-(--volt)" />;

/** Sabores como placas: muestra de color, nombre y unidades del tamaño elegido (tachado si no hay). */
export function FlavorPlates({ flavors, label = "Sabor" }: { flavors: FlavorPlate[]; label?: string }) {
  const current = flavors.find((f) => f.selected);
  return (
    <fieldset>
      <legend className={cn(s.tag, "mb-2 flex w-full justify-between text-(--ink-2)")}><span>{label}</span><span className="text-(--ink)">{current?.name}</span></legend>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {flavors.map((f) => (
          <button key={f.name} type="button" aria-pressed={f.selected} aria-disabled={f.stock === 0 || undefined} className={plate(f.selected, f.stock === 0)}>
            {f.selected && <Notch />}
            <span className="swatch h-3 w-full" style={{ background: f.hex }} aria-hidden="true" />
            <span className="text-[13.5px] font-semibold leading-tight">{f.name}</span>
            <span className={cn(s.mono, "text-[11px]", f.stock === 0 ? "line-through" : "text-(--ink-2)")}>{f.stock === 0 ? "sin stock" : `${f.stock} u.`}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** Tamaños como placas con su precio por servicio; la presentación que más rinde lleva el sello. */
export function SizePlates({ sizes, savingsPct, label = "Tamaño" }: { sizes: SizePlate[]; savingsPct: number | null; label?: string }) {
  return (
    <fieldset>
      <legend className={cn(s.tag, "mb-2 text-(--ink-2)")}>{label}</legend>
      <div className="grid grid-cols-2 gap-1.5">
        {sizes.map((z) => (
          <button key={z.size} type="button" aria-pressed={z.selected} className={plate(z.selected)}>
            {z.selected && <Notch />}
            <span className="text-[14px] font-semibold leading-tight">{z.size}</span>
            <span className={cn(s.mono, "text-[11.5px] text-(--ink-2)")}>{z.servings ?? "—"} serv. · {formatARS(z.price)}</span>
            <span className={cn(s.mono, "text-[17px] font-semibold tracking-[-0.03em]")}>{z.pps === null ? "—" : formatARS(z.pps)}<span className="text-[11px] font-medium text-(--ink-2)"> /serv.</span></span>
            {z.best && savingsPct ? <span className={cn(s.tag, "mt-0.5 bg-(--ink) px-1.5 py-0.5 text-[9px] text-(--volt)")}>Rinde más · −{savingsPct} %</span> : null}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
