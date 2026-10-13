"use client";
import { useState } from "react";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { checkHeroFeature, checkHeroList, isHeroList, newHeroFeature, newHeroId } from "@/demo/admin/content-hero";
import type { HeroFeature } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { moveItem } from "../ListControls";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { useSessionDraft } from "../useSessionDraft";
import { CONTENT_SECTION } from "./ContentHub";
import { HeroFeatureForm } from "./HeroFeatureForm";
import { HeroFeatureList } from "./HeroFeatureList";
import { HeroPreview } from "./HeroPreview";

/**
 * Hero del inicio (R1, reemplaza al carrusel): el producto estrella y hasta tres destacados más, cada uno con su
 * titular. Vista previa arriba con el destacado elegido, lista compacta y el editor de uno por vez. Elegir → editar →
 * ver → guardar. Si hay una campaña puesta, la tienda la muestra antes que estos destacados.
 */
export function HeroEditor() {
  const saved = useAdmin((s) => s.data.content.hero);
  const products = useAdmin((s) => s.data.products);
  const saveHero = useAdmin((s) => s.saveHero);
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<HeroFeature[]>("volta-ui:content-draft:hero", saved, isHeroList);
  const list = session.draft;
  const [selId, setSelId] = useState(list[0]?.id);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [listErrors, setListErrors] = useState<string[]>([]);
  const index = Math.max(0, list.findIndex((f) => f.id === selId));
  const feature = list[index]!;
  const change = (next: HeroFeature[]) => { session.setDraft(next); setErrors({}); setListErrors([]); };
  const patch = (p: Partial<HeroFeature>) => change(list.map((f, k) => (k === index ? { ...f, ...p } : f)));
  const add = () => {
    const used = new Set(list.map((f) => f.productSlug));
    const f = newHeroFeature(newHeroId(), (products.find((p) => p.active !== false && !used.has(p.slug)) ?? products[0]!).slug);
    change([...list, f]);
    setSelId(f.id);
  };
  const remove = () => { const next = list.filter((_, k) => k !== index); change(next); setSelId(next[Math.min(index, next.length - 1)]?.id); };
  const submit = () => {
    const found = Object.fromEntries(list.map((f) => [f.id, checkHeroFeature(f, products)] as const).filter(([, e]) => e.length));
    const whole = checkHeroList(list);
    setErrors(found);
    setListErrors(whole);
    const bad = list.find((f) => found[f.id]);
    if (bad) setSelId(bad.id);
    if (bad || whole.length) return;
    saveHero(list.map((f) => ({ ...f, headline: f.headline.trim(), pitch: f.pitch.trim() })));
    push({ tone: "success", title: "Hero guardado", description: "Ya se ve en el inicio de la tienda de este navegador (solo en esta demo).", action: { label: "Ver el inicio", href: "/" } });
  };
  const visible = feature.active !== false;
  const caption = `Destacado ${index + 1} de ${list.length}${index === 0 ? " · el que se ve primero" : ""}${visible ? "" : " · oculto: no sale en la tienda"}${session.dirty ? " · borrador sin publicar hasta guardar" : ""}`;
  return (
    <div>
      <SubpageHeader trail={[MARKETING, CONTENT_SECTION]} back={CONTENT_SECTION} title="Hero del inicio"
        intro="El primer pantallazo de la tienda: el producto en el rack con su titular y el marcador de datos. El primero es el producto estrella; los demás se eligen como en un marcador (no rotan solos). Si hay una campaña puesta, va antes." />
      {session.restored && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-sm bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
          <p className="flex-1 font-bold text-warning">Recuperamos los cambios del hero que quedaron sin guardar.</p>
          <ConfirmButton size="sm" variant="secondary" title="Descartar los cambios del hero" confirmLabel="Descartar" description="El hero vuelve a como está guardado." onConfirm={() => session.reset()}>Descartar cambios</ConfirmButton>
        </div>
      )}
      {listErrors.length > 0 && <p role="alert" className="mb-4 rounded-sm bg-danger-soft p-3 text-sm font-semibold text-danger">{listErrors.join(" ")}</p>}
      <HeroPreview feature={feature} caption={caption} />
      <div className="@container mt-6">
        <div className="grid gap-6 @min-[56rem]:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <HeroFeatureList features={list} products={products} selected={index} withErrors={new Set(Object.keys(errors))} onSelect={setSelId} onAdd={add} />
          <HeroFeatureForm feature={feature} index={index} total={list.length} products={products} errors={errors[feature.id] ?? []} onChange={patch} onMove={(d) => change(moveItem(list, index, d))} onRemove={remove} />
        </div>
      </div>
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar hero" discardText="El hero vuelve a como está guardado; se pierden los cambios de todos los destacados." onDiscard={() => { session.reset(); setErrors({}); setListErrors([]); }} />
    </div>
  );
}
