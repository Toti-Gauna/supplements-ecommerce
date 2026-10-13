import type { Product } from "@/demo/types";
import { cn } from "@/lib/cn";
import { formatARS } from "@/lib/money";
import { AddButton } from "./AddButton";
import { ArenaPack } from "./ArenaPack";
import { Bib } from "./Bib";
import { Scoreboard } from "./Scoreboard";
import s from "./arena.module.css";
import type { variantFacts } from "./data";

interface ArenaHeroProps {
  product: Product;
  facts: ReturnType<typeof variantFacts>;
  /** Puesto en ventas del producto (dorsal). */
  rank: number;
  tint?: string;
  /** Gramos de proteína por servicio, del rótulo ("24 g"). */
  protein?: string;
}

/**
 * Hero de campaña: el producto parado bajo tres reflectores, el titular gigante que se comprime al entrar y la tira de
 * datos (precio por servicio, servicios, stock y cadete) con la compra al final.
 */
export function ArenaHero({ product, facts, rank, tint, protein }: ArenaHeroProps) {
  const proteinNumber = protein?.replace(/\s*g$/, "");
  return (
    <section id="arena-hero" aria-labelledby="arena-h1" className={cn(s.stageCut, "relative isolate overflow-hidden bg-[var(--a-bg)] pb-[6vw]")}>
      <div aria-hidden="true" className={s.lightsOn}>
        <div className={s.haze} />
        <div className={cn(s.beam, "left-[42%] h-[115%] w-[46%] sm:left-[48%]")} />
        <div className={cn(s.beam, "left-[20%] h-[100%] w-[30%] -rotate-[24deg] opacity-60 [background:linear-gradient(to_bottom,rgb(139_114_255/0.5),transparent_80%)]")} />
        <div className={cn(s.beam, "right-[-6%] h-[100%] w-[30%] rotate-[26deg] opacity-50 [background:linear-gradient(to_bottom,rgb(200_255_46/0.28),transparent_75%)]")} />
        <div className={s.floor} />
      </div>
      {proteinNumber && (
        <span aria-hidden="true" className={cn(s.display, s.outline, "pointer-events-none absolute -right-[2vw] top-[4%] text-[34vw] leading-none text-white/[0.09] sm:top-[-2%] sm:text-[30vw]")}>
          {proteinNumber}G
        </span>
      )}
      <div className="relative mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)] items-end gap-6 px-4 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:pt-14">
        <div className="relative z-10 lg:pb-16">
          <p className={cn(s.mono, "mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--a-muted)]")}>
            <span className="bg-[var(--a-volt)] px-1.5 py-0.5 text-black">{product.brand}</span>
            <span>{product.name}</span>
          </p>
          <h1 id="arena-h1" className={cn(s.display, s.squeeze, "text-[clamp(4rem,14vw,12.5rem)]")}>
            Cada<br />scoop<br /><span className="text-[var(--a-volt)] [text-shadow:0_0_40px_rgb(200_255_46/0.35)]">cuenta.</span>
          </h1>
          <p className={cn(s.rise, "mt-5 max-w-md text-base sm:text-lg font-medium text-[var(--a-ink)]/85")}>{product.short}.</p>
        </div>
        <div className="relative mx-auto mt-2 w-full max-w-[min(74%,640px)] lg:mt-0 lg:max-w-[min(100%,640px)]">
          <Bib number={rank} caption="Puesto en ventas" className="absolute -left-[8%] top-[2%] z-10 -rotate-6 scale-90 sm:left-[4%] sm:top-[10%] sm:scale-100" />
          <ArenaPack product={product} tint={tint} className="aspect-square w-full" />
          <p className={cn(s.mono, "absolute bottom-1 right-0 text-[10px] uppercase tracking-[0.18em] text-[var(--a-muted)]")}>Imagen ilustrativa</p>
        </div>
      </div>
      <div className={cn(s.rise, "relative mx-auto mt-4 grid max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-px px-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_19rem]")}>
        <Scoreboard
          size="xl"
          className="grid-cols-2 md:grid-cols-4"
          cells={[
            { label: "Por servicio", value: facts.perServing !== null ? formatARS(facts.perServing) : "—", tone: "volt" },
            { label: "Servicios", value: facts.servings ?? "—", unit: "por pote" },
            { label: "En stock", value: facts.stock, unit: "u.", note: <span className="inline-flex items-center gap-2"><span aria-hidden="true" className={cn(s.ledDot, "text-[var(--a-volt)]")} />En el local, MdP</span> },
            { label: "Cadete MdP", value: facts.cadete.when, note: facts.cadete.date, tone: "plasma" },
          ]}
        />
        <AddButton productName={product.name} detail={formatARS(facts.price)} className="h-auto min-h-20 px-8" classNames={{ label: "text-3xl", detail: "text-2xl" }} />
      </div>
    </section>
  );
}
