"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft, MousePointerClick } from "lucide-react";
import { Switch } from "@/components/atoms/Switch";
import { applyOwnerParam, ownerParam, spotsForPath, toggleOwner } from "@/demo/admin/owner-mode";
import { useOwnerMode } from "@/stores/ownerMode";

/**
 * Franja del modo dueño (R4c), debajo del header. Solo aparece si se llegó desde el panel o con `?dueno=1` (lo recuerda
 * la pestaña): el comprador normal no la ve nunca. Prende y apaga los puntos editables y vuelve al panel.
 */
export function OwnerBar() {
  const search = useSearchParams().toString();
  const pathname = usePathname();
  const available = useOwnerMode((s) => s.available);
  const on = useOwnerMode((s) => s.on);
  const update = useOwnerMode((s) => s.update);
  useEffect(() => { update((s) => applyOwnerParam(s, ownerParam(search))); }, [search, update]);
  if (!available) return null;
  const count = spotsForPath(pathname).length;
  return (
    <section aria-label="Modo dueño" data-owner-bar={on ? "on" : "off"} className="border-b border-dashed border-line bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-1 sm:px-6">
        <Switch checked={on} onChange={() => update(toggleOwner)} label="Modo dueño"
          description={on ? `${count} ${count === 1 ? "punto" : "puntos"} para editar en esta pantalla` : "Mostrá qué se cambia desde el panel"} />
        {on && (
          <p className="flex min-w-0 items-center gap-2 text-xs text-muted max-sm:order-last max-sm:basis-full max-sm:pb-1">
            <MousePointerClick size={15} aria-hidden="true" className="shrink-0 text-volt-ink" />
            Tocá una placa para ir a la pantalla del panel donde se edita.
          </p>
        )}
        <Link href="/admin-demo/" className="ml-auto inline-flex min-h-10 items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-volt-ink underline underline-offset-4">
          <ArrowLeft size={14} aria-hidden="true" /> <span><span className="max-sm:sr-only">Volver al </span>panel</span>
        </Link>
      </div>
    </section>
  );
}
