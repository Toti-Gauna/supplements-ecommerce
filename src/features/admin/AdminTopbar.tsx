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
      <p className="flex items-center gap-2 border-b border-dashed border-warning/50 bg-warning-soft px-4 py-1.5 text-[12px] font-bold text-warning lg:px-10">
        <FlaskConical size={14} aria-hidden="true" className="shrink-0" />
        <span>Panel de demostración · datos ficticios<span className="hidden font-semibold sm:inline"> · Sin login a propósito: no es seguro ni sirve como acceso real.</span></span>
      </p>
      <div className="flex h-14 items-center gap-3 px-4 lg:h-16 lg:px-10">
        <button type="button" onClick={onMenu} aria-label="Abrir menú del panel" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-night text-brass shadow-[var(--shadow-card)] desk:hidden">
          <Menu size={20} aria-hidden="true" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="hidden items-center gap-2 text-sm font-semibold text-muted lg:flex">Panel <ChevronRight size={14} aria-hidden="true" />{section.href !== "/admin-demo/" && section.group !== section.label && <>{section.group} <ChevronRight size={14} aria-hidden="true" /></>}</span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-primary lg:hidden"><Icon size={16} aria-hidden="true" /></span>
          <span className="truncate text-[15px] font-bold lg:text-sm">{section.label}</span>
        </div>
        <button type="button" onClick={onSearch} aria-label="Buscar en el panel (⌘K)" className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/12 bg-surface px-3 text-sm font-semibold text-muted transition-colors hover:border-ink/25 hover:text-ink md:w-64 md:px-4">
          <Search size={16} aria-hidden="true" /><span className="hidden flex-1 text-left md:inline">Buscar o ir a…</span>
          <kbd className="hidden rounded-md border border-line bg-bg px-1.5 py-0.5 text-[11px] font-bold md:inline">⌘K</kbd>
        </button>
        <Link href="/" className="hidden h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-primary transition-colors hover:bg-accent/60 xl:flex">
          Ver tienda <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
        <ThemeToggle className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-accent/60 hover:text-ink" />
        <button type="button" onClick={reset} aria-label="Reiniciar demo" className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-ink/15 bg-surface px-3 text-sm font-bold transition-colors hover:border-ink/30 sm:px-4">
          <RotateCcw size={15} aria-hidden="true" /><span className="hidden sm:inline">Reiniciar demo</span>
        </button>
      </div>
    </header>
  );
}
