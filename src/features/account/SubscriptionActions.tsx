"use client";
import { useId } from "react";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { DELIVERY_DAYS, nextDelivery, type Subscription } from "@/demo/engine/subscriptions";
import type { WorkCalendar } from "@/demo/engine/workdays";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatDay } from "@/lib/date";
import { useSubscriptions } from "@/stores/subscriptions";
import { useToasts } from "@/stores/toast";

/**
 * Saltear la próxima, pausar o reanudar, cancelar (con confirmación) y cambiar el día. Cada cambio avisa con un aviso
 * visible; nada se cobra ni se envía (suscripción simulada).
 */
export function SubscriptionActions({ sub, cal }: { sub: Subscription; cal: WorkCalendar }) {
  const dayId = useId();
  const { pause, resume, cancel, skipNext, setDay } = useSubscriptions();
  const toast = (title: string, description?: string) => useToasts.getState().push({ title, description, tone: "success" });
  return (
    <div className="mt-5 flex flex-col gap-4 border-t border-line pt-4">
      <div className="flex flex-wrap gap-2">
        {sub.status === "active" && (
          <>
            <Button size="sm" variant="secondary" aria-pressed={sub.skipNext} onClick={() => { skipNext(sub.id); toast(sub.skipNext ? "Vuelve la próxima entrega" : "Salteás la próxima entrega", sub.skipNext ? "Se incluye otra vez." : "Se mueve a la del mes siguiente."); }}>
              {sub.skipNext ? "No saltear la próxima" : "Saltear la próxima"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { pause(sub.id); toast("Suscripción pausada", "No sale nada hasta que la reanudes."); }}>Pausar</Button>
          </>
        )}
        {sub.status === "paused" && <Button size="sm" variant="secondary" onClick={() => { resume(sub.id); toast("Suscripción reanudada", "Vuelve a salir el día que elegiste."); }}>Reanudar</Button>}
        <ConfirmButton size="sm" variant="danger" title="¿Cancelar la suscripción?" confirmLabel="Sí, cancelar"
          description="Dejás de recibir el pack todos los meses. Podés volver a suscribirte cuando quieras." onConfirm={() => { cancel(sub.id); toast("Suscripción cancelada"); }}>Cancelar</ConfirmButton>
      </div>
      <div className="flex max-w-xs flex-col gap-1.5">
        <label htmlFor={dayId} className="font-mono text-[12px] font-bold uppercase tracking-[0.08em]">Cambiar el día</label>
        <Select id={dayId} value={sub.day} onChange={(e) => {
          const day = Number(e.target.value);
          const next = nextDelivery({ ...sub, day }, DEMO_TODAY, cal);
          setDay(sub.id, day);
          toast(`Ahora lo recibís el día ${day}`, next ? `La próxima entrega es el ${formatDay(next, "long")}.` : "Lo vas a recibir así cuando la reanudes.");
        }}>
          {DELIVERY_DAYS.map((d) => <option key={d} value={d}>Día {d}</option>)}
        </Select>
      </div>
    </div>
  );
}
