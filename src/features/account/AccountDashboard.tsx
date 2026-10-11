"use client";
import { Gift, LogOut, MapPin, Package, Sparkles, Trophy, type LucideIcon } from "lucide-react";
import type { MouseEvent, ReactNode } from "react";
import { giftsFor } from "@/demo/engine/gifts";
import { demoGifts } from "@/demo/fixtures/gifts";
import { cn } from "@/lib/cn";
import { scrollBehavior } from "@/lib/scroll";
import { useAccount } from "@/stores/account";
import { useDemoData } from "@/stores/admin";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { useWheelPrize } from "../club/useWheelPrize";
import { AccountGifts } from "../gifts/AccountGifts";
import { AddressesSection, MissionsSection, OrdersSection, RewardsSection, availableRewards } from "./AccountSections";
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
  const lastOrder = useCheckout((s) => s.lastOrder);
  const missions = useDemoData((d) => d.missions).filter((m) => m.active !== false);
  const { sent, saved, opened } = useGifts();
  const received = giftsFor(user.email, { addressed: [...demoGifts, ...sent], saved });
  const unopened = received.filter((g) => !opened.includes(g.code)).length;
  const { status: prizeStatus } = useWheelPrize();
  const rewards = availableRewards(usedRewards) + (prizeStatus && prizeStatus !== "utilizado" ? 1 : 0);
  const [tab, select] = useAccountTab();
  const sections: Section[] = [
    { id: "pedidos", title: "Mis pedidos", icon: Package, summary: plural(lastOrder ? 2 : 1, "pedido", "pedidos"), intro: "Seguí cada pedido paso a paso.", body: <OrdersSection lastOrder={lastOrder} /> },
    { id: "regalos", title: "Mis regalos", icon: Gift, summary: unopened ? plural(unopened, "sin abrir", "sin abrir") : plural(received.length, "regalo", "regalos"), intro: "Los que te mandaron se abren sin el link; los que hiciste, para volver a mandarlos.", body: <AccountGifts email={user.email} /> },
    { id: "misiones", title: "Misiones", icon: Sparkles, summary: plural(missions.length, "activa", "activas"), intro: "Tus compras suman a cada misión (progreso de ejemplo).", body: <MissionsSection /> },
    { id: "premios", title: "Premios", icon: Trophy, summary: rewards ? plural(rewards, "disponible", "disponibles") : "Sin premios para usar", intro: "El premio de la ruleta y los de las misiones, de un solo uso.", body: <RewardsSection used={usedRewards} onUse={markRewardUsed} /> },
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
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8">
      <div className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="rounded-[2rem] bg-night p-5 text-[#f6f1e8] shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="font-display grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brass text-2xl text-night">{first?.[0]?.toUpperCase()}</span>
            <div className="min-w-0">
              <p className="font-display text-2xl leading-tight">Hola, {first}</p>
              <p className="break-all text-sm text-[#cfc6b3]">{user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brass">Cuenta demo</span>
            <button type="button" onClick={logout} className="flex min-h-10 items-center gap-1.5 rounded-full border border-white/15 px-3.5 text-sm font-bold transition-colors hover:bg-white/10">
              <LogOut size={16} aria-hidden="true" /> Salir
            </button>
          </div>
        </div>
        <nav aria-label="Secciones de la cuenta">
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-5 lg:grid-cols-1">
            {sections.map(({ id, title, icon: Icon, summary }, i) => {
              const on = id === tab;
              return (
                <li key={id} className={cn(i === sections.length - 1 && "max-md:col-span-2")}>
                  <a href={`#${id}`} aria-current={on ? "true" : undefined} onClick={(e) => open(e, id)}
                    className={cn("flex h-full min-h-20 items-center gap-2.5 rounded-[1.6rem] border p-3 transition-[background-color,border-color,box-shadow] sm:gap-3 sm:p-3.5 md:flex-col md:items-start lg:min-h-16 lg:flex-row lg:items-center lg:py-3",
                      on ? "border-night bg-night text-[#f6f1e8] shadow-[var(--shadow-card)]" : "border-line bg-surface hover:border-ink/30")}>
                    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10", on ? "bg-brass text-night" : "bg-accent text-primary")}><Icon size={19} aria-hidden="true" /></span>
                    <span className="min-w-0">
                      <span className="block font-bold leading-tight">{title}</span>
                      <span className={cn("block text-xs", on ? "text-[#cfc6b3]" : "text-muted")}>{summary}</span>
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <section id="cuenta-seccion" aria-labelledby="cuenta-seccion-t" className="scroll-mt-24 rounded-[2rem] bg-surface p-5 shadow-[var(--shadow-card)] sm:p-8">
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
