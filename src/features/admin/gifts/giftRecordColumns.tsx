import { Badge } from "@/components/atoms/Badge";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import type { GiftRecordRow } from "@/demo/admin/gift-views";
import type { GiftKind } from "@/demo/engine/gifts";
import type { GiftStatus } from "@/demo/engine/gift-status";
import { formatDate } from "@/lib/date";

export const KIND_LABEL: Record<GiftKind, string> = { producto: "Producto", stack: "Stack", "gift-card": "Gift card" };
const TONE: Record<GiftStatus, "neutral" | "warning" | "brand" | "success"> = { enviado: "neutral", abierto: "warning", elegido: "brand", canjeado: "success" };

export function RecordStatus({ row }: { row: GiftRecordRow }) {
  return <Badge tone={TONE[row.record.status]}>{row.statusLabel}</Badge>;
}

/** Lo que eligió quien recibió: en negrita si ya eligió, apagado si falta o no tenía nada abierto. */
function Choice({ row }: { row: GiftRecordRow }) {
  return row.record.chosenLabel ? <strong>{row.choice}</strong> : <span className="text-muted">{row.choice}</span>;
}

const what = (r: GiftRecordRow) => `${r.record.itemName} · ${KIND_LABEL[r.record.kind]}`;

export function giftRecordColumns(): Column<GiftRecordRow>[] {
  return [
    { id: "code", header: "Regalo", pinned: true, cell: (r) => <span className="font-mono text-[13px] font-bold">{r.record.code}</span>, sortValue: (r) => r.record.code, exportValue: (r) => r.record.code },
    { id: "who", header: "De → Para", cell: (r) => <span>{r.record.from} → <strong>{r.record.to}</strong></span>, sortValue: (r) => r.record.to, exportValue: (r) => `${r.record.from} → ${r.record.to}` },
    { id: "what", header: "Qué", cell: (r) => <span className="flex flex-col"><span className="font-bold">{r.record.itemName}</span><span className="text-xs text-muted">{KIND_LABEL[r.record.kind]}</span></span>, sortValue: what, exportValue: what },
    { id: "status", header: "Estado", cell: (r) => <RecordStatus row={r} />, sortValue: (r) => r.step, exportValue: (r) => r.statusLabel },
    { id: "choice", header: "Sabor o tamaño elegido", cell: (r) => <Choice row={r} />, sortValue: (r) => r.choice, exportValue: (r) => r.choice },
    { id: "date", header: "Enviado", cell: (r) => formatDate(r.record.createdAt), sortValue: (r) => r.record.createdAt, exportValue: (r) => r.record.createdAt },
  ];
}

export function GiftRecordCard({ row }: RowCardProps<GiftRecordRow>) {
  return (
    <div className="flex flex-col gap-2 rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-mono text-[13px] font-bold">{row.record.code}</p><p className="text-sm">{row.record.from} → <strong>{row.record.to}</strong></p></div>
        <RecordStatus row={row} />
      </div>
      <p className="text-sm">{what(row)}</p>
      <p className="text-sm"><span className="text-xs text-muted">Elegido: </span><Choice row={row} /></p>
    </div>
  );
}
