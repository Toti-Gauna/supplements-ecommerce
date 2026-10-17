import { Badge } from "@/components/atoms/Badge";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import { EXPIRING_DAYS, type GiftCardRow } from "@/demo/admin/gift-views";
import { GIFT_CARD_STATUS_LABEL, type GiftCardStatus } from "@/demo/engine/gift-cards";
import { formatDate } from "@/lib/date";
import { formatARS } from "@/lib/money";

const TONE: Record<GiftCardStatus, "success" | "warning" | "neutral" | "danger"> = { activa: "success", "en-uso": "warning", agotada: "neutral", vencida: "danger" };

export function CardStatus({ row }: { row: GiftCardRow }) {
  return <Badge tone={TONE[row.status]}>{GIFT_CARD_STATUS_LABEL[row.status]}</Badge>;
}

/** Saldo con una barra de lo que queda (lectura en texto; la barra es decorativa). */
function Balance({ row }: { row: GiftCardRow }) {
  const pct = Math.round((row.card.balance / row.card.amount) * 100);
  return (
    <span className="flex min-w-28 flex-col items-end gap-1">
      <span className="font-mono font-extrabold tabular-nums">{formatARS(row.card.balance)}</span>
      <span aria-hidden="true" className="h-1.5 w-full rounded-xs bg-ink/10"><span className="block h-full rounded-xs bg-volt-ink" style={{ width: `${pct}%` }} /></span>
    </span>
  );
}

function Expiry({ row }: { row: GiftCardRow }) {
  const live = row.status === "activa" || row.status === "en-uso";
  const note = row.daysLeft < 0 ? `venció hace ${-row.daysLeft} días` : live && row.daysLeft <= EXPIRING_DAYS ? `vence en ${row.daysLeft} días` : null;
  return (
    <span className="flex flex-col">
      <span>{formatDate(row.card.expires)}</span>
      {note && <span className={row.daysLeft < 0 ? "text-xs text-danger" : "text-xs font-bold text-warning"}>{note}</span>}
    </span>
  );
}

const usesText = (row: GiftCardRow) => (row.card.redemptions.length ? row.card.redemptions.map((r) => `${r.orderCode} (${formatARS(r.amount)})`).join(", ") : "Sin usar");

export function giftCardColumns(): Column<GiftCardRow>[] {
  return [
    { id: "code", header: "Gift card", pinned: true, primary: false, cell: (r) => <span className="font-mono text-[13px] font-bold">{r.card.code}</span>, sortValue: (r) => r.card.code, exportValue: (r) => r.card.code },
    { id: "to", header: "Para", cell: (r) => <span className="flex flex-col"><span className="font-bold">{r.card.to}</span><span className="text-xs text-muted">de {r.card.from}</span></span>, sortValue: (r) => r.card.to, exportValue: (r) => `${r.card.to} (de ${r.card.from})` },
    { id: "amount", header: "Monto", align: "right", money: true, cell: (r) => <span className="font-mono tabular-nums">{formatARS(r.card.amount)}</span>, sortValue: (r) => r.card.amount, exportValue: (r) => r.card.amount },
    { id: "balance", header: "Saldo", align: "right", money: true, cell: (r) => <Balance row={r} />, sortValue: (r) => r.card.balance, exportValue: (r) => r.card.balance },
    { id: "status", header: "Estado", cell: (r) => <CardStatus row={r} />, sortValue: (r) => GIFT_CARD_STATUS_LABEL[r.status], exportValue: (r) => GIFT_CARD_STATUS_LABEL[r.status] },
    { id: "issued", header: "Emitida", cell: (r) => formatDate(r.card.issuedAt), sortValue: (r) => r.card.issuedAt, exportValue: (r) => r.card.issuedAt },
    { id: "expires", header: "Vence", cell: (r) => <Expiry row={r} />, sortValue: (r) => r.card.expires, exportValue: (r) => r.card.expires },
    { id: "uses", header: "Canjes", cell: (r) => <span className="text-sm">{usesText(r)}</span>, sortValue: (r) => r.used, exportValue: usesText },
  ];
}

export function GiftCardCard({ row }: RowCardProps<GiftCardRow>) {
  return (
    <div className="flex flex-col gap-3 rounded-sm bg-bg p-3 ring-1 ring-ink/[0.06]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-mono text-[13px] font-bold">{row.card.code}</p><p className="text-sm">Para <strong>{row.card.to}</strong> · de {row.card.from}</p></div>
        <CardStatus row={row} />
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div><dt className="text-xs text-muted">Monto</dt><dd className="font-mono tabular-nums">{formatARS(row.card.amount)}</dd></div>
        <div><dt className="text-xs text-muted">Saldo</dt><dd><Balance row={row} /></dd></div>
        <div><dt className="text-xs text-muted">Vence</dt><dd><Expiry row={row} /></dd></div>
        <div><dt className="text-xs text-muted">Canjes</dt><dd>{usesText(row)}</dd></div>
      </dl>
    </div>
  );
}
