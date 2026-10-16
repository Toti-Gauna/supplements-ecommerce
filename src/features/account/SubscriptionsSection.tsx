"use client";
import { ButtonLink } from "@/components/atoms/Button";
import { useAdmin, useDemoData } from "@/stores/admin";
import { useSubscriptions } from "@/stores/subscriptions";
import { SubscriptionCard } from "./SubscriptionCard";

/** Cantidad de suscripciones propias (las de muestra del panel son de clientes inventados y no cuentan). */
export const useOwnSubscriptions = () => useSubscriptions((s) => s.subscriptions).filter((s) => !s.seed);

/**
 * Mi cuenta → Suscripciones (L3, SIMULADAS): los packs que se reciben todos los meses, con la próxima entrega según el
 * calendario real del local, lo que sale cada mes y las acciones para saltear, pausar, reanudar, cancelar o cambiar el día.
 */
export function SubscriptionsSection() {
  const subs = useOwnSubscriptions();
  const packs = useDemoData((d) => d.packs) ?? [];
  const { closedWeekdays, closures } = useAdmin((s) => s.workshop.settings);
  if (subs.length === 0) {
    // Sin su propio h2: la sección de la cuenta ya tiene el título de la página.
    return (
      <div className="plate flex flex-col items-start gap-3 border border-line p-5">
        <p className="font-display text-2xl">Todavía no tenés suscripciones</p>
        <p className="max-w-md text-sm text-muted">Elegí un pack y tocá “Quiero este pack todos los meses”. Es una simulación: no se cobra nada.</p>
        <ButtonLink href="/packs/" variant="secondary">Ver los packs</ButtonLink>
      </div>
    );
  }
  return (
    <ul className="flex flex-col gap-4" aria-label="Tus suscripciones">
      {subs.map((sub) => (
        <SubscriptionCard key={sub.id} sub={sub} pack={packs.find((p) => p.id === sub.packId)} packs={packs} cal={{ closedWeekdays, closures }} />
      ))}
    </ul>
  );
}
