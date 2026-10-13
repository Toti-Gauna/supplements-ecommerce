"use client";
import { useState } from "react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import type { PackStyle } from "@/components/illustrations/supplements";
import type { ArtKey, Nutrition } from "@/demo/types";
import { cn } from "@/lib/cn";
import { RackShot } from "./RackShot";
import s from "./box.module.css";

type View = "rack" | "detail" | "context" | "label";
const VIEWS: { id: View; name: string }[] = [
  { id: "rack", name: "Frente" }, { id: "detail", name: "Scoop" }, { id: "context", name: "Box" }, { id: "label", name: "Rótulo" },
];

interface Props { name: string; art: ArtKey; pack: PackStyle; tint?: string; nutrition?: Nutrition }

/** El rótulo es una vista más de la galería (el comprador lo busca antes de comprar). */
function LabelView({ nutrition }: { nutrition: Nutrition }) {
  return (
    <div className="h-full overflow-hidden bg-(--bx-chalk) p-4 text-(--bx-carbon) sm:p-6">
      <p className={cn(s.display, "text-3xl sm:text-4xl")}>Información nutricional</p>
      <p className="mt-1 border-b-4 border-(--bx-carbon) pb-2 font-mono text-xs">Porción: {nutrition.serving} · valores de muestra</p>
      <table className="mt-2 w-full font-mono text-[11px] sm:text-xs">
        <tbody>
          {nutrition.rows.slice(0, 8).map((r) => (
            <tr key={r.label} className="border-b border-(--bx-carbon)/25">
              <th scope="row" className={cn("py-1 text-left font-normal", r.sub ? "pl-3" : "font-bold")}>{r.label}</th>
              <td className="py-1 text-right">{r.serving}</td>
              <td className="w-12 py-1 text-right">{r.dv ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Galería: escenario grande y 4 placas numeradas debajo (frente en el rack, scoop, en el box y rótulo). */
export function FichaGallery({ name, art, pack, tint, nutrition }: Props) {
  const [view, setView] = useState<View>("rack");
  const views = nutrition ? VIEWS : VIEWS.slice(0, 3);
  return (
    <div className="flex flex-col gap-px bg-(--bx-steel)">
      <div className="relative aspect-[4/3] bg-(--bx-carbon) lg:aspect-[5/4]">
        {view === "rack" && <RackShot art={art} pack={pack} tint={tint} label={name} />}
        {(view === "detail" || view === "context") && <ProductArt art={art} pack={pack} tint={tint} view={view} label={name} showBadge={false} className="h-full w-full" />}
        {view === "label" && nutrition && <LabelView nutrition={nutrition} />}
        {view !== "label" && <span className="absolute bottom-3 left-3 bg-(--bx-carbon)/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-(--bx-dim)">Imagen ilustrativa</span>}
      </div>
      <div role="group" aria-label="Vistas del producto" className="grid grid-cols-4 gap-px">
        {views.map((v, i) => (
          <button
            key={v.id}
            type="button"
            aria-pressed={view === v.id}
            onClick={() => setView(v.id)}
            className={cn(s.plate, "flex h-14 flex-col items-start justify-center gap-0.5 px-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-(--bx-volt) sm:h-16", view === v.id && "shadow-[inset_0_-3px_0_#c8ff2e]")}
          >
            <span className={cn("font-mono text-[10px] font-bold", view === v.id ? "text-(--bx-volt)" : "text-(--bx-dim)")}>{String(i + 1).padStart(2, "0")}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-(--bx-chalk)">{v.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
