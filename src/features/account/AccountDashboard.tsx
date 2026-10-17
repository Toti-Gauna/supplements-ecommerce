"use client";
import { BatteryCharging, CalendarClock, Gift, LogOut, MapPin, Package, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { LevelGlyph } from "@/components/illustrations/LevelGlyph";
import { levelFor } from "@/demo/engine/club-levels";
import { demoAccountProgress } from "@/demo/fixtures/commerce";
import { cn } from "@/lib/cn";
import { scrollBehavior } from "@/lib/scroll";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useGameCodes } from "@/stores/game";
import { useGifts } from "@/stores/gifts";
import { useWheelPrize } from "../club/useWheelPrize";
import { AccountGifts, receivedGifts } from "../gifts/AccountGifts";
import { AddressesSection, MissionsSection, RewardsSection, availableRewards } from "./AccountSections";
import { MyBoxSection } from "./MyBoxSection";
import { OrdersSection } from "./OrdersSection";
import { SubscriptionsSection, useOwnSubscriptions } from "./SubscriptionsSection";
import { useAccountOrders } from "./useAccountOrders";
import { potsInUse } from "@/demo/engine/repurchase";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useAccountTab, type AccountTab } from "./useAccountTab";

interface Section { id: AccountTab; title: string; icon: LucideIcon; summary: string; intro: string; body: ReactNode }

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Mi cuenta con la sesión abierta (8.2.12 y pedido de Ignacio): cada parte en su tarjeta y una sola a la vista,
 * para no tener que bajar por todo. En el celular las tarjetas van en grilla y la sección elegida debajo; en
 * escritorio, a la izquierda como menú.
 */
export function AccountDashboard({ user }: { user: { name: string; email: string } }) {
  const { logout, usedRewards, markRewardUsed } = useAccount();
  const orders = useAccountOrders();
  const pots = potsInUse(orders, useDemoData((d) => d.products), DEMO_TODAY).length;
  const missions = useDemoData((d) => d.missions).filter((m) => m.active !== false);
  const { sent, saved, opened } = useGifts();
  const received = receivedGifts(user.email, sent, saved);
  const records = useDemoData((d) => d.giftRecords ?? []);
  const unopened = received.filter((g) => !opened.includes(g.code) && (records.find((r) => r.code === g.code)?.status ?? "enviado") === "enviado").length;
  const { status: prizeStatus } = useWheelPrize();
  // Cupones de Shaker Rush que todavía se pueden usar (no agotados).
  const gameCodes = useGameCodes();
  const coupons = useDemoData((d) => d.coupons);
  const gameLeft = gameCodes.filter((code) => { const c = coupons.find((x) => x.code === code); return c && !(c.maxUses !== undefined && (c.usedCount ?? 0) >= c.maxUses); }).length;
  const rewards = availableRewards(usedRewards) + (prizeStatus && prizeStatus !== "utilizado" ? 1 : 0) + gameLeft;
  const subscriptions = useOwnSubscriptions().filter((s) => s.status !== "cancelled").length;
  const [tab, select] = useAccountTab();
  const sections: Section[] = [
    { id: "mi-box", title: "Mi box", icon: BatteryCharging, summary: pots ? plural(pots, "pote en uso", "potes en uso") : "Sin potes en uso", intro: "Lo que te queda de cada pote, tu nivel y recomprar en un toque.", body: <MyBoxSection /> },
    { id: "pedidos", title: "Mis pedidos", icon: Package, summary: plural(orders.length, "pedido", "pedidos"), intro: "Seguí cada pedido paso a paso o repetilo.", body: <OrdersSection /> },
    { id: "suscripciones", title: "Suscripciones", icon: CalendarClock, summary: subscriptions ? plural(subscriptions, "activa", "activas") : "Sin suscripciones", intro: "Los packs que recibís todos los meses (simulado: no se cobra nada).", body: <SubscriptionsSection /> },
    { id: "regalos", title: "Mis regalos", icon: Gift, summary: unopened ? plural(unopened, "sin abrir", "sin abrir") : plural(received.length, "regalo", "regalos"), intro: "Tus gift cards con su saldo, los regalos que te mandaron y los que hiciste, con su estado.", body: <AccountGifts email={user.email} /> },
    { id: "misiones", title: "Misiones", icon: Sparkles, summary: plural(missions.length, "activa", "activas"), intro: "Tus compras suman a cada misión (progreso de ejemplo).", body: <MissionsSection /> },
    { id: "premios", title: "Premios", icon: Trophy, summary: rewards ? plural(rewards, "disponible", "disponibles") : "Sin premios para usar", intro: "Los cupones de la ruleta y de Shaker Rush y los premios de las misiones, de un solo uso.", body: <RewardsSection used={usedRewards} onUse={markRewardUsed} /> },
    { id: "direcciones", title: "Direcciones", icon: MapPin, summary: "1 guardada", intro: "Donde te llegan los pedidos.", body: <AddressesSection /> },
  ];
  const current = sections.find((s) => s.id === tab)!;
  const open = (e: MouseEvent, id: AccountTab) => {
    e.preventDefault();
    select(id);
    // En el celular la sección queda debajo de las tarjetas: se acerca solo si no está a la vista.
    const panel = document.getElementById("cuenta-seccion");
    if (panel && panel.getBoundingClientRect().top > window.innerHeight * 0.6) panel.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
  };
  const first = user.name.split(" ")[0];
  // Gasto de muestra de la cuenta demo (el mismo que muestra el Club).
  const level = levelFor(demoAccountProgress["m-gasto"] ?? 0);
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-sm bg-night p-5 text-on-night shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-sm bg-volt text-2xl text-night">{first?.[0]?.toUpperCase()}</span>
            <div className="min-w-0">
              <p className="font-display text-2xl leading-tight">Hola, {first}</p>
              <p className="break-all text-sm text-night-muted">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-volt">
              <LevelGlyph level={level.id} className="h-6 w-6 text-volt" />Nivel {level.name}
            </span>
            <button type="button" onClick={logout} className="flex min-h-10 items-center gap-1.5 rounded-sm border border-white/15 px-3.5 text-sm font-bold transition-colors hover:bg-white/10">
              <LogOut size={16} aria-hidden="true" /> Salir
            </button>
          </div>
        </div>
        <nav aria-label="Secciones de la cuenta">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-1">
            {sections.map(({ id, title, icon: Icon, summary }, i) => {
              const on = id === tab;
              return (
                <li key={id} className={cn(sections.length % 2 === 1 && i === sections.length - 1 && "max-md:col-span-2")}>
                  <a href={`#${id}`} aria-current={on ? "true" : undefined} onClick={(e) => open(e, id)}
                    className={cn("flex h-full min-h-20 items-center gap-2.5 rounded-sm border p-3 transition-[background-color,border-color,box-shadow] sm:gap-3 sm:p-3.5 md:flex-col md:items-start lg:min-h-16 lg:flex-row lg:items-center lg:py-3",
                      on ? "border-night bg-night text-on-night shadow-[var(--shadow-card)]" : "border-line bg-surface hover:border-ink/30")}>
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-sm sm:h-10 sm:w-10", on ? "bg-volt text-night" : "bg-accent text-primary")}><Icon size={19} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block font-bold leading-tight">{title}</span>
                      <span className={cn("block text-xs", on ? "text-night-muted" : "text-muted")}>{summary}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <section id="cuenta-seccion" aria-labelledby="cuenta-seccion-t" className="scroll-mt-24 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
        <div key={current.id} className="animate-fade-up flex flex-col gap-5">
          <header>
            <h2 id="cuenta-seccion-t" className="font-display text-3xl leading-tight sm:text-4xl">{current.title}</h2>
            <p className="mt-1 text-sm text-muted">{current.intro}</p>
          </header>
          {current.body}
        </div>
      </section>
    </div>
  );
}
