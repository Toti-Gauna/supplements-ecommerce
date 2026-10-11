"use client";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { bottomBarFor } from "@/components/organisms/bottomBars";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { ThemePicker } from "./ThemePicker";

/** Botón flotante "Probar temáticas" (se apaga desde el panel). Va a la izquierda; WhatsApp queda a la derecha. */
export function ThemeTryButton() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const show = useDemoData((d) => d.themeSettings.showTryButton);
  const hydrated = useHydrated();
  if (!hydrated || !show) return null;
  const bar = bottomBarFor(pathname);
  if (bar === "preview") return null;
  const bottom = bar === "none" ? "bottom-5" : bar === "product" ? "bottom-[calc(6rem+env(safe-area-inset-bottom))] sm:bottom-6" : "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog"
        className={`animate-fade-up fixed left-4 z-30 inline-flex items-center gap-2 rounded-full bg-night px-3.5 py-2.5 text-[13px] font-bold sm:px-4 sm:py-3 sm:text-sm text-[#f6f1e8] shadow-lg ring-1 ring-brass/40 transition-transform hover:-translate-y-0.5 ${bottom}`}>
        <Sparkles size={18} aria-hidden="true" className="text-brass" />
        Probar temáticas
      </button>
      <ThemePicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}
