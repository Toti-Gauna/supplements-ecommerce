"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight, FlaskConical, Menu, RotateCcw, Search } from "lucide-react";
import { resetDemo } from "@/stores/hydration";
import { useToasts } from "@/stores/toast";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { currentSection } from "./nav";

/**
 * Barra superior del panel. Lleva la señal persistente de demo (abierto a propósito, datos ficticios, sin
 * seguridad real), la sección actual y las acciones. En el celular suma el botón del menú hamburguesa.
 */
export function AdminTopbar({ onMenu, onSearch }: { onMenu: () => void; onSearch: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToasts((s) => s.push);
  const section = currentSection(pathname);
  const Icon = section.icon;
  const reset = () => {
    if (!window.confirm("¿Reiniciar la demo? Panel y tienda vuelven a los datos ficticios iniciales en este navegador.")) return;
    resetDemo();
    toast({ tone: "info", title: "Demo reiniciada", description: "Panel y tienda volvieron a los datos de muestra." });
    router.push("/admin-demo/");
  };
  return (
    <header data-admin-topbar className="sticky top-[env(safe-area-inset-top)] z-40 border-b border-line bg-bg">
      <p className="floor flex items-center gap-2 border-b border-white/10 px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-on-night lg:px-10">
        <FlaskConical size={14} aria-hidden="true" className="shrink-0 text-volt" />
        <span>Panel de demostración · datos ficticios<span className="hidden text-night-muted sm:inline"> · Sin login a propósito: no es seguro ni sirve como acceso real.</span></span>
      </p>
      <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-10">
        <button type="button" onClick={onMenu} aria-label="Abrir menú del panel" className="bevel grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-night text-volt desk:hidden">
          <Menu size={20} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="hidden items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.06em] text-muted lg:flex">Panel <ChevronRight size={14} aria-hidden="true" /></span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-accent text-primary lg:hidden"><Icon size={16} aria-hidden="true" /></span>
          <span className="truncate font-mono text-[13px] font-bold uppercase tracking-[0.06em]">{section.label}</span>
        </div>
        <button type="button" onClick={onSearch} aria-label="Buscar en el panel (⌘K)" className="flex h-10 shrink-0 items-center gap-2 rounded-sm border border-line bg-surface px-3 font-mono text-[12px] text-muted shadow-[inset_0_2px_0_rgb(0_0_0/0.12)] transition-colors hover:border-ink/40 hover:text-ink md:w-64 md:px-4">
          <Search size={16} aria-hidden="true" /><span className="hidden flex-1 text-left md:inline">Buscar o ir a…</span>
          <kbd className="hidden border border-line px-1.5 font-mono text-[10px] md:inline">⌘K</kbd>
        </button>
        <Link href="/" className="hidden h-10 items-center gap-1.5 rounded-sm px-4 font-mono text-[12px] font-bold uppercase tracking-[0.08em] text-volt-ink transition-colors hover:bg-accent/60 xl:flex">
          Ver tienda <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <ThemeToggle className="grid h-10 w-10 shrink-0 place-items-center rounded-sm text-muted hover:bg-accent/60 hover:text-ink" />
        <button type="button" onClick={reset} aria-label="Reiniciar demo" className="plate flex h-10 shrink-0 items-center gap-2 rounded-sm border border-line px-3 font-mono text-[12px] font-bold uppercase tracking-[0.08em] transition-colors hover:border-ink/50 sm:px-4">
          <RotateCcw size={15} aria-hidden="true" /><span className="hidden sm:inline">Reiniciar demo</span>
        </button>
      </div>
    </header>
  );
}
