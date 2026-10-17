"use client";
import { Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { sharePng } from "@/lib/share-png";
import { useToasts } from "@/stores/toast";
import { renderScoreCard, type ScoreCardData } from "./scoreCard";

/**
 * "Compartir puntaje": arma la tarjeta 9:16 en el navegador y abre la hoja de compartir del sistema; si no acepta
 * archivos, descarga el PNG. Mientras se dibuja, el botón avisa y no se puede apretar dos veces.
 */
export function ShareScore({ data }: { data: Omit<ScoreCardData, "when"> }) {
  const [busy, setBusy] = useState(false);
  const toast = useToasts((s) => s.push);
  const share = async () => {
    setBusy(true);
    try {
      const blob = await renderScoreCard({ ...data, when: new Date().toLocaleDateString("es-AR") });
      const result = await sharePng(blob, `shaker-rush-${data.score}.png`, "Mi puntaje en Shaker Rush");
      if (result === "downloaded") toast({ tone: "success", title: "Tarjeta descargada", description: "Subila a tus historias." });
    } catch {
      toast({ tone: "error", title: "No pudimos armar la tarjeta", description: "Probá de nuevo." });
    } finally {
      setBusy(false);
    }
  };
  return (
    <Button variant="dark" onClick={share} disabled={busy} aria-busy={busy}>
      <Share2 size={17} aria-hidden="true" />{busy ? "Armando la tarjeta…" : "Compartir puntaje"}
    </Button>
  );
}
