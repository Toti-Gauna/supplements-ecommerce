"use client";
import { CalendarClock, Info } from "lucide-react";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { currentTheme, nextTheme } from "@/demo/engine/themes";
import type { SeasonId, ThemeSettings } from "@/demo/types";
import { formatDayRange } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";
import { brand } from "@/config/brand";

const MODES: { value: ThemeSettings["mode"]; label: string; hint: string }[] = [
  { value: "auto", label: "Automática según la fecha", hint: "La tienda usa sola la temática cuyas fechas incluyen hoy. Fuera de esas fechas se ve sin temática." },
  { value: "fixed", label: "Siempre la que elija", hint: "La tienda muestra siempre la temática elegida, aunque no sea su fecha, hasta que cambies el modo." },
  { value: "off", label: "Sin temática", hint: `La tienda se ve con el estilo de siempre de ${brand.name}, sin banner ni decoraciones de fecha.` },
];

/**
 * Cómo elige la tienda la temática y qué ve hoy el cliente (8.3.26). La temática fija solo aparece en modo fijo, así
 * no se confunde con la que está saliendo por fecha; las tarjetas se apilan cuando el bloque es angosto.
 */
export function ThemeMode() {
  const settings = useAdmin((s) => s.data.themeSettings);
  const themes = useAdmin((s) => s.data.themes);
  const saveSettings = useAdmin((s) => s.saveThemeSettings);
  const save = useDemoSave();
  const now = new Date();
  const today = currentTheme(now, null);
  const next = nextTheme(now);
  const mode = MODES.find((m) => m.value === settings.mode) ?? MODES[0]!;
  const fixedName = themes.find((t) => t.id === settings.fixedId)?.name;
  const nextNote = settings.mode === "fixed" ? `En modo fijo no cambia sola: sigue ${fixedName ?? "la elegida"}.`
    : settings.mode === "off" ? "Saldría en modo automático." : "Sale sola cuando llegue su fecha.";
  return (
    <section aria-labelledby="modo-title" className="@container mb-6 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="grid gap-5 @min-[58rem]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 id="modo-title" className="text-lg font-bold">Cómo se elige</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,17rem),1fr))] gap-3">
            <div className="flex min-w-0 flex-col gap-1">
              <label htmlFor="tm-mode" className="text-sm font-bold">Modo</label>
              <Select id="tm-mode" value={settings.mode} aria-describedby="tm-mode-hint" onChange={(e) => save("Modo de temáticas guardado", () => saveSettings({ mode: e.target.value as ThemeSettings["mode"] }))}>
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </Select>
            </div>
            {settings.mode === "fixed" && (
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor="tm-fixed" className="text-sm font-bold">Temática fija</label>
                <Select id="tm-fixed" value={settings.fixedId} onChange={(e) => save("Temática fija guardada", () => saveSettings({ fixedId: e.target.value as SeasonId }))}>
                  {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </div>
            )}
          </div>
          <p id="tm-mode-hint" className="flex gap-2 rounded-sm bg-bg p-3 text-sm text-muted"><Info size={16} aria-hidden="true" className="mt-0.5 shrink-0" />{mode.hint}</p>
          <Switch checked={settings.showTryButton} onChange={(v) => save(v ? "Botón “Probar temáticas” visible" : "Botón “Probar temáticas” oculto", () => saveSettings({ showTryButton: v }))}
            label="Botón “Probar temáticas” en la tienda" description="Para mostrarle la demo al cliente: cada visitante puede ver cualquier temática solo en su navegador." />
        </div>
        <div className="grid content-start grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-3">
          <p className="rounded-sm bg-accent/60 p-4 text-sm">
            <span className="block text-xs font-bold uppercase tracking-wider text-muted">Hoy ve el cliente</span>
            <strong className="mt-1 block text-xl">{today?.name ?? "Sin temática"}</strong>
            <span className="block text-muted">{today ? (settings.mode === "fixed" ? "Temática fija, sin importar la fecha" : formatDayRange(today.startsOn, today.endsOn)) : settings.mode === "off" ? "Modo sin temática" : "Hoy no hay ninguna en fecha"}</span>
          </p>
          <p className="rounded-sm bg-accent/60 p-4 text-sm">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><CalendarClock size={14} aria-hidden="true" />Próxima por fecha</span>
            <strong className="mt-1 block text-xl">{next?.name ?? "—"}</strong>
            {next && <span className="block text-muted">{formatDayRange(next.startsOn, next.endsOn)}</span>}
            {next && <span className="mt-1 block text-xs font-semibold text-muted">{nextNote}</span>}
          </p>
        </div>
      </div>
    </section>
  );
}
