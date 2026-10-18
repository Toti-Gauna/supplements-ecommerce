"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Pencil } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { upcomingCampaign } from "@/demo/admin/campaign-calendar";
import { CAMPAIGN_PIECES, pieceFileName, type PieceKind } from "@/demo/admin/studio/campaign-pieces";
import { demoNow } from "@/demo/clock";
import { themeOffer } from "@/demo/engine/themes";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import type { SeasonId } from "@/demo/types";
import { useAdmin, useDemoVersion } from "@/stores/admin";
import { skinOf } from "@/features/themes/skins";
import { SubpageHeader } from "../../marketing/SubpageHeader";
import { saveBlob, toPng } from "../../studio/export";
import { CAMPAIGNS, editorHref, piecesHref } from "../links";
import { PieceCard } from "./PieceCard";
import { useCampaignArt } from "./useCampaignArt";

/**
 * "Sacar las piezas" (R3): para una campaña, el Estudio arma el post 1:1, la historia 9:16 con la cuenta regresiva y la
 * gift card de la fecha, todas con su key visual. Se dibujan en este navegador y se bajan como PNG.
 */
export function CampaignPieces() {
  const router = useRouter();
  const themes = useAdmin((s) => s.data.themes);
  useDemoVersion();
  const asked = useSearchParams().get("id");
  const theme = themes.find((t) => t.id === asked) ?? upcomingCampaign(themes, DEMO_TODAY)?.theme ?? themes[0]!;
  const { stage, art, ready } = useCampaignArt(theme.id);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const canvases = useRef<Partial<Record<PieceKind, HTMLCanvasElement>>>({});
  const registers = useRef<Partial<Record<PieceKind, (c: HTMLCanvasElement | null) => void>>>({});
  const register = useCallback((kind: PieceKind) => (registers.current[kind] ??= (c) => { if (c) canvases.current[kind] = c; else delete canvases.current[kind]; }), []);
  const input = { theme, offer: themeOffer(theme), skin: skinOf(theme.id), art, now: demoNow() };

  const download = async (kinds: PieceKind[]) => {
    setBusy(true);
    setStatus("");
    try {
      const names: string[] = [];
      for (const [i, kind] of kinds.entries()) {
        const c = canvases.current[kind];
        if (!c) continue;
        const name = pieceFileName(theme.id, kind);
        saveBlob(await toPng(c), name);
        names.push(name);
        if (i < kinds.length - 1) await new Promise((r) => setTimeout(r, 450));
      }
      setStatus(`${names.length === 1 ? "Imagen lista" : "Imágenes listas"}: ${names.join(", ")}`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "No se pudo generar la imagen.");
    } finally { setBusy(false); }
  };

  return (
    <>
      <SubpageHeader back={CAMPAIGNS} title="Sacar las piezas"
        intro="Post para el feed, historia con la cuenta regresiva y la gift card de la fecha, con el key visual de la campaña. Se arman en este navegador: nada sale de tu equipo."
        actions={<ButtonLink href={editorHref(theme.id)} variant="secondary"><Pencil size={16} aria-hidden="true" />Editar {theme.name}</ButtonLink>} />
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 basis-64 flex-col gap-1 text-sm font-bold sm:max-w-sm">Campaña
          <Select value={theme.id} onChange={(e) => router.replace(piecesHref(e.target.value as SeasonId))}>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}{t.sport ? " (día del deporte)" : ""}</option>)}
          </Select>
        </label>
        <Button variant="dark" onClick={() => void download(CAMPAIGN_PIECES.map((p) => p.id))} disabled={!ready || busy}><Download size={17} aria-hidden="true" />Descargar las 3</Button>
      </div>
      <p role="status" aria-live="polite" className="mb-3 min-h-5 text-sm font-semibold text-muted">{!ready ? "Preparando el key visual…" : status}</p>
      <ul aria-label={`Piezas de ${theme.name}`} className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {CAMPAIGN_PIECES.map((spec) => (
          <PieceCard key={spec.id} spec={spec} input={input} ready={ready} busy={busy} onDownload={() => void download([spec.id])} register={register(spec.id)} />
        ))}
      </ul>
      {stage}
    </>
  );
}
