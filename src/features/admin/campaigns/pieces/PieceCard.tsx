"use client";
import { Download } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/atoms/Button";
import type { PieceSpec } from "@/demo/admin/studio/campaign-pieces";
import { cn } from "@/lib/cn";
import { drawPiece, type PieceInput } from "./draw";

interface Props {
  spec: PieceSpec;
  input: PieceInput;
  ready: boolean;
  busy: boolean;
  onDownload: (canvas: HTMLCanvasElement) => void;
  /** El canvas de la pieza, para "Descargar las tres". */
  register: (canvas: HTMLCanvasElement | null) => void;
}

/** Una pieza dibujada a tamaño real (1080 px) y mostrada en chico, con su botón de descarga en PNG. */
export function PieceCard({ spec, input, ready, busy, onDownload, register }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const key = JSON.stringify([input.theme, input.offer?.label, input.offer?.coupon.code, input.offer?.condition, input.now.slice(0, 16), ready]);
  useEffect(() => {
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (ctx) drawPiece(ctx, spec.id, spec.W, spec.H, input);
    // `key` resume lo que se dibuja; el arte cambia junto con `ready`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, input.art, spec.id]);
  useEffect(() => { register(canvas.current); return () => register(null); }, [register]);
  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)]" data-piece={spec.id}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-bold">{spec.name}</h2>
        <span className="font-mono text-xs font-bold text-muted">{spec.ratio} · {spec.W}×{spec.H}</span>
      </div>
      <div className={cn("grid place-items-center rounded-xs bg-bg p-2", spec.id === "story" ? "min-h-0" : "")}>
        <canvas ref={canvas} width={spec.W} height={spec.H} role="img" aria-label={`${spec.name} de ${input.theme.name}: ${input.theme.headline}`}
          className={cn("block h-auto max-w-full rounded-xs shadow-[var(--shadow-card)]", spec.id === "story" ? "max-h-[28rem] w-auto" : "w-full")} />
      </div>
      <Button onClick={() => canvas.current && onDownload(canvas.current)} disabled={!ready || busy} className="self-start">
        <Download size={17} aria-hidden="true" />Descargar {spec.id === "giftcard" ? "gift card" : spec.name.split(" ")[0]!.toLowerCase()} (PNG)
      </Button>
    </li>
  );
}
