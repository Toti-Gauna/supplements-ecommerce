"use client";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/atoms/Badge";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Pagination } from "@/components/molecules/Pagination";
import { paginate } from "@/demo/admin/table";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "./AdminPageHeader";
import { CLAIM_STATUS, CLAIM_TYPE, claimHref, isOpenClaim } from "./claims/claimLabels";
import { TabFilter } from "./table/TabFilter";
import { useTableState } from "./table/useTableState";

/** Reclamos (8.3.5): lista por estado (en la URL), diez por página; cada uno abre su ficha completa con las acciones. */
export function ClaimsAdmin() {
  const claims = useAdmin((s) => s.claims);
  const state = useTableState("claims", { filterIds: ["estado"] });
  const closed = state.filters.estado === "cerrados";
  const counts = { open: claims.filter((c) => isOpenClaim(c.status)).length, closed: claims.filter((c) => !isOpenClaim(c.status)).length };
  const page = paginate(claims.filter((c) => isOpenClaim(c.status) !== closed), state.page, 10);
  return (
    <>
      <AdminPageHeader title="Reclamos">Arrepentimientos, devoluciones y reclamos de ejemplo. Los enviados desde el botón de arrepentimiento de la tienda demo aparecen acá.</AdminPageHeader>
      <div className="mb-4">
        <TabFilter label="Filtrar reclamos" value={closed ? "cerrados" : "pendientes"} onChange={(v) => state.setFilter("estado", v === "cerrados" ? v : "")}
          tabs={[{ id: "pendientes", label: "Pendientes", count: counts.open }, { id: "cerrados", label: "Cerrados", count: counts.closed }]} />
      </div>
      {page.items.length === 0 && <EmptyState title={closed ? "Todavía no hay reclamos cerrados" : "No hay reclamos pendientes"} />}
      <ul className="flex flex-col gap-3">
        {page.items.map((c) => (
          <li key={c.id}>
            <Link href={claimHref(c.id)} className="animate-fade-up flex items-center gap-3 rounded-3xl bg-surface p-4 text-sm shadow-[var(--shadow-card)] transition-shadow hover:ring-1 hover:ring-primary">
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold">{c.code}</span><Badge>{CLAIM_TYPE[c.type]}</Badge><Badge tone={CLAIM_STATUS[c.status].tone}>{CLAIM_STATUS[c.status].label}</Badge>
                  {c.fromShop && <span className="text-xs font-bold text-warning">desde la tienda demo</span>}
                </span>
                <span>{c.name}{c.orderCode ? ` · pedido ${c.orderCode}` : ""} · <span className="text-muted">{formatDateTime(c.createdAt)}</span></span>
                <span className="line-clamp-2 text-muted">{c.message}</span>
              </span>
              <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination {...page} noun="reclamos" onPage={state.setPage} />
    </>
  );
}
