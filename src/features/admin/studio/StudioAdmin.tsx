"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCaption } from "@/demo/admin/studio/caption";
import { studioOffer, studioProducts, studioTexts, suggestedProducts, MAX_STUDIO_PRODUCTS } from "@/demo/admin/studio/content";
import { clampDuration } from "@/demo/admin/studio/timeline";
import { currentTheme } from "@/demo/engine/themes";
import { STUDIO_FORMATS, type StudioFormat } from "@/demo/fixtures/studio";
import type { SeasonId } from "@/demo/types";
import { useDemoData } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useStudioAssets } from "./assets";
import { playJingle, type StudioMusic } from "./music";
import { assetRequest, buildScene } from "./scene";
import { StudioCaption } from "./StudioCaption";
import { StudioControls } from "./StudioControls";
import { StudioStage } from "./StudioStage";

/** Estudio de contenido (Fase 6, pedido de Ignacio, fuera de la especificación): piezas para Instagram por fecha. */
export function StudioAdmin() {
  const themes = useDemoData((d) => d.themes);
  const catalog = useDemoData((d) => d.products).filter((p) => p.active !== false);
  const [themeId, setThemeId] = useState<SeasonId | null>(() => currentTheme(new Date(), null)?.id ?? null);
  const theme = themes.find((t) => t.id === themeId) ?? null;
  const offer = studioOffer(theme);
  const [selected, setSelected] = useState<string[]>(() => suggestedProducts(theme));
  const [texts, setTexts] = useState(() => studioTexts(theme));
  // Al cambiar de fecha vuelven los textos y productos de esa temática.
  const [seen, setSeen] = useState(themeId);
  if (seen !== themeId) { setSeen(themeId); setSelected(suggestedProducts(theme)); setTexts(studioTexts(theme)); }
  const [format, setFormat] = useState<StudioFormat>("post");
  const [slide, setSlide] = useState(0);
  const [showPrice, setShowPrice] = useState(true);
  const [showOffer, setShowOffer] = useState(true);
  const [duration, setDuration] = useState(8);
  const [music, setMusic] = useState<StudioMusic>("calida");
  const [variant, setVariant] = useState(0);
  const [photo, setPhoto] = useState<{ url: string; img: HTMLImageElement } | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const toast = useToasts((s) => s.push);

  const products = studioProducts(selected, offer);
  const productsKey = JSON.stringify(products);
  const request = useMemo(() => assetRequest(themeId, products), [themeId, productsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { stage, assets, ready } = useStudioAssets(request);
  const offerKey = JSON.stringify(offer && { label: offer.label, code: offer.coupon.code, condition: offer.condition });
  const input = { themeId, texts, products, offer, showPrice, showOffer: showOffer && Boolean(offer), duration, photo: photo?.img ?? null };
  const textsKey = JSON.stringify(texts);
  // Las escenas se rearman solo cuando cambia algo que se dibuja (las vistas previas reinician su animación).
  const scenes = useMemo(() => Object.fromEntries(STUDIO_FORMATS.map((f) => [f.id, buildScene({ ...input, format: f.id }, assets)])) as Record<StudioFormat, ReturnType<typeof buildScene>>,
    [assets, textsKey, productsKey, offerKey, themeId, showPrice, showOffer, duration, photo]); // eslint-disable-line react-hooks/exhaustive-deps
  const caption = buildCaption({ theme, offer, products, format, variant, showPrice, showOffer });

  const toggle = (slug: string) => setSelected((s) => (s.includes(slug) ? s.filter((x) => x !== slug) : s.length < MAX_STUDIO_PRODUCTS ? [...s, slug] : s));
  // La foto vive solo en este navegador (blob); se libera al cambiarla, quitarla o salir.
  const photoUrl = useRef<string | null>(null);
  const pick = useRef(0);
  useEffect(() => () => { if (photoUrl.current) URL.revokeObjectURL(photoUrl.current); void audio.current?.close(); }, []);
  const onPhoto = (file: File | null) => {
    const token = ++pick.current;
    if (photoUrl.current) URL.revokeObjectURL(photoUrl.current);
    photoUrl.current = null;
    setPhoto(null);
    if (!file) return;
    const url = URL.createObjectURL(file);
    photoUrl.current = url;
    const img = new Image();
    img.onload = () => { if (token === pick.current) setPhoto({ url, img }); };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      if (photoUrl.current === url) photoUrl.current = null;
      if (token === pick.current) toast({ tone: "error", title: "No se pudo abrir la foto", description: "Probá con una foto JPG o PNG." });
    };
    img.src = url;
  };
  const listen = () => {
    if (music === "none") return;
    void audio.current?.close();
    const ac = new AudioContext();
    audio.current = ac;
    playJingle(ac, ac.destination, music, duration);
    window.setTimeout(() => { if (audio.current === ac) { void ac.close(); audio.current = null; } }, (duration + 1) * 1000);
  };

  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Estudio de contenido"
        intro="Elegí la fecha y salen tres piezas para Instagram con su fondo animado, tus productos y la oferta: post, historia o reel y carrusel. Se exportan como imagen o video. Agregado pedido por Ignacio (fuera de la especificación)." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <StudioControls themes={themes} themeId={themeId} onTheme={setThemeId} catalog={catalog} selected={selected} onToggleProduct={toggle}
          photoUrl={photo?.url ?? null} onPhoto={onPhoto} texts={texts} onTexts={setTexts} onResetTexts={() => setTexts(studioTexts(theme))}
          showPrice={showPrice} onShowPrice={setShowPrice} showOffer={showOffer} onShowOffer={setShowOffer} hasOffer={Boolean(offer)}
          duration={duration} onDuration={(s) => setDuration(clampDuration(s))} music={music} onMusic={setMusic} onListen={listen} />
        {/* En el celular las plantillas van primero; los controles, debajo. */}
        <div className="order-first flex min-w-0 flex-col gap-6 lg:order-none">
          <StudioStage scenes={scenes} format={format} onFormat={(f) => { setFormat(f); setSlide(0); }} slide={slide} onSlide={setSlide} themeId={themeId} music={music} ready={ready} />
          <StudioCaption text={caption.text} hookName={caption.hook.name} onAnother={() => setVariant((v) => v + 1)} />
        </div>
      </div>
      {stage}
    </>
  );
}
