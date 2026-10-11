"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { formatDateTime } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { profileHref } from "../customers/Reminders";
import { DetailHeader, TrackChip } from "../detail/DetailHeader";
import { Facts, Panel } from "../detail/Panel";
import { useDemoSave } from "../useDemoSave";
import { CLAIM_STATUS, CLAIM_TYPE, isOpenClaim } from "./claimLabels";

/** Ficha completa de un reclamo (8.3.5): mensaje, comprador, pedido y las acciones permitidas con confirmación. */
export function ClaimDetail() {
  const id = useSearchParams().get("id") ?? "";
  const claim = useAdmin((s) => s.claims.find((c) => c.id === id));
  const order = useAdmin((s) => s.orders.find((o) => o.code === claim?.orderCode));
  const resolveClaim = useAdmin((s) => s.resolveClaim);
  const known = useAdmin((s) => !!claim && (s.users.some((u) => u.email === claim.email) || s.orders.some((o) => o.customer.email === claim.email)));
  const save = useDemoSave();
  if (!claim) return <EmptyState title="No encontramos ese reclamo" action={<ButtonLink href="/admin-demo/reclamos/">Ver reclamos</ButtonLink>}>Revisá el enlace o reiniciá la demo.</EmptyState>;
  const status = CLAIM_STATUS[claim.status];
  return (
    <div className="@container flex flex-col gap-6">
      <DetailHeader list={{ href: "/admin-demo/reclamos/", label: "Reclamos" }} title={claim.code} eyebrow={`${CLAIM_TYPE[claim.type]} · ${formatDateTime(claim.createdAt)}`}
        status={<><TrackChip label="Estado" value={status.label} tone={status.tone} /><TrackChip label="Tipo" value={CLAIM_TYPE[claim.type]} tone="neutral" />{claim.fromShop && <TrackChip label="Origen" value="tienda demo" tone="warning" />}</>} />
      <div className="grid gap-6 @min-[56rem]:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Mensaje del comprador"><p className="whitespace-pre-line rounded-2xl bg-bg p-4 text-sm leading-relaxed">{claim.message}</p></Panel>
          {claim.resolution && <Panel title={claim.status === "REJECTED" ? "Motivo del rechazo" : "Resolución"}><p className="text-sm">{claim.resolution}</p></Panel>}
          <Panel title="Acciones">
            {isOpenClaim(claim.status) ? (
              <div className="flex flex-wrap gap-2">
                {claim.status === "OPEN" && <ConfirmButton size="sm" variant="secondary" title={`Tomar ${claim.code}`} confirmLabel="Marcar en curso" description="El comprador vería que su reclamo está en curso." onConfirm={() => save("Reclamo en curso", () => resolveClaim(claim.id, "IN_PROGRESS", ""))}>Marcar en curso</ConfirmButton>}
                <ConfirmButton size="sm" title={`Resolver ${claim.code}`} confirmLabel="Resolver" reasonLabel="Resolución para el comprador" description="Se cierra con estado Resuelto y la respuesta queda registrada." onConfirm={(r) => save("Reclamo resuelto", () => resolveClaim(claim.id, "RESOLVED", r))}>Resolver</ConfirmButton>
                <ConfirmButton size="sm" variant="danger" title={`Rechazar ${claim.code}`} confirmLabel="Rechazar" reasonLabel="Motivo (por ejemplo, producto personalizado, art. 1116)" description="Se cierra con estado Rechazado y el motivo queda registrado." onConfirm={(r) => save("Reclamo rechazado", () => resolveClaim(claim.id, "REJECTED", r))}>Rechazar</ConfirmButton>
              </div>
            ) : <p className="text-sm text-muted">Reclamo cerrado. No hay acciones pendientes.</p>}
          </Panel>
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <Panel title="Comprador">
            <Facts items={[["Nombre", claim.name], ["Email", known ? <Link key="e" href={profileHref(claim.email)} className="text-primary underline">{claim.email}</Link> : claim.email]]} />
          </Panel>
          <Panel title="Pedido">
            {claim.orderCode ? (
              <Facts items={[["Código", order ? <Link key="o" href={`/admin-demo/pedidos/detalle/?codigo=${order.code}`} className="text-primary underline">{order.code}</Link> : claim.orderCode], ...(order ? [["Estado", STATUS_LABEL[order.status]] as [string, string]] : [])]} />
            ) : <p className="text-sm text-muted">El comprador no indicó un pedido.</p>}
          </Panel>
        </div>
      </div>
    </div>
  );
}
