"use client";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { LoadBar } from "@/components/molecules/LoadBar";
import { LevelGlyph } from "@/components/illustrations/LevelGlyph";
import { levelProgress } from "@/demo/engine/club-levels";
import { potsInUse } from "@/demo/engine/repurchase";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { PotBattery } from "./PotBattery";
import { RepurchaseSection } from "./RepurchaseSection";
import { useAccountOrders } from "./useAccountOrders";
import { useRepeatOrder } from "./useRepeatOrder";
import { brand } from "@/config/brand";

/** Nivel del club con su barra: cuánto falta para el siguiente (gasto de muestra de la cuenta demo, el mismo del Club). */
export function LevelCard() {
  const p = levelProgress(demoAccountProgress["m-gasto"] ?? 0);
  return (
    <section aria-label={`Nivel ${p.level.name}`} className="floor flex flex-col gap-3 rounded-sm p-4 text-on-night sm:p-5">
      <div className="flex items-center gap-3">
        <LevelGlyph level={p.level.id} className="h-10 w-10 text-volt" />
        <div className="min-w-0">
          <p className="eyebrow text-night-muted">{brand.club}</p>
          <p className="font-display text-3xl leading-none">Nivel {p.level.name}</p>
        </div>
      </div>
      <LoadBar pct={p.pct} label={p.next ? `Carga hacia el nivel ${p.next.name}` : "Nivel máximo"}>{p.pct} %</LoadBar>
      <p className="text-sm text-night-muted">
        {p.next ? <>Te faltan <strong className="text-on-night">{formatARS(p.missing)}</strong> en compras pagadas para <strong className="text-on-night">{p.next.name}</strong>.</> : "Llegaste al nivel máximo."}{" "}
        <Link href="/club/" className="font-bold text-volt underline underline-offset-4">Ver niveles</Link>
      </p>
    </section>
  );
}

/**
 * "Mi box" (R2): los potes en uso como baterías que se calculan solas a partir de los pedidos pagados (la misma cuenta
 * que hace el panel), "Recomprar" por pote, "Repetir mi último pedido", el nivel con su barra y los avisos pedidos.
 */
export function MyBoxSection() {
  const orders = useAccountOrders();
  const products = useDemoData((d) => d.products);
  const repeat = useRepeatOrder();
  const pots = potsInUse(orders, products, DEMO_TODAY);
  const lastPaid = orders.find((o) => o.status !== "CANCELLED");
  return (
    <div className="flex flex-col gap-6">
      <LevelCard />
      <section aria-labelledby="potes" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="potes" className="font-display text-2xl leading-tight">Potes en uso</h3>
            <p className="text-sm text-muted">Calculados con tus pedidos pagados, desde el día que los recibiste.</p>
          </div>
          {lastPaid && (
            <Button variant="secondary" size="sm" onClick={() => repeat(lastPaid.lines)}><RotateCcw size={16} aria-hidden="true" />Repetir mi último pedido</Button>
          )}
        </div>
        {pots.length === 0
          ? <p className="rounded-sm border border-dashed border-line p-4 text-sm text-muted">Cuando un pedido tuyo quede pagado, acá ves cuánto te queda de cada pote.</p>
          : <ul className="flex flex-col gap-3" aria-label="Potes en uso">{pots.map((p) => <PotBattery key={p.slug} pot={p} onRebuy={() => p.variantId && repeat([{ productSlug: p.slug, variantId: p.variantId, quantity: 1 }])} />)}</ul>}
      </section>
      <section aria-labelledby="avisos" className="flex flex-col gap-3">
        <h3 id="avisos" className="font-display text-2xl leading-tight">Tus avisos de recompra</h3>
        <RepurchaseSection />
      </section>
    </div>
  );
}
