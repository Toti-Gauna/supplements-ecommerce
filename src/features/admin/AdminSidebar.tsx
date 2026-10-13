"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ArrowUpRight, ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { LogoMark } from "@/components/atoms/Logo";
import { cn } from "@/lib/cn";
import { ADMIN_GROUPS, ADMIN_NAV, BADGE_TEXT, isActive, type NavBadge } from "./nav";
import { useNavCounts } from "./useNavCounts";
import { useRailPeek } from "./useRailPeek";
import { useScrollEdges } from "./useScrollEdges";
import { useSidebarPin } from "./useSidebarPin";
import { brand } from "@/config/brand";

/**
 * En el riel de escritorio, lo que solo se ve con la barra abierta (hover, foco de teclado dentro o fijada) y lo que solo se ve
 * cerrada (el punto de aviso sobre el ícono). Los textos siguen en la página para los lectores de pantalla.
 */
const OPEN = "transition-opacity duration-150 opacity-0 group-data-[peek=true]/side:opacity-100 group-has-[:focus-visible]/side:opacity-100 group-data-[pinned=true]/side:opacity-100 motion-reduce:transition-none";
const CLOSED = "transition-opacity duration-150 group-data-[peek=true]/side:opacity-0 group-has-[:focus-visible]/side:opacity-0 group-data-[pinned=true]/side:opacity-0";
/** Sombra arriba o abajo del menú cuando hay secciones escondidas por el scroll (la barra de scroll no se ve). */
const FADE = "pointer-events-none absolute inset-x-0 z-10 from-night to-transparent transition-opacity duration-150 motion-reduce:transition-none";

const badgeTone = (b: NavBadge) => (b === "payments" ? "bg-volt text-night" : b === "stock" || b === "materials" ? "bg-warning/80 text-night" : b === "late" ? "bg-danger text-night" : "bg-white/10 text-on-night");

/**
 * Contenido de la barra lateral del panel: marca, secciones agrupadas con contadores y la "cuenta" demo. Va en el riel
 * de escritorio (`rail`, colapsable) y entero dentro del menú hamburguesa de tablets y celulares.
 */
export function SidebarContent({ onNavigate, rail = false, footer }: { onNavigate?: () => void; rail?: boolean; footer?: ReactNode }) {
  const pathname = usePathname();
  const counts = useNavCounts();
  const show = rail ? OPEN : "";
  const [navRef, edges] = useScrollEdges<HTMLElement>();
  return (
    <div className={cn("flex h-full flex-col", rail && "w-[280px]")}>
      <div className="flex items-center gap-3 px-[14px] pb-6 pt-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-sm bg-[linear-gradient(135deg,var(--color-volt-soft),var(--color-volt)_55%,color-mix(in_srgb,var(--color-volt),#000_35%))] shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_8px_20px_-10px_color-mix(in_srgb,var(--brand-volt)_80%,transparent)]">
          <LogoMark className="h-6 w-6 text-night" />
        </span>
        <span className={cn("min-w-0", show)}>
          <span className="font-display block text-[1.45rem] leading-none text-on-night">{brand.name}</span>
          <span className="mt-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-volt">Admin · demo</span>
        </span>
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">
        <span aria-hidden="true" className={cn(FADE, "top-0 h-8 bg-gradient-to-b", edges.above ? "opacity-100" : "opacity-0")} />
        <span aria-hidden="true" data-more-below={edges.below} className={cn(FADE, "bottom-0 flex h-14 items-end gap-3 bg-gradient-to-t from-45% pb-1 pl-[27px]", edges.below ? "opacity-100" : "opacity-0")}>
          <ChevronDown size={18} className="shrink-0 text-on-night" />
          <span className={cn("whitespace-nowrap text-[11px] font-bold text-night-muted", show)}>Más secciones abajo</span>
        </span>
        <nav ref={navRef} aria-label="Secciones del panel demo" className="no-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
          {ADMIN_GROUPS.map((g) => (
            <div key={g} className="mb-5">
              <p className={cn("mb-1.5 px-[15px] text-[10px] font-extrabold uppercase tracking-[0.2em] text-night-muted", show)}>{g}</p>
              <ul className="flex flex-col gap-0.5">
                {ADMIN_NAV.filter((n) => n.group === g).map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  const count = item.badge ? counts[item.badge] : 0;
                  return (
                    <li key={item.href}>
                      <Link href={item.href} onClick={onNavigate} aria-current={active ? "page" : undefined}
                        className={cn("group relative flex h-10 items-center gap-3 rounded-sm px-[15px] text-[14px] font-semibold transition-colors",
                          active ? "text-white" : "text-night-muted hover:bg-white/[0.04] hover:text-white")}>
                        {active && <span aria-hidden="true" className="animate-fade-in absolute inset-0 rounded-sm bg-white/[0.08] ring-1 ring-white/[0.06]" />}
                        {active && <span aria-hidden="true" className="absolute -left-3 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-sm bg-volt" />}
                        <span className="relative shrink-0">
                          <Icon size={18} aria-hidden="true" className={cn("transition-colors", active ? "text-volt" : "text-night-muted group-hover:text-on-night")} />
                          {rail && count > 0 && <span aria-hidden="true" className={cn("absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-sm ring-2 ring-night", badgeTone(item.badge!), CLOSED)} />}
                        </span>
                        <span className={cn("relative min-w-0 flex-1 truncate", show)}>{item.label}</span>
                        {count > 0 && (
                          <span className={cn("relative grid h-5 min-w-5 place-items-center rounded-sm px-1.5 text-[11px] font-extrabold tabular-nums", badgeTone(item.badge!), show)}>
                            {count}<span className="sr-only"> {BADGE_TEXT[item.badge!]}</span>
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-3 mb-3 flex flex-col gap-1">
        <div className={cn("flex items-center gap-3 rounded-sm px-[10px] py-2", show)}>
          <span aria-hidden="true" className="font-display grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-on-night text-base text-night">V</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-on-night">{brand.name} (demo)</span>
            <span className="block truncate text-xs text-night-muted">Datos ficticios · sin login</span>
          </span>
        </div>
        <Link href="/" onClick={onNavigate} className="flex h-10 items-center gap-3 rounded-sm px-[15px] text-[13px] font-bold text-on-night transition-colors hover:bg-white/[0.07]">
          <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-volt" /><span className={show}>Ir a la tienda</span>
        </Link>
        {footer}
      </div>
    </div>
  );
}

/**
 * Riel de escritorio (8.3.2): solo íconos por defecto; se despliega encima del contenido si el mouse se queda un momento
 * (cruzarlo de pasada no lo abre) o al entrar con el teclado, sin mover la página. Se puede fijar abierto, y entonces
 * sí ocupa su lugar.
 */
export function AdminSidebar() {
  const [pinned, setPinned] = useSidebarPin();
  const { peek, ...peekHandlers } = useRailPeek();
  const Toggle = pinned ? PanelLeftClose : PanelLeftOpen;
  return (
    <aside data-pinned={pinned} data-peek={peek} {...peekHandlers}
      className={cn("group/side sticky top-0 z-50 hidden h-dvh shrink-0 transition-[width] duration-200 motion-reduce:transition-none desk:block", pinned ? "w-[280px]" : "w-[72px]")}>
      <div className={cn("absolute inset-y-0 left-0 overflow-hidden border-r border-white/[0.06] bg-night transition-[width,box-shadow] duration-200 ease-out motion-reduce:transition-none",
        pinned ? "w-[280px]" : "w-[72px] group-data-[peek=true]/side:w-[280px] group-data-[peek=true]/side:shadow-[24px_0_48px_-24px_rgb(0_0_0/0.55)] group-has-[:focus-visible]/side:w-[280px] group-has-[:focus-visible]/side:shadow-[24px_0_48px_-24px_rgb(0_0_0/0.55)]")}>
        <SidebarContent rail footer={
          <button type="button" onClick={() => setPinned(!pinned)} aria-pressed={pinned} aria-label={pinned ? "Contraer el menú" : "Fijar el menú abierto"}
            className="flex h-10 items-center gap-3 rounded-sm px-[15px] text-[13px] font-bold text-night-muted transition-colors hover:bg-white/[0.07] hover:text-white">
            <Toggle size={18} aria-hidden="true" className="shrink-0" /><span className={OPEN}>{pinned ? "Contraer el menú" : "Fijar el menú abierto"}</span>
          </button>
        } />
      </div>
    </aside>
  );
}
