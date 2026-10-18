"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ellipsis } from "lucide-react";
import { TabIndicator } from "@/components/atoms/TabIndicator";
import { cn } from "@/lib/cn";
import { MOBILE_NAV, isActive } from "./nav";
import { useNavCounts } from "./useNavCounts";

/**
 * Pestañas inferiores del panel en celulares y tablets (como una app): las secciones de uso diario (`MOBILE_ORDER`; en R4b
 * "Mostrador" entra en el centro) + "Más". Cápsula flotante:
 * Safari 26 de iPhone no dibuja nada fijo detrás de su barra, así que no se intenta llegar al borde.
 */
export function AdminTabBar({ onMore, moreOpen }: { onMore: () => void; moreOpen: boolean }) {
  const pathname = usePathname();
  const counts = useNavCounts();
  const tabs = MOBILE_NAV;
  const current = tabs.findIndex((t) => isActive(pathname, t));
  const inTabs = current >= 0;
  const item = "relative flex flex-1 flex-col items-center justify-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] transition-colors";
  return (
    <nav aria-label="Accesos rápidos del panel" className="floor fixed inset-x-2 bottom-[calc(0.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-lg overflow-hidden rounded-sm border border-white/[0.1] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-14px_rgb(0_0_0/0.6)] desk:hidden">
      {/* Fuera de las pestañas, la marca va a "Más" (el último lugar). */}
      <TabIndicator index={inTabs ? current : tabs.length} count={tabs.length + 1} className="inset-x-2">
        <span className="absolute inset-x-3 top-0 h-[3px] bg-volt" />
      </TabIndicator>
      <ul className="flex h-16 px-2">
        {tabs.map((t) => {
          const active = isActive(pathname, t);
          const Icon = t.icon;
          const count = t.attention.reduce((sum, b) => sum + counts[b], 0);
          return (
            <li key={t.id} className="flex flex-1">
              <Link href={t.href} aria-current={active ? "page" : undefined} className={cn(item, active ? "text-volt" : "text-night-muted")}>
                <span className="relative">
                  <Icon size={21} aria-hidden="true" />
                  {count > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-xs bg-volt px-1 font-mono text-[10px] font-bold text-night">{count}</span>}
                </span>
                {t.short}{count > 0 && <span className="sr-only"> ({count} para atender)</span>}
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1">
          <button type="button" onClick={onMore} aria-label="Más secciones del panel" aria-expanded={moreOpen} className={cn(item, !inTabs ? "text-volt" : "text-night-muted")}>
            <Ellipsis size={21} aria-hidden="true" />Más
          </button>
        </li>
      </ul>
    </nav>
  );
}
