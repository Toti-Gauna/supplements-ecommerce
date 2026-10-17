"use client";
import type { CSSProperties, ReactNode } from "react";
import { LedPrice } from "@/components/atoms/Led";
import { Stamps } from "@/components/molecules/Stamps";
import type { CompareCell, CompareRow, CompareTable } from "@/demo/engine/compare";
import { EXPIRY_WINDOW_DAYS } from "@/demo/engine/lots";
import { cn } from "@/lib/cn";
import { CompareAdd, CompareHead, CompareSlot } from "./CompareHead";

/**
 * Tabla del comparador (roles de tabla sobre una grilla): en el escritorio, el rótulo a la izquierda y una columna por
 * producto; en el celular, el rótulo arriba de cada renglón y las 2 o 3 columnas debajo, así no hay scroll de costado
 * a 375 px. El mejor valor de cada renglón se marca con el filo voltio y "Mejor".
 */
const ROW = "grid grid-cols-[repeat(var(--n),minmax(0,1fr))] gap-x-2 border-b border-line sm:gap-x-3 lg:grid-cols-[200px_repeat(var(--n),minmax(0,1fr))]";
const LABEL = "col-span-full pb-1 pt-3 font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-muted lg:col-span-1 lg:self-center lg:py-4";

function Value({ row, cell }: { row: CompareRow; cell: CompareCell }) {
  if (row.key === "price") return <LedPrice amount={cell.value!} tone={cell.best ? "volt" : "chalk"} motion="none" className="h-[1.05rem] max-w-full sm:h-7" signClassName="text-base sm:text-xl" />;
  if (row.key === "badges") return cell.badges?.length ? <Stamps badges={cell.badges} max={6} /> : <span className="text-muted">Sin sellos</span>;
  const soon = row.key === "expiry" && cell.value !== null && cell.value < EXPIRY_WINDOW_DAYS;
  const big = row.key === "perServing" || row.key === "protein";
  return (
    <span className={cn("font-mono tabular-nums", big ? "text-[15px] font-bold sm:text-lg" : "text-[13px] sm:text-sm", cell.value === null ? "text-muted" : "text-ink", soon && "text-warning")}>
      {cell.text}{soon && <span className="block text-[10px] uppercase tracking-[0.08em]">Vence pronto</span>}
    </span>
  );
}

function Cell({ row, cell }: { row: CompareRow; cell: CompareCell }) {
  return (
    <div role="cell" data-best={cell.best || undefined}
      className={cn("relative flex min-w-0 flex-col justify-center gap-1 py-2.5 pl-2.5 pr-1 lg:py-4", cell.best ? "bg-volt/10 shadow-[inset_3px_0_0_var(--color-volt-ink)]" : "shadow-[inset_1px_0_0_var(--color-line)]")}>
      <Value row={row} cell={cell} />
      {cell.best && <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-volt-ink">Mejor<span className="sr-only"> en {row.label.toLowerCase()}</span></span>}
    </div>
  );
}

function Row({ label, children, className, hideLabel }: { label: ReactNode; children: ReactNode; className?: string; hideLabel?: boolean }) {
  return (
    <div role="row" className={cn(ROW, className)}>
      {/* Rótulo solo para lectores de pantalla: igual ocupa la primera columna en el escritorio (si no, las celdas se corren). */}
      <div role="rowheader" className={hideLabel ? "col-span-full h-0 overflow-hidden lg:col-span-1 lg:h-auto" : LABEL}>{hideLabel ? <span className="sr-only">{label}</span> : label}</div>
      {children}
    </div>
  );
}

export function CompareGrid({ table, slots, onChange, onRemove, onAdd }: {
  table: CompareTable; slots: number; onChange: (index: number) => void; onRemove: (index: number) => void; onAdd: () => void;
}) {
  const empty = Array.from({ length: slots }, (_, i) => <div key={`e${i}`} role="cell" className="shadow-[inset_1px_0_0_var(--color-line)]" />);
  return (
    <div role="table" aria-label="Comparación de productos" style={{ "--n": table.columns.length + slots } as CSSProperties} className="border-t-2 border-ink/80">
      <div role="row" className={cn(ROW, "border-b-2 border-ink/80")}>
        <div role="columnheader" className="hidden lg:flex lg:items-end lg:pb-4"><span className="eyebrow text-volt-ink">Lado a lado</span></div>
        {table.columns.map((c, i) => <CompareHead key={c.product.slug} column={c} onChange={() => onChange(i)} onRemove={() => onRemove(i)} />)}
        {Array.from({ length: slots }, (_, i) => <CompareSlot key={`s${i}`} onAdd={onAdd} />)}
      </div>
      {table.rows.map((row) => (
        <Row key={row.key} label={row.label}>
          {row.cells.map((cell, i) => <Cell key={table.columns[i]!.product.slug} row={row} cell={cell} />)}
          {empty}
        </Row>
      ))}
      <Row label="Agregar al carrito" hideLabel className="border-b-0">
        {table.columns.map((c) => <div role="cell" key={c.product.slug} className="py-3 pl-1"><CompareAdd product={c.product} /></div>)}
        {empty}
      </Row>
    </div>
  );
}
