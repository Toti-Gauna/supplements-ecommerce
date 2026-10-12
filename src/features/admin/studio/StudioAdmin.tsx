"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCaption } from "@/demo/admin/studio/caption";
import { clampDuration } from "@/demo/admin/studio/timeline";
import { STUDIO_FORMATS, type StudioFormat } from "@/demo/fixtures/studio";
import { useToasts } from "@/stores/toast";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { useStudioAssets } from "./assets";
import { playJingle, type StudioMusic } from "./music";
import { assetRequest, buildScene } from "./scene";
import { StudioCaption } from "./StudioCaption";
import { StudioControls } from "./StudioControls";
import { StudioStage } from "./StudioStage";
import { useStudioPiece } from "./useStudioPiece";

/**
 * Estudio de contenido (Fase 7): piezas de Instagram con los potes animados de la tienda. Cuatro plantillas (oferta de
 * la fecha, producto destacado, stack del mes y cupón del juego) en post, historia y carrusel, en imagen o video.
 */
export function StudioAdmin() {
  const piece = useStudioPiece();
  const { template, themeId, theme, offer, products, stack, game, texts } = piece;
  const [format, setFormat] = useState<StudioFormat>("post");
  const [slide, setSlide] = useState(0);
  const [showPrice, setShowPrice] = useState(true);
  const [showOffer, setShowOffer] = useState(true);
  const [duration, setDuration] = useState(8);
  const [music, setMusic] = useState<StudioMusic>("pulso");
  const [variant, setVariant] = useState(0);
  const [photo, setPhoto] = useState<{ url: string; img: HTMLImageElement } | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const toast = useToasts((s) => s.push);

  const productsKey = JSON.stringify(products);
  const request = useMemo(() => assetRequest(themeId, products), [themeId, productsKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const { stage, assets, ready } = useStudioAssets(request);
  const hasOffer = template === "offer" && Boolean(offer);
  const input = { template, themeId, texts, products, offer, showPrice, showOffer: showOffer && hasOffer, stack, game, duration, photo: photo?.img ?? null };
  const sceneKey = JSON.stringify([template, texts, products, offer && { label: offer.label, code: offer.coupon.code, condition: offer.condition }, themeId, showPrice, showOffer, stack, game, duration]);
  // Las escenas se rearman solo cuando cambia algo que se dibuja (las vistas previas reinician su animación).
  const scenes = useMemo(() => Object.fromEntries(STUDIO_FORMATS.map((f) => [f.id, buildScene({ ...input, format: f.id }, assets)])) as Record<StudioFormat, ReturnType<typeof buildScene>>,
    [assets, sceneKey, photo]); // eslint-disable-line react-hooks/exhaustive-deps
  const caption = buildCaption({ template, theme, offer, products, format, variant, showPrice, showOffer: showOffer && hasOffer, stack: stack ?? undefined, game: game ?? undefined });

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
        intro="Piezas para Instagram con los potes de la tienda animados: elegí la plantilla y la fecha, ajustá productos y textos, y exportá el post, la historia o el carrusel como imagen o video." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <StudioControls piece={piece} photoUrl={photo?.url ?? null} onPhoto={onPhoto}
          showPrice={showPrice} onShowPrice={setShowPrice} showOffer={showOffer} onShowOffer={setShowOffer} hasOffer={hasOffer}
          duration={duration} onDuration={(s) => setDuration(clampDuration(s))} music={music} onMusic={setMusic} onListen={listen} />
        {/* En el celular las plantillas van primero; los controles, debajo. */}
        <div className="order-first flex min-w-0 flex-col gap-6 lg:order-none">
          <StudioStage scenes={scenes} format={format} onFormat={(f) => { setFormat(f); setSlide(0); }} slide={slide} onSlide={setSlide} themeId={themeId} template={template} music={music} ready={ready} />
          <StudioCaption text={caption.text} hookName={caption.hook.name} onAnother={() => setVariant((v) => v + 1)} />
        </div>
      </div>
      {stage}
    </>
  );
}
