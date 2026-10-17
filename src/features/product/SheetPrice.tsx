import { LedPrice } from "@/components/atoms/Led";
import type { Clearance } from "@/demo/engine/lots";
import type { Readout } from "@/demo/engine/sheet-readouts";
import type { PriceOptions } from "@/demo/engine/sheet";
import { formatARS, withoutNationalTaxes } from "@/lib/money";
import { SheetScore } from "./SheetScore";
import { ClearanceTag } from "./SupplementFacts";
import { TwoPrices } from "./TwoPrices";

interface Props {
  price: number;
  /** Presentación elegida ("Chocolate · 2 lb (907 g)"), para saber de qué es el total. */
  presentation: string;
  readouts: Readout[];
  options: PriceOptions;
  clearance: Clearance | null;
  taxRate: number;
  /** Cambia con la presentación: el marcador hace el flip. */
  flipKey: string;
}

/**
 * Placa del precio de la hoja técnica. Pedido de Ignacio (L1, punto 6): primero el precio total de la presentación
 * elegida en el marcador LED grande y abajo, en chico, cuánto rinde (precio y activo por servicio, servicios, días).
 * Después, los dos precios explicados y el precio sin impuestos nacionales.
 */
export function SheetPrice({ price, presentation, readouts, options, clearance, taxRate, flipKey }: Props) {
  return (
    <section aria-label="Precio" className="plate relative overflow-hidden rounded-sm border border-line">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-volt" />
      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {clearance && <ClearanceTag clearance={clearance} />}
        <div className="min-w-0">
          <p className="truncate font-lab text-[10.5px] font-bold uppercase tracking-[0.12em] text-muted">
            Precio total<span className="normal-case tracking-normal"> · {presentation}</span>
          </p>
          <div data-sheet-total className="mt-2">
            <LedPrice key={flipKey} amount={price} motion="flip" className="h-11 max-w-full sm:h-14" signClassName="text-3xl sm:text-4xl" />
          </div>
        </div>
        <SheetScore readouts={readouts} flipKey={flipKey} />
      </div>
      <TwoPrices options={options} />
      <p className="border-t border-line px-4 py-2 text-[11.5px] text-muted sm:px-5">
        Precio sin impuestos nacionales: {formatARS(withoutNationalTaxes(price, taxRate))} · precios de muestra
      </p>
    </section>
  );
}
