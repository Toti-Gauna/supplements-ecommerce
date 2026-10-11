"use client";
import { useEffect, useState, type ReactNode } from "react";
import { Sheet } from "@/components/motion/Sheet";
import { AdminGate } from "./AdminGate";
import { AdminSidebar, SidebarContent } from "./AdminSidebar";
import { AdminTabBar } from "./AdminTabBar";
import { AdminTopbar } from "./AdminTopbar";
import { CommandPalette } from "./CommandPalette";

/**
 * Estructura del panel: barra lateral colapsable en escritorio con mouse; en tablets y celulares, menú hamburguesa y
 * pestañas inferiores (8.3.2). Sin guía de bienvenida (8.3.11): queda la señal de demo y la ayuda de cada pantalla.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState(false);
  // ⌘K / Ctrl+K abre el buscador desde cualquier pantalla del panel.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return (
    <div className="flex min-h-dvh">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenu={() => setMenuOpen(true)} onSearch={() => setSearch(true)} />
        <main id="contenido" className="mx-auto w-full min-w-0 max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pt-8 desk:pb-16">
          <AdminGate>{children}</AdminGate>
        </main>
      </div>
      <AdminTabBar onMore={() => setMenuOpen(true)} moreOpen={menuOpen} />
      <CommandPalette open={search} onClose={() => setSearch(false)} />
      <Sheet open={menuOpen} onClose={() => setMenuOpen(false)} title="Menú del panel" side="left" className="max-w-[min(88vw,320px)] bg-night">
        <SidebarContent onNavigate={() => setMenuOpen(false)} />
      </Sheet>
    </div>
  );
}
