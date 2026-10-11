"use client";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { HelpButton, HelpPanel } from "@/components/molecules/Help";
import { PRODUCTION_HELP } from "@/demo/admin/help";
import { useEffect, useRef, useState, type DragEvent } from "react";
import type { AdminOrder } from "@/demo/admin/types";
import { materialRows } from "@/demo/admin/workshop/materials";
import { columnOf, PRODUCTION_COLUMNS, productionMove, type ProductionColumn } from "@/demo/admin/workshop/production";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { TabFilter } from "../table/TabFilter";
import { columnLabel, ProductionCard } from "./ProductionCard";

/**
 * Cola de producción (pedido de Ignacio, fuera de la especificación): tablero por etapa con la vista previa aprobada.
 * Cada etapa tiene un ancho mínimo legible y el tablero se desliza de costado dentro de su caja (8.3.16): la página no
 * se corre y las tarjetas nunca se angostan. En tablet y celular, carriles táctiles con atajos por etapa.
 */
export function ProductionBoard() {
  const orders = useAdmin((s) => s.orders);
  const workshop = useAdmin((s) => s.workshop);
  const moveProduction = useAdmin((s) => s.moveProduction);
  const push = useToasts((s) => s.push);
  const today = DEMO_TODAY;
  const [tab, setTab] = useState<ProductionColumn>("queue");
  const [dragging, setDragging] = useState<AdminOrder | null>(null);
  const [over, setOver] = useState<ProductionColumn | null>(null);
  const [help, setHelp] = useState(false);
  const rejected = useRef<string | null>(null);
  const dropped = useRef(false);
  const scroller = useRef<HTMLDivElement>(null);
  const board = PRODUCTION_COLUMNS.map((c) => ({
    ...c,
    orders: orders.filter((o) => columnOf(o) === c.id).sort((a, b) => (a.promisedDate ?? "9999").localeCompare(b.promisedDate ?? "9999")),
  }));
  const short = materialRows(workshop.materials, orders, workshop.recipes).filter((m) => m.state === "short");

  const move = (code: string, to: ProductionColumn) => {
    const from = orders.find((o) => o.code === code);
    const error = moveProduction(code, to);
    if (error) push({ tone: "error", title: "No se puede mover", description: error });
    else push({ tone: "success", title: `${code} pasó a “${columnLabel(to)}”`, description: from?.status === "PAID" ? "Se descontaron sus insumos del stock. Cambio guardado solo en esta demo." : "Cambio guardado solo en esta demo (este navegador)." });
  };
  const reasonFor = (col: ProductionColumn) => {
    if (!dragging || columnOf(dragging) === col) return null;
    const m = productionMove(dragging, col);
    return m.ok ? null : m.error;
  };
  const zone = (col: ProductionColumn) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragging || columnOf(dragging) === col) return;
      const reason = reasonFor(col);
      if (reason) { e.dataTransfer.dropEffect = "none"; rejected.current = reason; return; }
      e.preventDefault();
      rejected.current = null;
      if (over !== col) setOver(col);
    },
    onDragLeave: (e: DragEvent) => { if (over === col && !e.currentTarget.contains(e.relatedTarget as Node | null)) setOver(null); },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      dropped.current = true;
      const code = e.dataTransfer.getData("text/plain") || dragging?.code;
      setDragging(null); setOver(null);
      if (code) move(code, col);
    },
  });
  const startDrag = (code: string) => { dropped.current = false; rejected.current = null; setDragging(orders.find((o) => o.code === code) ?? null); };
  const endDrag = () => {
    if (!dropped.current && rejected.current) push({ tone: "error", title: "No se puede soltar ahí", description: rejected.current });
    rejected.current = null; setDragging(null); setOver(null);
  };

  // Atajos por etapa: llevan el carril a la vista dentro del tablero y se marcan solos al deslizar.
  const goTo = (col: ProductionColumn) => {
    setTab(col);
    const el = scroller.current, lane = el?.querySelector<HTMLElement>(`[data-column="${col}"]`);
    if (el && lane) el.scrollTo({ left: lane.offsetLeft - parseFloat(getComputedStyle(el).paddingLeft), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const lanes = [...el.querySelectorAll<HTMLElement>("[data-column]")];
        const nearest = lanes.reduce((a, b) => (Math.abs(b.offsetLeft - el.scrollLeft) < Math.abs(a.offsetLeft - el.scrollLeft) ? b : a));
        setTab(nearest.dataset.column as ProductionColumn);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); el.removeEventListener("scroll", onScroll); };
  }, []);

  return (
    <>
      <AdminPageHeader title="Cola de producción">Los pedidos pagados en orden de entrega, con la vista previa que aprobó el cliente. Arrastrá la tarjeta, usá el botón de la etapa siguiente o “Mover etapa”: al entrar a producción se descuentan los insumos (una sola vez).</AdminPageHeader>
      {short.length > 0 && (
        <p role="status" className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-danger-soft p-3 text-sm font-bold text-danger">
          <TriangleAlert size={17} aria-hidden="true" /> No alcanzan {short.map((m) => m.name.toLowerCase()).join(", ")} para los pedidos en cola.
          <Link href="/admin-demo/insumos/" className="underline">Ver insumos</Link>
        </p>
      )}
      <div className="mb-3 flex items-center gap-2">
        <div className="min-w-0 flex-1 lg:hidden"><TabFilter label="Etapa" value={tab} onChange={goTo} tabs={board.map((c) => ({ id: c.id, label: c.label, count: c.orders.length }))} /></div>
        <HelpButton label="etapas de producción" open={help} controls="prod-help" onToggle={() => setHelp(!help)} className="ml-auto" />
      </div>
      {help && <HelpPanel id="prod-help" help={PRODUCTION_HELP} onClose={() => setHelp(false)} className="mb-4" />}
      <div ref={scroller} role="region" aria-label="Tablero de producción" tabIndex={0}
        className="relative -mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto px-4 pb-3 focus-visible:outline-2 focus-visible:outline-primary sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:snap-none lg:px-0">
        <div className="grid auto-cols-[min(86vw,21rem)] grid-flow-col gap-3 sm:auto-cols-[minmax(17rem,1fr)] lg:auto-cols-[minmax(16rem,1fr)]">
          {board.map((c) => {
            const reason = reasonFor(c.id);
            return (
              <section key={c.id} aria-labelledby={`col-${c.id}`} {...zone(c.id)} data-column={c.id}
                className={cn("flex min-h-[28rem] snap-start flex-col gap-3 rounded-[1.75rem] p-3 transition-colors", over === c.id ? "bg-accent ring-2 ring-primary" : "bg-bg ring-1 ring-ink/[0.06]", reason && "opacity-60")}>
                <header className="px-1">
                  <span className="flex items-center gap-2">
                    <h2 id={`col-${c.id}`} className="whitespace-nowrap font-extrabold">{c.label}</h2>
                    <span className="grid h-6 min-w-6 place-items-center rounded-full bg-surface px-1.5 text-xs font-extrabold tabular-nums">{c.orders.length}</span>
                  </span>
                  <span className="block truncate text-xs text-muted">{reason ? `No se puede: ${reason}` : c.hint}</span>
                </header>
                {c.orders.length ? c.orders.map((o) => <ProductionCard key={o.code} order={o} column={c.id} today={today} onMove={move} onDragStart={startDrag} onDragEnd={endDrag} />)
                  : <p className="rounded-2xl border border-dashed border-ink/15 p-4 text-center text-sm text-muted">Sin pedidos en esta etapa</p>}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
