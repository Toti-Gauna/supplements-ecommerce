"use client";
import { CalendarRange } from "lucide-react";
import { useState } from "react";
import { useDemoData } from "@/stores/admin";
import { useHydrated } from "@/stores/hydration";
import { ThemePicker } from "./ThemePicker";

/**
 * "Probar temáticas" (se apaga desde el panel). Ya no flota sobre la tienda: va en la cinta de avisos, en el menú del
 * celular y en el pie, con la forma que le dé cada lugar (`className`).
 */
export function ThemeTryButton({ className, withIcon = false }: { className?: string; withIcon?: boolean }) {
  const [open, setOpen] = useState(false);
  const show = useDemoData((d) => d.themeSettings.showTryButton);
  const hydrated = useHydrated();
  if (!hydrated || !show) return null;
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className={className}>
        {withIcon && <CalendarRange size={18} aria-hidden="true" className="shrink-0 text-volt-ink" />}
        Probar temáticas
      </button>
      <ThemePicker open={open} onClose={() => setOpen(false)} />
    </>
  );
}
