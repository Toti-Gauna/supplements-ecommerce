"use client";
import { inTicket, type CounterLine, type CounterPot } from "@/demo/engine/counter";
import { cn } from "@/lib/cn";
import { plural } from "@/lib/plural";
import { PotCard } from "./PotCard";
import { SearchField } from "./SearchField";

interface PotSearchProps {
  id: string;
  label: string;
  query: string;
  onQuery: (query: string) => void;
  pots: CounterPot[];
  /** Líneas ya cargadas: cada tarjeta muestra cuántas lleva. */
  lines: readonly CounterLine[];
  onAdd: (pot: CounterPot) => void;
  /** Encabezado de la lista sin texto ("Lo que más sale"). */
  idleTitle?: string;
  className?: string;
  classNames?: { grid?: string };
}

/**
 * Buscador grande del mostrador con las tarjetas de potes. Usa el buscador de la tienda (sinónimos, sabores y errores
 * leves): "whey choco" deja los potes de chocolate. Sin texto muestra lo que más sale.
 */
export function PotSearch({ id, label, query, onQuery, pots, lines, onAdd, idleTitle = "Lo que más sale", className, classNames }: PotSearchProps) {
  const searching = query.trim().length > 0;
  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <SearchField id={id} label={label} value={query} onChange={onQuery} placeholder="Producto, marca o sabor: whey chocolate, creatina…" />
      <p aria-live="polite" className="font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted">
        {searching ? `${plural(pots.length, "pote", "potes")} para “${query.trim()}”` : idleTitle}
      </p>
      {pots.length === 0 ? (
        <p className="plate rounded-sm border border-dashed border-line p-5 text-sm text-muted">
          No encontramos “{query.trim()}”. Probá con la marca, el sabor o el tipo de producto (proteína, creatina, pre-entreno…).
        </p>
      ) : (
        <ul className={cn("grid grid-cols-[minmax(0,1fr)] gap-3 min-[560px]:grid-cols-2 xl:grid-cols-3", classNames?.grid)}>
          {pots.map((pot) => (
            <li key={pot.key} className="flex min-w-0">
              <PotCard pot={pot} inTicket={inTicket(lines, pot.productSlug, pot.variantId)} onAdd={onAdd} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
