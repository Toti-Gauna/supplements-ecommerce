"use client";
import { LOCKER, selectOpening } from "@/demo/engine/gift-opening";
import { occasionColors } from "../occasion";
import { OPENING_ARTS } from "./dates";
import { OriginalBag } from "./dates/original";
import { LockerArt } from "./locker/LockerArt";
import { OpeningStage } from "./stage/OpeningStage";
import type { GiftSceneProps } from "./types";

/**
 * La apertura vista desde afuera (vista previa de quien regala, Mis regalos): el escenario de la fecha quieto, en el
 * estado de `hits`, o el locker cerrado. Sin interacción ni cámara.
 */
export default function ScenePreview({ occasion, hits, total, opened, reduce, opening }: GiftSceneProps) {
  const o = occasionColors(occasion);
  const c = { from: o.from, to: o.to, accent: o.accent };
  const pick = selectOpening({ occasion, opening });
  const phase = opened ? "open" : hits > 0 ? "hit" : "idle";
  const data = { "data-variant": occasion, "data-opening": pick.kind, "data-hits": String(hits), "data-open": opened ? "true" : "false" };
  if (pick.kind === "locker") {
    return (
      <OpeningStage scene="locker" meta={LOCKER} c={c} hits={0} phase={opened ? "open" : "idle"} reduce data={data}
        draw={(u) => <LockerArt u={u} c={c} digits="" status={opened ? "open" : "idle"} misses={0} swing={opened ? 1 : 0} />} />
    );
  }
  const html = pick.scene === "original" ? <OriginalBag occasion={occasion} hits={hits} total={total} opened={opened} reduce={reduce} /> : undefined;
  return <OpeningStage scene={pick.scene} meta={pick.meta} c={c} Art={OPENING_ARTS[pick.scene]} html={html} hits={Math.min(hits, pick.meta.steps)} phase={phase} reduce={reduce} data={data} />;
}
