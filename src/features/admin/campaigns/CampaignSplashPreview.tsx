"use client";
import { useReducedMotion } from "motion/react";
import { Maximize2, RotateCcw } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Button } from "@/components/atoms/Button";
import { SplashStage } from "@/components/organisms/splash/SplashStage";
import { SPLASH_SCENES, SPLASH_TOTAL_MS } from "@/demo/engine/splash-scenes";
import type { SeasonalTheme } from "@/demo/types";
import { BASE_PATH } from "@/lib/base-path";
import { useAdmin } from "@/stores/admin";
import { splashMarks } from "@/features/splash/marks";
import { playSplash } from "@/features/splash/playSplash";

const seconds = (ms: number) => `${(ms / 1000).toLocaleString("es-AR", { maximumFractionDigits: 2 })} s`;

/**
 * Vista previa de la pantalla de carga de la campaña (R3c), con el borrador: el nombre y el descuento del cupón elegido.
 * Si la fecha ya tiene escena propia, se ve acá mismo (y "Repetir" la vuelve a pasar); "Pantalla completa" la muestra
 * como la ve el cliente al entrar, sobre el panel, sin recargar. Con "reducir movimiento" se ve el cuadro final quieto
 * y la pantalla completa no sale (igual que en la tienda).
 */
export function CampaignSplashPreview({ theme }: { theme: SeasonalTheme }) {
  const coupon = useAdmin((s) => s.data.coupons.find((c) => c.code === theme.couponCode)) ?? null;
  const reduce = useReducedMotion() === true;
  const [run, setRun] = useState(0);
  const date = { id: theme.id, name: theme.name, coupon };
  const marks = splashMarks(date, BASE_PATH);
  const scene = SPLASH_SCENES[theme.id];
  const total = marks.scene ? SPLASH_TOTAL_MS.scene : SPLASH_TOTAL_MS.campaign;
  return (
    <section aria-labelledby="splash-pv-title" data-splash-preview={theme.id} className="flex min-w-0 flex-col gap-3 rounded-sm bg-surface p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="splash-pv-title" className="text-sm font-bold">Pantalla de carga</h2>
        <span className="font-mono text-[11px] text-muted">{seconds(total)} · al entrar a la tienda</span>
      </div>
      <div className="relative overflow-hidden rounded-xs bg-night px-3 pb-3 pt-2">
        {marks.scene ? (
          <SplashStage key={run} scene={marks.scene} digits={marks.digits ?? undefined} style={marks.vars as CSSProperties} className="mx-auto max-w-[28rem]" />
        ) : (
          <p className="px-2 py-6 text-center text-sm text-night-muted">
            Por ahora sale la pantalla de campaña: la barra con los discos del color de la fecha y el marcador con el descuento.
          </p>
        )}
      </div>
      <p className="text-sm text-muted">
        <strong className="text-ink">{scene.status === "ready" ? "Escena: " : "Escena propia en preparación: "}</strong>{scene.mechanism}
      </p>
      <div className="flex flex-wrap gap-2">
        {marks.scene && !reduce && (
          <Button variant="secondary" size="sm" onClick={() => setRun((n) => n + 1)}><RotateCcw size={14} aria-hidden="true" />Repetir</Button>
        )}
        <Button variant="secondary" size="sm" disabled={reduce} onClick={() => playSplash(date)}><Maximize2 size={14} aria-hidden="true" />Pantalla completa</Button>
      </div>
      {reduce && <p className="text-xs text-muted">Tenés activado &ldquo;reducir movimiento&rdquo;: la pantalla de carga no se muestra y acá se ve su cuadro final.</p>}
    </section>
  );
}
