import type { GameItemKind } from "@/demo/fixtures/game";
import { cn } from "@/lib/cn";
import styles from "../game.module.css";
import { Layers, ShakerArt } from "./GameGlyph";
import { ART, SPRITES } from "./sprites";

const ITEMS: { kind: GameItemKind; x: number; y: number; s: number; r: number }[] = [
  { kind: "bolt", x: 182, y: 34, s: 1.05, r: 8 },
  { kind: "capsule", x: 58, y: 70, s: 1, r: -24 },
  { kind: "golden", x: 196, y: 104, s: 0.9, r: 10 },
  { kind: "donut", x: 36, y: 142, s: 0.85, r: 0 },
];

/**
 * Escena quieta de Shaker Rush (inicio del juego y tarjeta del Club): el shaker con el batido, lo que cae alrededor y
 * un scoop que entra al vaso. Con `animate`, el scoop cae tres veces y queda adentro (sin bucles); con "reducir
 * movimiento", todo quieto.
 */
export function GameScene({ animate = false, level = 0.45, className }: { animate?: boolean; level?: number; className?: string }) {
  return (
    <svg viewBox="0 0 240 220" aria-hidden="true" className={cn("h-auto w-full", className)}>
      <ellipse cx="120" cy="204" rx="96" ry="15" fill={ART.plasma} opacity=".14" />
      <ellipse cx="120" cy="204" rx="54" ry="8" fill={ART.volt} opacity=".16" />
      <path d="M24 206H216" stroke="#eef1f5" strokeOpacity=".12" />
      {ITEMS.map((it) => (
        <g key={it.kind} transform={`translate(${it.x} ${it.y}) rotate(${it.r}) scale(${it.s})`}>
          <g className={animate ? styles.settle : undefined}><Layers layers={SPRITES[it.kind]} /></g>
        </g>
      ))}
      <g transform="translate(120 52)">
        <g className={animate ? styles.drop : undefined}><g transform="scale(1.1)"><Layers layers={SPRITES.scoop} /></g></g>
      </g>
      <text x="120" y="104" textAnchor="middle" className={animate ? styles.pop : styles.hidden} fill={ART.volt} fontSize="15" fontWeight="800" style={{ fontFamily: "'Archivo Variable','Arial Black',sans-serif" }}>+10</text>
      <g transform="translate(120 124) scale(.95)"><ShakerArt level={level} /></g>
    </svg>
  );
}
