"use client";
import type Konva from "konva";
import { useEffect, useState, type RefObject } from "react";
import { Group, Image as KonvaImage, Layer, Rect, Stage, Text } from "react-konva";
import type { PhotoMask } from "@/demo/types";

export interface PhotoStageProps {
  mask: PhotoMask;
  imageUrl: string;
  zoom: number;
  offset: { x: number; y: number };
  onOffsetChange: (o: { x: number; y: number }) => void;
  width: number;
  stageRef: RefObject<Konva.Stage | null>;
}

function useHtmlImage(url: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const el = new window.Image();
    el.onload = () => setImg(el);
    el.src = url;
    return () => {
      el.onload = null;
    };
  }, [url]);
  return img;
}

/** Vista previa del velador: la foto recortada por la silueta en arco (máscara del producto). */
export default function PhotoStage({ mask, imageUrl, zoom, offset, onOffsetChange, width, stageRef }: PhotoStageProps) {
  const img = useHtmlImage(imageUrl);
  const W = width;
  const H = Math.round(width * 1.15);
  const panel = { x: W * 0.18, y: H * 0.08, w: W * 0.64, h: H * 0.7 };
  const r = panel.w / 2;
  const center = { x: panel.x + panel.w / 2, y: panel.y + panel.h / 2 };
  const clip = (ctx: Konva.Context) => {
    ctx.beginPath();
    if (mask === "circle") {
      ctx.arc(center.x, center.y, Math.min(panel.w, panel.h) / 2, 0, Math.PI * 2, false);
    } else if (mask === "rounded") {
      const k = 24;
      ctx.moveTo(panel.x + k, panel.y);
      ctx.arcTo(panel.x + panel.w, panel.y, panel.x + panel.w, panel.y + panel.h, k);
      ctx.arcTo(panel.x + panel.w, panel.y + panel.h, panel.x, panel.y + panel.h, k);
      ctx.arcTo(panel.x, panel.y + panel.h, panel.x, panel.y, k);
      ctx.arcTo(panel.x, panel.y, panel.x + panel.w, panel.y, k);
    } else {
      ctx.moveTo(panel.x, panel.y + panel.h);
      ctx.lineTo(panel.x, panel.y + r);
      ctx.arc(panel.x + r, panel.y + r, r, Math.PI, 0, false);
      ctx.lineTo(panel.x + panel.w, panel.y + panel.h);
    }
    ctx.closePath();
  };
  const scale = img ? Math.max(panel.w / img.width, panel.h / img.height) * zoom : 1;
  const iw = (img?.width ?? 0) * scale;
  const ih = (img?.height ?? 0) * scale;
  return (
    <Stage ref={stageRef} width={W} height={H} className="touch-none">
      <Layer>
        <Rect width={W} height={H} fill="#f3ead9" />
        <Group clipFunc={clip}>
          <Rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} fill="#fff7e2" />
          {img && (
            <KonvaImage
              image={img}
              width={iw}
              height={ih}
              x={center.x + offset.x - iw / 2}
              y={center.y + offset.y - ih / 2}
              draggable
              onDragMove={(e) => onOffsetChange({ x: e.target.x() + iw / 2 - center.x, y: e.target.y() + ih / 2 - center.y })}
            />
          )}
          <Rect x={panel.x} y={panel.y} width={panel.w} height={panel.h} fill="#ffe9a8" opacity={0.12} listening={false} />
        </Group>
        <Rect x={W * 0.12} y={panel.y + panel.h} width={W * 0.76} height={H * 0.1} fill="#c9a77a" cornerRadius={8} listening={false} />
        <Text x={0} y={H - 24} width={W} align="center" text="Vista previa ilustrativa" fontSize={12} fill="#5b5e4f" listening={false} />
      </Layer>
    </Stage>
  );
}
