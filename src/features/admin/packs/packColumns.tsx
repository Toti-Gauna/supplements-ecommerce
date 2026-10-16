import Link from "next/link";
import { ChevronRight, Copy, Pencil } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { discountLabel, type PackRow } from "@/demo/admin/pack-rows";
import { formatARS } from "@/lib/money";

export const NEW_PACK = "/admin-demo/packs/editar/?nuevo=1";
export const editHref = (id: string) => `/admin-demo/packs/editar/?id=${id}`;
export const subsHref = (id: string) => `/admin-demo/packs/?ver=suscripciones&pack=${id}`;

export interface PackHandlers {
  onVisible: (row: PackRow, visible: boolean) => void;
  onDuplicate: (row: PackRow) => void;
  onRemove: (row: PackRow) => void;
}

const subsText = (n: number) => (n === 1 ? "1 activa" : `${n} activas`);

function Name({ row }: { row: PackRow }) {
  const { pack, quote } = row;
  return (
    <span className="flex flex-col">
      <span>{pack.name}</span>
      <span className="text-xs font-normal text-muted">{pack.focus} · {pack.items.length} productos{pack.featured ? " · Destacado" : ""}</span>
      {!quote.available && <span className="text-xs font-bold text-warning">No se puede comprar: {quote.missing.length ? `sin stock o pausado (${quote.missing.join(", ")})` : "sin productos"}</span>}
    </span>
  );
}

function Discount({ pack }: { pack: PackRow["pack"] }) {
  return pack.monthlyPct > 0
    ? <span className="flex flex-col whitespace-nowrap"><span>{pack.discountPct} %</span>{" "}<span className="text-xs text-muted">+ {pack.monthlyPct} % por mes</span></span>
    : <span>{pack.discountPct} %</span>;
}

function Subs({ row }: { row: PackRow }) {
  return row.activeSubs > 0
    ? <Link href={subsHref(row.pack.id)} className="font-bold text-primary underline">{subsText(row.activeSubs)}</Link>
    : <span className="text-muted">Ninguna</span>;
}

function VisibleSwitch({ row, onVisible }: { row: PackRow; onVisible: PackHandlers["onVisible"] }) {
  return <Switch checked={row.visible} onChange={(v) => onVisible(row, v)} label={row.visible ? "Visible" : "Oculto"} ariaLabel={`Visible en la tienda: ${row.pack.name}`} />;
}

/** Editar, duplicar y quitar. Dentro de la fila: ninguno abre el editor al tocarlo. */
function Actions({ row, h }: { row: PackRow; h: PackHandlers }) {
  const { pack } = row;
  const warn = row.activeSubs > 0 ? ` Tiene ${subsText(row.activeSubs)}: quedan sin pack.` : "";
  return (
    <span data-row-ignore className="flex flex-wrap items-center gap-1 xl:flex-nowrap">
      <ButtonLink href={editHref(pack.id)} variant="ghost" size="sm" className="px-2 tracking-[0.03em]" aria-label={`Editar ${pack.name}`}><Pencil size={15} aria-hidden="true" /> Editar</ButtonLink>
      <Button variant="ghost" size="sm" className="px-2 tracking-[0.03em]" title="Duplicar" onClick={() => h.onDuplicate(row)} aria-label={`Duplicar ${pack.name}`}><Copy size={15} aria-hidden="true" /><span className="md:sr-only">Duplicar</span></Button>
      <ConfirmButton variant="danger" size="sm" className="px-2 tracking-[0.03em]" title={`¿Quitar ${pack.name}?`} confirmLabel="Quitar pack" onConfirm={() => h.onRemove(row)}
        description={`Deja de verse en la tienda y se borra del panel.${warn} Solo en esta demo; “Reiniciar demo” lo recupera.`}>Quitar</ConfirmButton>
    </span>
  );
}

export function packColumns(h: PackHandlers): Column<PackRow>[] {
  return [
    { id: "name", header: "Pack", pinned: true, primary: true, cell: (r) => <Name row={r} />, sortValue: (r) => r.pack.name, exportValue: (r) => r.pack.name, className: "min-w-44" },
    { id: "price", header: "Primera entrega", align: "right", cell: (r) => formatARS(r.quote.price), sortValue: (r) => r.quote.price, exportValue: (r) => r.quote.price },
    { id: "monthly", header: "Por mes", align: "right", cell: (r) => formatARS(r.quote.monthlyPrice), sortValue: (r) => r.quote.monthlyPrice, exportValue: (r) => r.quote.monthlyPrice },
    { id: "discount", header: "Descuento", cell: (r) => <Discount pack={r.pack} />, sortValue: (r) => r.pack.discountPct + r.pack.monthlyPct, exportValue: (r) => discountLabel(r.pack) },
    { id: "subs", header: "Suscripciones", cell: (r) => <Subs row={r} />, sortValue: (r) => r.activeSubs, exportValue: (r) => r.activeSubs },
    { id: "visible", header: "En la tienda", cell: (r) => <VisibleSwitch row={r} onVisible={h.onVisible} />, sortValue: (r) => r.visible, exportValue: (r) => (r.visible ? "sí" : "no") },
    { id: "actions", header: "Acciones", pinned: true, stickyEnd: true, className: "whitespace-nowrap", cell: (r) => <Actions row={r} h={h} /> },
  ];
}

export function PackCard({ row, selected, onToggle, onOpen, h }: RowCardProps<PackRow> & { h: PackHandlers }) {
  const { pack, quote } = row;
  return (
    <div className={`flex flex-col gap-3 rounded-sm bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${pack.name}`} className="mt-1 h-5 w-5 accent-primary" />
        <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-start gap-2 text-left">
          <span className="min-w-0 flex-1 font-bold"><Name row={row} /></span>
          <ChevronRight size={18} aria-hidden="true" className="mt-1 shrink-0 text-muted" />
        </button>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div><dt className="text-xs text-muted">Primera entrega</dt><dd className="font-extrabold tabular-nums">{formatARS(quote.price)}</dd></div>
        <div><dt className="text-xs text-muted">Por mes</dt><dd className="font-extrabold tabular-nums">{formatARS(quote.monthlyPrice)}</dd></div>
        <div><dt className="text-xs text-muted">Descuento</dt><dd className="font-bold">{discountLabel(pack)}</dd></div>
        <div><dt className="text-xs text-muted">Suscripciones</dt><dd className="font-bold"><Subs row={row} /></dd></div>
      </dl>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-2"><VisibleSwitch row={row} onVisible={h.onVisible} /><Actions row={row} h={h} /></div>
    </div>
  );
}
