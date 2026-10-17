"use client";
import { DateInput } from "@/components/atoms/DateInput";
import { Input, Textarea } from "@/components/atoms/Field";
import { Switch } from "@/components/atoms/Switch";
import type { SeasonalTheme } from "@/demo/types";

interface Props {
  theme: SeasonalTheme;
  set: (patch: Partial<SeasonalTheme>) => void;
  /** Error de superposición con otra campaña (en vivo, al cambiar las fechas). */
  overlap: string | null;
}

/** Textos, fechas y si está habilitada: lo que se ve en el Drop, la cinta y la sala de espera. */
export function CampaignFields({ theme: t, set, overlap }: Props) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend className="sr-only">Textos y fechas</legend>
      <Switch checked={t.active} onChange={(v) => set({ active: v })} label="Campaña habilitada" description="Sale sola en sus fechas (modo automático) y aparece en “Probar temáticas”." />
      <label className="flex flex-col gap-1 text-sm font-bold">Titular<Input value={t.headline} maxLength={60} onChange={(e) => set({ headline: e.target.value })} /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Bajada<Textarea value={t.subtitle} maxLength={140} onChange={(e) => set({ subtitle: e.target.value })} className="min-h-20" /></label>
      <label className="flex flex-col gap-1 text-sm font-bold">Texto de la cinta superior<Input value={t.ribbon} maxLength={70} onChange={(e) => set({ ribbon: e.target.value })} /></label>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-1 text-sm font-bold">Desde<DateInput value={t.startsOn} aria-invalid={overlap ? true : undefined} aria-describedby="cmp-dates" onChange={(e) => set({ startsOn: e.target.value })} /></label>
        <label className="flex min-w-0 flex-col gap-1 text-sm font-bold">Hasta<DateInput value={t.endsOn} aria-invalid={overlap ? true : undefined} aria-describedby="cmp-dates" onChange={(e) => set({ endsOn: e.target.value })} /></label>
        <p id="cmp-dates" className="-mt-1 text-xs text-muted sm:col-span-2">
          Se repite todos los años en estas fechas (cuentan día y mes).{t.waitingRoom ? " Antes del inicio, la tienda muestra la sala de espera con la cuenta regresiva." : ""}
        </p>
        {overlap && <p role="alert" data-overlap className="text-sm font-semibold text-danger sm:col-span-2">{overlap}</p>}
      </div>
    </fieldset>
  );
}
