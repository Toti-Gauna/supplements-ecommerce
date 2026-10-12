"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Copy } from "lucide-react";
import { useEffect } from "react";
import { Badge } from "@/components/atoms/Badge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { DataTable, toSheet } from "@/components/organisms/data-table/DataTable";
import type { Column, RowCardProps } from "@/components/organisms/data-table/types";
import type { CustomerView } from "@/demo/admin/customers";
import { runOutText } from "@/demo/admin/repurchase-text";
import { GOAL_OPTIONS, goalName, inSegment, SEGMENT_HELP, SEGMENTS } from "@/demo/admin/segments";
import type { FilterSpec, FilterValues } from "@/demo/admin/table";
import { cn } from "@/lib/cn";
import { formatDate, formatDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useToasts } from "@/stores/toast";
import { AdminPageHeader } from "../AdminPageHeader";
import { BulkButton } from "../table/TabFilter";
import { specFromColumns, TableExcel } from "../table/TableExcel";
import { useExport } from "../table/useExport";
import { useTableState } from "../table/useTableState";
import { profileHref } from "./Reminders";
import { useCustomerViews } from "./useCustomerViews";

const FILTERS: FilterSpec<CustomerView>[] = [
  { id: "segmento", label: "Segmento", options: SEGMENTS.map((s) => ({ value: s.id, label: s.label })), help: SEGMENT_HELP, test: inSegment },
  { id: "objetivo", label: "Objetivo", options: GOAL_OPTIONS, help: SEGMENT_HELP, test: (c, v) => c.goal === v },
  { id: "tipo", label: "Tipo", options: [{ value: "cuenta", label: "Con cuenta" }, { value: "invitado", label: "Invitados" }], help: SEGMENT_HELP, test: (c, v) => (v === "invitado" ? !c.registered : c.registered) },
];
const FILTER_IDS = FILTERS.map((f) => f.id);
// El inicio enlazaba a "Para escribir" (`?escribir=7`): ahora es el segmento "Se le termina esta semana".
const LEGACY = { params: ["escribir"], read: (p: URLSearchParams): FilterValues => (p.get("escribir") ? { segmento: "semana" } : {}) };
const search = (c: CustomerView) => `${c.name} ${c.email} ${c.phone ?? ""}`;

/** Lo que conviene mirar: lo que se le termina esta semana o ya se le terminó; si no hay nada de eso, lo próximo. */
const urgent = (c: CustomerView) => { const list = c.repurchases.filter((i) => i.state !== "later"); return list.length ? list : c.repurchases.slice(0, 1); };
const RUN_TONE = { overdue: "text-danger", week: "", later: "text-muted" } as const;

function RunOutCell({ c }: { c: CustomerView }) {
  const list = urgent(c).slice(0, 2);
  if (!list.length) return "—";
  return (
    <ul className="flex flex-col gap-1">
      {list.map((i) => <li key={i.key} className={cn("flex flex-col", RUN_TONE[i.state])}><span>{formatDay(i.runsOutOn)}</span><span className="text-xs font-normal text-muted">{i.product}</span></li>)}
    </ul>
  );
}

const columns: Column<CustomerView>[] = [
  { id: "name", header: "Cliente", pinned: true, primary: true, cell: (c) => <span className="flex flex-col"><span>{c.name}</span><span className="text-xs font-normal text-muted">{c.email}</span></span>, sortValue: (c) => c.name, exportValue: (c) => c.name },
  { id: "email", header: "Email", defaultHidden: true, cell: (c) => c.email, exportValue: (c) => c.email },
  { id: "phone", header: "Teléfono", defaultHidden: true, cell: (c) => c.phone ?? "—", exportValue: (c) => c.phone ?? "" },
  { id: "type", header: "Tipo", cell: (c) => (c.registered ? "Cuenta" : "Invitado"), sortValue: (c) => c.registered, exportValue: (c) => (c.registered ? "Cuenta" : "Invitado") },
  { id: "segment", header: "Segmento", cell: (c) => <span className="flex gap-1"><Badge tone={c.segment === "VIP" ? "brand" : "neutral"}>{c.segment}</Badge>{c.blocked && <Badge tone="danger">Bloqueado</Badge>}</span>, sortValue: (c) => c.segment, exportValue: (c) => c.segment },
  { id: "goal", header: "Objetivo", cell: (c) => goalName(c.goal), sortValue: (c) => (c.goal ? goalName(c.goal) : ""), exportValue: (c) => (c.goal ? goalName(c.goal) : "") },
  { id: "runout", header: "Se le termina", cell: (c) => <RunOutCell c={c} />, sortValue: (c) => urgent(c)[0]?.runsOutOn, exportValue: (c) => urgent(c).map((i) => `${runOutText(i)}: ${i.product}`).join(" · ") },
  { id: "orders", header: "Pedidos", align: "right", cell: (c) => c.orders.length, sortValue: (c) => c.orders.length, exportValue: (c) => c.orders.length },
  { id: "spent", header: "Total pagado", align: "right", money: true, cell: (c) => <strong>{formatARS(c.totalSpent)}</strong>, sortValue: (c) => c.totalSpent, exportValue: (c) => c.totalSpent },
  { id: "avg", header: "Ticket promedio", align: "right", money: true, defaultHidden: true, cell: (c) => (c.avgTicket ? formatARS(c.avgTicket) : "—"), sortValue: (c) => c.avgTicket, exportValue: (c) => c.avgTicket },
  { id: "last", header: "Última compra", cell: (c) => (c.lastOrderAt ? formatDate(c.lastOrderAt) : "—"), sortValue: (c) => c.lastOrderAt, exportValue: (c) => (c.lastOrderAt ? formatDate(c.lastOrderAt) : "") },
];

function Card({ row: c, selected, onToggle, onOpen }: RowCardProps<CustomerView>) {
  // En el celular entra una línea: primero lo de esta semana, después lo atrasado.
  const soon = c.repurchases.find((i) => i.state === "week") ?? c.repurchases.find((i) => i.state === "overdue");
  return (
    <div className={`flex items-center gap-3 rounded-3xl bg-bg p-3 ring-1 ${selected ? "ring-primary" : "ring-ink/[0.06]"}`}>
      <input type="checkbox" checked={selected} onChange={onToggle} aria-label={`Seleccionar ${c.name}`} className="h-5 w-5 accent-primary" />
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 font-bold">{c.name}<Badge tone={c.segment === "VIP" ? "brand" : "neutral"}>{c.segment}</Badge></span>
          <span className="block truncate text-sm text-muted">{goalName(c.goal)} · {c.orders.length} {c.orders.length === 1 ? "pedido" : "pedidos"}</span>
          {soon && <span className={cn("mt-0.5 block text-sm font-semibold", RUN_TONE[soon.state])}>{runOutText(soon)}: {soon.product}</span>}
        </span>
        <span className="font-extrabold tabular-nums">{formatARS(c.totalSpent)}</span><ChevronRight size={18} aria-hidden="true" className="text-muted" />
      </button>
    </div>
  );
}

/** Clientes del CRM: cuentas e invitados unidos por email, con segmentos de recompra, objetivo, totales y ficha. */
export function CustomersTable() {
  const push = useToasts((s) => s.push);
  const router = useRouter();
  const onExport = useExport("clientes");
  // Enlaces anteriores con ?cliente=: llevan a la ficha completa (ya no hay panel lateral).
  const param = useSearchParams().get("cliente");
  useEffect(() => { if (param) router.replace(profileHref(param)); }, [param, router]);
  const state = useTableState("customers", { sort: { id: "spent", dir: "desc" }, hidden: ["email", "phone", "avg"], filterIds: FILTER_IDS, legacy: LEGACY });
  const all = useCustomerViews();
  const copy = async (list: CustomerView[]) => {
    try { await navigator.clipboard.writeText(list.map((c) => c.email).join(", ")); push({ tone: "success", title: `${list.length} emails copiados`, description: "Listos para pegar en tu correo o en una campaña." }); }
    catch { push({ tone: "error", title: "No se pudo copiar", description: "Tu navegador no dejó usar el portapapeles." }); }
  };
  const table = { searchLabel: "Buscar por nombre o email", searchText: search, filters: FILTERS };
  if (state.view === "excel") {
    return <TableExcel id="customers" title="Clientes" noun="clientes" state={state} rows={all} {...table} spec={specFromColumns(columns, (c) => c.key)} onExport={(rows) => onExport(toSheet(columns, rows), "filtered")} />;
  }
  return (
    <>
      <AdminPageHeader title="Clientes">Cuentas registradas y compradores invitados, unidos por email. Con el segmento “Se le termina esta semana” ves a quién avisarle. Perfiles ficticios: el panel nunca muestra contraseñas ni datos de pago.</AdminPageHeader>
      <DataTable caption="Clientes" noun="clientes" rows={all} columns={columns} state={state} {...table}
        rowKey={(c) => c.key} rowLabel={(c) => `Seleccionar ${c.name}`} rowHref={(c) => profileHref(c.email)} onExport={onExport} onExcel={() => state.setView("excel")} renderCard={(p) => <Card {...p} />}
        bulkActions={(list) => <BulkButton onClick={() => copy(list)}><Copy size={14} aria-hidden="true" /> Copiar emails</BulkButton>}
        empty={<EmptyState title="Ningún cliente coincide">Probá con otro nombre, segmento u objetivo, o tocá “Reiniciar”.</EmptyState>} />
    </>
  );
}
