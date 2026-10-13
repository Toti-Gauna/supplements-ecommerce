import { cn } from "@/lib/cn";
import { productView } from "./data";
import { InView } from "./InView";
import { RackCard } from "./RackCard";
import s from "./lab.module.css";

const RACK = ["isolate-zero", "overvolt-pre", "proteina-vegana", "creatina-gomitas"];

/** Bloque 2: una fila del rack, ordenada por precio por servicio (el dato que se compara entre suplementos). */
export function CardsBlock() {
  const views = RACK.map(productView).sort((a, b) => (a.pps ?? Infinity) - (b.pps ?? Infinity));
  return (
    <section aria-labelledby="b-rack" className="border-y border-(--ink) bg-(--paper)">
      <div className="mx-auto max-w-[1360px] px-4 py-10 sm:px-8 lg:py-14">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-(--ink) pb-4">
          <div>
            <p className={cn(s.tag, "text-(--ink-2)")}>Rack A · más elegidos</p>
            <h2 id="b-rack" className="mt-2 text-[34px] font-semibold leading-none tracking-[-0.04em] sm:text-[48px]">Compará por servicio</h2>
          </div>
          <p className={cn(s.mono, "max-w-[46ch] text-[12.5px] leading-relaxed text-(--ink-2)")}>
            Orden: $ / servicio, de menor a mayor. Precios y stock de muestra. Envases: imagen ilustrativa.
          </p>
        </header>
        <InView className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {views.map((v, i) => <RackCard key={v.product.slug} view={v} slot={`A-0${i + 1}`} />)}
        </InView>
      </div>
    </section>
  );
}
