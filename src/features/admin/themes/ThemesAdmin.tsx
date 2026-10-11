"use client";
import { Eye, Pencil } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Switch } from "@/components/atoms/Switch";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { currentTheme, themeOffer } from "@/demo/engine/themes";
import type { SeasonId } from "@/demo/types";
import { formatDayRange } from "@/lib/date";
import { useAdmin } from "@/stores/admin";
import { reloadWithTheme } from "@/features/themes/reloadWithTheme";
import { skinOf } from "@/features/themes/skins";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useDemoSave } from "../useDemoSave";
import { ThemeEditor } from "./ThemeEditor";
import { ThemeMode } from "./ThemeMode";

/** Temáticas por fecha comercial: cuándo salen, qué oferta llevan y qué productos muestran. */
export function ThemesAdmin() {
  const themes = useAdmin((s) => s.data.themes);
  const saveTheme = useAdmin((s) => s.saveTheme);
  const save = useDemoSave();
  const [editing, setEditing] = useState<SeasonId | null>(null);
  const live = currentTheme(new Date(), null);
  // Abre la tienda con carga forzada: sale la pantalla de carga de esa temática.
  const preview = (id: SeasonId) => reloadWithTheme(id, "/");
  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Temáticas"
        intro="Halloween, Navidad, el Orgullo, las fechas patrias y el resto de las fechas comerciales: cada una con su banner, decoraciones, cupón y productos en oferta. Agregado pedido por Ignacio (fuera de la especificación)." />
      <ThemeMode />
      <ul aria-label="Temáticas por fecha" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,26rem),1fr))] gap-3">
        {themes.map((t) => {
          const skin = skinOf(t.id);
          const offer = themeOffer(t);
          return (
            <li key={t.id} className="flex gap-4 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <span aria-hidden="true" className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl" style={{ background: `linear-gradient(140deg, ${skin.from}, ${skin.to})` }}>
                <Decor kind={skin.decor[0]!} className="h-14 w-14" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[17px] font-bold">{t.name}</h2>
                  {live?.id === t.id && <Badge tone="success">En la tienda</Badge>}
                  {!t.active && <Badge tone="warning">Deshabilitada</Badge>}
                </div>
                <p className="text-sm text-muted">{formatDayRange(t.startsOn, t.endsOn)} · {offer ? `${offer.label} con ${offer.coupon.code}` : "Sin oferta activa"} · {t.productSlugs.length} productos</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Switch checked={t.active} onChange={(v) => save(v ? `${t.name} habilitada` : `${t.name} deshabilitada`, () => saveTheme({ ...t, active: v }))} label={t.active ? "Habilitada" : "Deshabilitada"} />
                  <span className="ml-auto flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => preview(t.id)} aria-label={`Ver ${t.name} en la tienda`}><Eye size={16} aria-hidden="true" />Ver</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditing(t.id)} aria-label={`Editar ${t.name}`}><Pencil size={15} aria-hidden="true" />Editar</Button>
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <ThemeEditor id={editing} onClose={() => setEditing(null)} />
    </>
  );
}
