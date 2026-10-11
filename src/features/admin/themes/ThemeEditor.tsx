"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateInput } from "@/components/atoms/DateInput";
import { Input, Textarea } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { Sheet } from "@/components/motion/Sheet";
import type { SeasonalTheme, SeasonId } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useDemoSave } from "../useDemoSave";
import { ThemeMiniPreview } from "./ThemeMiniPreview";
import { ThemeProductsField } from "./ThemeProductsField";

/** Edición de una temática en un panel lateral, con vista previa del banner en vivo. */
export function ThemeEditor({ id, onClose }: { id: SeasonId | null; onClose: () => void }) {
  const theme = useAdmin((s) => s.data.themes.find((t) => t.id === id));
  return (
    <Sheet open={Boolean(theme)} onClose={onClose} title={theme ? `Editar ${theme.name}` : "Editar temática"} className="max-w-xl">
      {theme && <EditorForm key={theme.id} initial={theme} onClose={onClose} />}
    </Sheet>
  );
}

function EditorForm({ initial, onClose }: { initial: SeasonalTheme; onClose: () => void }) {
  const coupons = useAdmin((s) => s.data.coupons).filter((c) => !c.code.startsWith("RULETA"));
  const saveTheme = useAdmin((s) => s.saveTheme);
  const save = useDemoSave();
  const [t, setT] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<SeasonalTheme>) => setT((x) => ({ ...x, ...p }));
  const submit = () => {
    if (!t.startsOn || !t.endsOn) return setError("Elegí las dos fechas.");
    if (!t.headline.trim() || !t.ribbon.trim()) return setError("El titular y la cinta no pueden quedar vacíos.");
    if (t.productSlugs.length === 0) return setError("Elegí al menos un producto en oferta.");
    save(`${t.name} guardada`, () => saveTheme({ ...t, headline: t.headline.trim(), subtitle: t.subtitle.trim(), ribbon: t.ribbon.trim() }));
    onClose();
  };
  return (
    <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex min-h-0 flex-1 flex-col">
      <div className="px-6 pb-3 pt-6">
        <p className="eyebrow text-brass-ink">Temática</p>
        <h2 className="font-display mt-1 text-3xl">{t.name}</h2>
      </div>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 pb-6 [&>*]:shrink-0">
        <ThemeMiniPreview theme={t} />
        <Switch checked={t.active} onChange={(v) => set({ active: v })} label="Habilitada" description="Sale sola en sus fechas (modo automático) y aparece en “Probar temáticas”." />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex min-w-0 flex-col gap-1 text-sm font-bold">Desde<DateInput value={t.startsOn} onChange={(e) => set({ startsOn: e.target.value })} /></label>
          <label className="flex min-w-0 flex-col gap-1 text-sm font-bold">Hasta<DateInput value={t.endsOn} onChange={(e) => set({ endsOn: e.target.value })} /></label>
          <p className="-mt-1 text-xs text-muted sm:col-span-2">Se repite todos los años en estas fechas (cuentan día y mes).</p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-bold">Titular<Input value={t.headline} maxLength={60} onChange={(e) => set({ headline: e.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Bajada<Textarea value={t.subtitle} maxLength={140} onChange={(e) => set({ subtitle: e.target.value })} className="min-h-20" /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Texto de la cinta superior<Input value={t.ribbon} maxLength={70} onChange={(e) => set({ ribbon: e.target.value })} /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Cupón de la oferta
          <Select value={t.couponCode} onChange={(e) => set({ couponCode: e.target.value })}>
            {coupons.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.description}{c.active === false ? " (pausado)" : ""}</option>)}
          </Select>
          <span className="text-xs font-normal text-muted">El descuento y las condiciones se editan en Cupones y ruleta.</span>
        </label>
        <ThemeProductsField value={t.productSlugs} onChange={(productSlugs) => set({ productSlugs })} />
        {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      </div>
      <div className="flex gap-2 border-t border-line bg-surface px-6 py-4">
        <Button type="submit" className="flex-1">Guardar temática</Button>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}
