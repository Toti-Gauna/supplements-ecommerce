"use client";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { HelpButton, HelpPanel } from "@/components/molecules/Help";
import { PREPARATION_HELP } from "@/demo/admin/help";
import { materialRows } from "@/demo/admin/workshop/materials";
import { columnOf, PREP_COLUMNS, prepLabel, prepMove, type PrepColumn } from "@/demo/admin/workshop/preparation";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { LotCheckSheet } from "./LotCheckSheet";
import { PreparationCard } from "./PreparationCard";
import { useLaneScroll } from "./useLaneScroll";
import { usePrepDnd } from "./usePrepDnd";

/**
 * Preparación de pedidos (Fase 7): tablero Por preparar → Armando → Control de lote → Listo para despachar. Cada etapa
 * tiene un ancho legible y el tablero se desliza de costado dentro de su caja (8.3.16); en tablet y celular, carriles
 * táctiles con atajos. Nada pasa a Listo sin confirmar el lote de cada producto.
 */
export function PreparationBoard() {
  const orders = useAdmin((s) => s.orders);
  const workshop = useAdmin((s) => s.workshop);
  const movePreparation = useAdmin((s) => s.movePreparation);
  const push = useToasts((s) => s.push);
  const today = DEMO_TODAY;
  const [checking, setChecking] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const { tab, goTo, scroller } = useLaneScroll<PrepColumn>("queue");
  const board = PREP_COLUMNS.map((c) => ({
    ...c,
    orders: orders.filter((o) => columnOf(o) === c.id).sort((a, b) => (a.promisedDate ?? "9999").localeCompare(b.promisedDate ?? "9999")),
  }));
  const short = materialRows(workshop.materials, orders, workshop.recipes).filter((m) => m.state === "short");

  const move = (code: string, to: PrepColumn) => {
    const order = orders.find((o) => o.code === code);
    if (!order) return;
    const check = prepMove(order, to);
    if (!check.ok && check.lots) { setChecking(code); return; }
    const error = movePreparation(code, to);
    if (error) push({ tone: "error", title: "No se puede mover", description: error });
    else push({ tone: "success", title: `${code} pasó a “${prepLabel(to)}”`, description: order.status === "PAID" ? "Se descontó su embalaje del stock. Cambio guardado solo en esta demo." : "Cambio guardado solo en esta demo (este navegador)." });
  };
  const dnd = usePrepDnd(orders, move, (reason) => push({ tone: "error", title: "No se puede soltar ahí", description: reason }));

  return (
    <>
      <AdminPageHeader title="Preparación de pedidos">Los pedidos pagados en orden de despacho, con lo que lleva cada uno. Arrastrá la tarjeta, usá el botón de la etapa siguiente o “Mover etapa”: al empezar a armarlo se descuenta el embalaje (una sola vez) y en Control de lote confirmás el lote que sale de cada producto.</AdminPageHeader>
      {short.length > 0 && (
        <p role="status" className="mb-4 flex flex-wrap items-center gap-2 rounded-sm bg-danger-soft p-3 text-sm font-bold text-danger">
          <TriangleAlert size={17} aria-hidden="true" /> No alcanzan {short.map((m) => m.name.toLowerCase()).join(", ")} para los pedidos por preparar.
          <Link href="/admin-demo/insumos/" className="underline">Ver insumos</Link>
        </p>
      )}
      <div className="mb-3 flex items-center gap-2">
        <div className="min-w-0 flex-1 lg:hidden"><TabFilter label="Etapa" value={tab} onChange={goTo} tabs={board.map((c) => ({ id: c.id, label: c.label, count: c.orders.length }))} /></div>
        <HelpButton label="etapas de preparación" open={help} controls="prep-help" onToggle={() => setHelp(!help)} className="ml-auto" />
      </div>
      {help && <HelpPanel id="prep-help" help={PREPARATION_HELP} onClose={() => setHelp(false)} className="mb-4" />}
      <div ref={scroller} role="region" aria-label="Tablero de preparación" tabIndex={0}
        className="relative -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-3 focus-visible:outline-2 focus-visible:outline-primary sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:snap-none lg:px-0">
        <div className="grid auto-cols-[min(86vw,21rem)] grid-flow-col gap-3 sm:auto-cols-[minmax(17rem,1fr)] lg:auto-cols-[minmax(16rem,1fr)]">
          {board.map((c) => {
            const reason = dnd.reasonFor(c.id);
            return (
              <section key={c.id} aria-labelledby={`col-${c.id}`} {...dnd.zone(c.id)} data-column={c.id}
                className={cn("flex min-h-[28rem] snap-start flex-col gap-3 rounded-sm p-3 transition-colors", dnd.over === c.id ? "bg-accent ring-2 ring-primary" : "bg-bg ring-1 ring-ink/[0.06]", reason && "opacity-60")}>
                <header className="px-1">
                  <span className="flex items-center gap-2">
                    <h2 id={`col-${c.id}`} className="whitespace-nowrap font-extrabold">{c.label}</h2>
                    <span className="grid h-6 min-w-6 place-items-center rounded-sm bg-surface px-1.5 text-xs font-extrabold tabular-nums">{c.orders.length}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">{reason ? `No se puede: ${reason}` : c.hint}</span>
                </header>
                {c.orders.length ? c.orders.map((o) => <PreparationCard key={o.code} order={o} column={c.id} today={today} onMove={move} onCheckLots={setChecking} onDragStart={dnd.start} onDragEnd={dnd.end} />)
                  : <p className="rounded-sm border border-dashed border-ink/15 p-4 text-center text-sm text-muted">Sin pedidos en esta etapa</p>}
              </section>
            );
          })}
        </div>
      </div>
      <LotCheckSheet order={orders.find((o) => o.code === checking) ?? null} onClose={() => setChecking(null)} />
    </>
  );
}
