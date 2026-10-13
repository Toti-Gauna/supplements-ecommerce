import Link from "next/link";
import type { ReactNode } from "react";
import { RackShot } from "@/components/illustrations/RackShot";
import type { LedMotion } from "@/components/atoms/Led";
import { Scoreboard, type ScoreCell } from "@/components/molecules/Scoreboard";
import { StockLights } from "@/components/molecules/StockLights";
import type { HeroPick } from "@/demo/engine/home";
import { stockLine, type RackFacts } from "@/demo/engine/rack";
import { productHref } from "@/demo/engine/catalog";

export interface HeroCampaign {
  name: string;
  /** "20% OFF" o "$5.000 OFF", y su condición si pide un mínimo. */
  offer?: { label: string; code: string; condition: string | null };
}

interface HeroStageProps {
  pick: HeroPick;
  facts: RackFacts;
  /** "mañana" y "mar 6 oct" (calendario y cupo del cadete). */
  cadete: { when: string; date: string };
  campaign?: HeroCampaign;
  actions?: ReactNode;
  markers?: ReactNode;
  motion?: LedMotion;
  /** Reserva las mismas medidas sin construir el arte fuera de pantalla antes de la primera interacción. */
  deferred?: boolean;
  /** En la vista previa del panel el titular no es el h1 de la página. */
  headingLevel?: "h1" | "h2" | "p";
}

/** Tira de datos del producto en el marcador: precio por servicio, servicios, stock por variante y el cadete. */
function cells(facts: RackFacts, cadete: HeroStageProps["cadete"]): ScoreCell[] {
  const v = facts.lead;
  return [
    facts.perServing
      ? { key: "pps", label: `Precio por servicio${facts.from ? " · desde" : ""}`, value: facts.perServing, money: true, wide: true, hint: v.size }
      : { key: "price", label: "Precio", value: facts.price, money: true, wide: true, hint: v.size },
    { key: "serv", label: "Servicios", value: v.servings ?? 1, reading: `${v.servings ?? 1} servicios`, tone: "chalk", hint: v.servings && v.servings > 1 ? "por envase" : "unidad" },
    { key: "stock", label: "Stock por variante", value: facts.units, display: <StockLights items={facts.lights} className="min-h-9 sm:min-h-10" />, hint: stockLine(facts) },
    { key: "cadete", label: "Cadete en Mar del Plata", value: 0, wide: true, display: <span className="font-display block text-[2rem] leading-none sm:text-[2.4rem]">Llega {cadete.when}</span>, hint: `${cadete.date} · pedido de hoy` },
  ];
}

/**
 * Primer pantallazo del inicio: el producto en el rack bajo el reflector, el titular como póster de competencia y, abajo,
 * el marcador con lo que vende. Lo usan el inicio y la vista previa del panel (Contenido → Hero), así se ven igual.
 */
export function HeroStage({ pick, facts, cadete, campaign, actions, markers, motion = "power", headingLevel = "h1", deferred = false }: HeroStageProps) {
  const p = pick.product;
  const words = pick.headline.trim().split(/\s+/);
  const Heading = headingLevel;
  const readings = cells(facts, cadete).map((cell) => deferred && (cell.money || cell.key === "serv")
    ? { ...cell, display: <span aria-hidden="true" className="block h-9 sm:h-10" /> } : cell);
  // Celular: titular, rack y marcador en el primer pantallazo; después el texto, los botones y los destacados.
  // Escritorio: titular y texto a la izquierda del rack; abajo, los destacados y el marcador a todo el ancho.
  return (
    <div className={`stage relative h-full overflow-hidden${deferred ? " invisible" : ""}`}>
      <div className="relative mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-y-3 px-4 pb-4 pt-6 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-x-10 lg:gap-y-2 lg:pt-12">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <p className="eyebrow flex items-center gap-2 text-muted">
            <span aria-hidden="true" className="size-2 bg-(--season-accent) shadow-[0_0_10px_var(--season-glow)]" />
            {campaign ? `Campaña · ${campaign.name}` : pick.key === "best" ? "El más elegido" : "Estrella del rack"} · {p.brand}
          </p>
          <Heading key={pick.key} className="font-display mt-3 text-[clamp(2.9rem,8.5vw,7.5rem)] font-black leading-[0.86] [overflow-wrap:anywhere]">
            <span className="rk-slam block">{words.slice(0, -1).join(" ")}</span>{" "}
            <span className="rk-slam-2 block text-volt-ink">{words.at(-1)}</span>
          </Heading>
        </div>
        <div className="relative -mx-4 h-52 sm:mx-0 sm:h-[24rem] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-[31rem]">
          {deferred ? <span aria-hidden="true" className="block h-full" /> : pick.image
            // eslint-disable-next-line @next/next/no-img-element -- imagen propia local del carrusel, sin red
            ? <div className="rack-bay h-full overflow-hidden border-y border-line sm:rounded-sm sm:border"><img src={pick.image.src} alt={pick.image.alt} width={900} height={900} className="h-full w-full object-cover" style={{ objectPosition: `${pick.image.frame.x}% ${pick.image.frame.y}%`, transform: `scale(${pick.image.frame.zoom})`, transformOrigin: `${pick.image.frame.x}% ${pick.image.frame.y}%` }} /></div>
            : p.photoDataUrl
            // eslint-disable-next-line @next/next/no-img-element -- foto cargada en el panel demo (data URL local)
            ? <img src={p.photoDataUrl} alt={p.imageAlt || p.name} className="h-full w-full object-contain" />
            : <RackShot items={[{ art: p.art, pack: p.pack, tint: facts.lead.colorHex }]} label={p.imageAlt || p.name} uprights lightUp fit />}
          <span className="absolute bottom-1 right-4 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Imagen ilustrativa</span>
        </div>
        <Scoreboard key={pick.key} cells={readings} label={`Datos de ${p.name}`} motion={motion} className="lg:col-span-2 lg:row-start-4 lg:grid-cols-[1.4fr_1fr_1.3fr]" />
        <div className="pb-2 pt-2 lg:col-start-1 lg:row-start-2 lg:pb-8">
          <p className="max-w-[40ch] text-base sm:text-lg">
            <Link href={productHref(p.slug)} className="font-bold underline decoration-line underline-offset-4 hover:decoration-current">{p.name}</Link>
            <span className="text-muted">{pick.pitch ? ` · ${pick.pitch}` : ""}</span>
          </p>
          {campaign?.offer && (
            <p className="mt-3 inline-flex flex-wrap items-baseline gap-x-2 border border-line px-3 py-2 text-sm">
              <strong className="font-display text-xl">{campaign.offer.label}</strong>
              <span>con <span className="font-mono font-bold tracking-wider">{campaign.offer.code}</span></span>
              {campaign.offer.condition && <span className="w-full text-xs text-muted">{campaign.offer.condition}</span>}
            </p>
          )}
          {actions && <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-2 sm:flex sm:flex-wrap">{actions}</div>}
        </div>
        {markers && <div className="lg:col-span-2 lg:row-start-3">{markers}</div>}
      </div>
    </div>
  );
}
