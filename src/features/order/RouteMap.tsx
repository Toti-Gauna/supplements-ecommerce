"use client";
import { motion, useReducedMotion } from "motion/react";
import { Check, Home, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { cn } from "@/lib/cn";
import type { Traveler } from "./tracking/Travelers";
import { brand } from "@/config/brand";

const PATH = "M40 150 C 120 40, 210 190, 300 100 S 470 30, 560 90";
const W = 600, H = 190;
const EASE = [0.16, 1, 0.3, 1] as const;

interface Props {
  /** Avance del pedido entre el local y tu casa (0 a 1). */
  progress: number;
  /** Quién lo lleva según la temática; sin temática, el punto dorado de siempre. */
  traveler?: Traveler | null;
  accent?: string;
  /** Entregado: el viajero llega y estalla la decoración de la temática junto a tu casa. */
  delivered?: boolean;
}

/** Ruta ilustrada del local a tu casa: la línea avanza según la etapa. Sin mapas externos. */
export function RouteMap({ progress, traveler, accent = brand.signature.volt, delivered = false }: Props) {
  const ref = useRef<SVGPathElement>(null);
  const [dot, setDot] = useState({ x: 40, y: 150 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const p = el.getPointAtLength(el.getTotalLength() * progress);
    setDot({ x: p.x, y: p.y });
  }, [progress]);
  // Con movimiento reducido todo queda en su lugar al instante: sin recorrido animado ni estallido.
  const reduce = useReducedMotion() ?? false;
  const move = reduce ? { duration: 0 } : { duration: 1.6, ease: EASE };
  const who = traveler ? `${traveler.label} lleva el pedido: ` : "";
  return (
    <div className="relative overflow-hidden rounded-sm bg-night-2" role="img"
      aria-label={`${who}${delivered ? "llegó a tu casa" : `${Math.round(progress * 100)}% del camino entre el local y tu casa`} (ilustrativo)`}>
      {/* Margen arriba: el viajero de la temática (con su gorro) se dibuja por encima del recorrido y no se corta. */}
      <div className={cn("relative", traveler && "mt-5 sm:mt-6")}>
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden="true">
          <defs><pattern id="route-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#fff" strokeOpacity=".05" /></pattern></defs>
          <rect width={W} height={H} fill="url(#route-grid)" />
          <path d={PATH} fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" />
          <motion.path ref={ref} d={PATH} fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: progress }} transition={move} />
          {!traveler && (
            <>
              <motion.circle r="9" fill={accent} initial={false} animate={{ cx: dot.x, cy: dot.y }} transition={move} />
              <motion.circle r="9" fill="none" stroke={accent} initial={{ r: 9, opacity: 0.8 }} animate={{ cx: dot.x, cy: dot.y, r: 22, opacity: 0 }} transition={{ duration: reduce ? 0 : 1.6, delay: reduce ? 0 : 1.2 }} />
            </>
          )}
        </svg>
        {traveler && (
          <motion.span aria-hidden="true" data-trk-traveler={traveler.label} className="pointer-events-none absolute -translate-x-1/2 -translate-y-[76%]" initial={false}
            animate={{ left: `${(dot.x / W) * 100}%`, top: `${(dot.y / H) * 100}%` }} transition={move}>
            {/* Se mece mientras viaja (unas vueltas, sin animación permanente) y se queda quieto al llegar. */}
            <span key={progress} className={cn("trk-body block h-[clamp(2.6rem,8vw,4rem)] w-[clamp(3.6rem,11vw,5.6rem)]", `trk-${traveler.motion}`)}>{traveler.node}</span>
          </motion.span>
        )}
        {delivered && !reduce && (
          <span aria-hidden="true" data-trk-burst className="pointer-events-none absolute" style={{ left: `${(560 / W) * 100}%`, top: `${(90 / H) * 100}%` }}>
            {Array.from({ length: 8 }, (_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const kind = traveler?.burst[i % traveler.burst.length];
              return (
                <motion.span key={i} className="absolute -ml-2.5 -mt-2.5 block h-5 w-5" initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{ x: Math.cos(a) * 46, y: Math.sin(a) * 34, opacity: [0, 1, 0], scale: 1 }} transition={{ duration: 1.3, delay: 1.5 + i * 0.03, ease: EASE }}>
                  {kind ? <Decor kind={kind} className="h-full w-full" /> : <span className="block h-2.5 w-2.5 rounded-sm" style={{ background: accent }} />}
                </motion.span>
              );
            })}
          </span>
        )}
      </div>
      {/* En el celular los rótulos van en una fila debajo del recorrido, para no tapar la salida ni al viajero. */}
      <div className="flex justify-between gap-2 px-3 pb-3 sm:contents">
        <span className="flex items-center gap-1.5 rounded-sm bg-white/10 px-3 py-1.5 text-xs font-bold text-on-night sm:absolute sm:bottom-3 sm:left-3"><Store size={14} aria-hidden="true" /> Local {brand.name} · {brand.city}</span>
        <span className={cn("flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-bold transition-colors duration-500 sm:absolute sm:right-3 sm:top-3", delivered ? "bg-on-night text-night" : "bg-white/10 text-on-night")}>
          {delivered ? <Check size={14} aria-hidden="true" /> : <Home size={14} aria-hidden="true" />} {delivered ? "Llegó a tu casa" : "Tu casa"}
        </span>
      </div>
    </div>
  );
}
