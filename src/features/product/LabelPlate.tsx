import type { Nutrition } from "@/demo/types";
import { cn } from "@/lib/cn";

/**
 * El rótulo como vista de la galería: la etiqueta impresa del envase (papel tiza y tinta, en los dos modos), con los
 * renglones por porción y el %VD. El rótulo completo, con 100 g e ingredientes, está más abajo en la ficha.
 */
export function LabelPlate({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="h-full overflow-y-auto bg-on-night p-4 text-night sm:p-6">
      <p className="font-display text-3xl leading-none sm:text-4xl">Información nutricional</p>
      <p className="mt-1 border-b-4 border-night pb-2 font-lab text-xs">Porción: {nutrition.serving} · valores de muestra</p>
      <table className="mt-1 w-full font-lab text-[11.5px] sm:text-xs">
        <caption className="sr-only">Rótulo por porción</caption>
        <thead>
          <tr className="border-b-2 border-night text-[10px] uppercase tracking-wider">
            <th scope="col" className="py-1 text-left font-bold">Por porción</th>
            <th scope="col" className="py-1 text-right font-bold">Cantidad</th>
            <th scope="col" className="w-12 py-1 text-right font-bold">%VD</th>
          </tr>
        </thead>
        <tbody>
          {nutrition.rows.map((r) => (
            <tr key={r.label} className="border-b border-night/25">
              <th scope="row" className={cn("py-1 text-left", r.sub ? "pl-3 font-normal" : "font-bold")}>{r.label}</th>
              <td className="py-1 text-right tabular-nums">{r.serving}</td>
              <td className="py-1 text-right font-bold tabular-nums">{r.dv ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="#rotulo" className="mt-3 inline-block font-lab text-xs font-bold underline underline-offset-2">Ver el rótulo completo e ingredientes</a>
    </div>
  );
}
