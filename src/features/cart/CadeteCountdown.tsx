"use client";
import { Bike } from "lucide-react";
import { useEffect, useState } from "react";
import { demoNow } from "@/demo/clock";
import { cadeteClock, countdownText } from "@/demo/engine/cadete-clock";
import type { CartLine } from "@/demo/engine/cart-types";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEMO_ORDER_CODE } from "@/demo/fixtures/commerce";
import { cn } from "@/lib/cn";
import { whenDay } from "@/lib/date";
import { useAdmin, useDemoData } from "@/stores/admin";

/** "Ahora" de la demo, que se renueva cada medio minuto (no es una animación: solo cambia el texto del reloj). */
function useDemoNow(): string {
  const [now, setNow] = useState(() => demoNow());
  useEffect(() => {
    const t = window.setInterval(() => setNow(demoNow()), 30_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

/**
 * Cuenta regresiva del cadete en el pie del bolso: qué día lo lleva el cadete si se pide hoy (calendario y cupo del
 * panel) y cuánto falta para que esa fecha cambie. Si no hay cadete activo, no se muestra.
 */
export function CadeteCountdown({ lines, className }: { lines: CartLine[]; className?: string }) {
  const zone = useDemoData((d) => d.zones.find((z) => z.type === "LOCAL_DELIVERY" && z.active !== false));
  const orders = useAdmin((s) => s.orders);
  const settings = useAdmin((s) => s.workshop.settings);
  const now = useDemoNow();
  if (!zone || lines.length === 0) return null;
  const clock = cadeteClock(lines, now, DEMO_TODAY, orders, settings, DEMO_ORDER_CODE);
  return (
    <p role="note" aria-label="Cadete" className={cn("flex items-start gap-2 text-[13px]", className)}>
      <Bike size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-volt-ink" />
      <span>
        <strong>{zone.name}:</strong> llega {whenDay(clock.day, DEMO_TODAY)}
        {clock.minutesLeft !== null && <> si confirmás en las próximas <strong className="font-mono tabular-nums">{countdownText(clock.minutesLeft)}</strong></>}
      </span>
    </p>
  );
}
