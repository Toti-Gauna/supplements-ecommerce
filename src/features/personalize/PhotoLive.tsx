"use client";
import type Konva from "konva";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Skeleton } from "@/components/atoms/Skeleton";
import type { PhotoMask } from "@/demo/types";
import type { PhotoDraft } from "./PhotoControls";

const PhotoStage = dynamic(() => import("@/components/organisms/PhotoStage"), {
  ssr: false,
  loading: () => <Skeleton className="aspect-[1/1.15] h-full" />,
});

interface Props { mask: PhotoMask; draft: PhotoDraft & { url: string }; onChange: (d: PhotoDraft) => void; stageRef: RefObject<Konva.Stage | null> }

/** Lienzo de la foto dentro del marco cuadrado de la galería (el lienzo es 1 : 1,15). */
export function PhotoLive({ mask, draft, onChange, stageRef }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(300);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => entry && setWidth(Math.round(Math.min(entry.contentRect.width, entry.contentRect.height / 1.15))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="grid h-full w-full place-items-center">
      <PhotoStage mask={mask} imageUrl={draft.url} zoom={draft.zoom} offset={draft.offset} onOffsetChange={(offset) => onChange({ ...draft, offset })} width={width} stageRef={stageRef} />
    </div>
  );
}
