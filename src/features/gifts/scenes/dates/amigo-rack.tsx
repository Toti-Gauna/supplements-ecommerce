import { Glow } from "@/components/illustrations/campaigns/b-stage";
import { FLOOR } from "../stage/types";

/** Rack de press de banca visto desde los pies del banco (coordenadas del escenario). Ilustración: colores literales. */
export const RACK = { left: 250, right: 550, top: 330, hook: 452, beam: 322 } as const;

/** Parante de acero: cara iluminada, canto en sombra, agujeros y la base. */
function Upright({ u, x, lit }: { u: string; x: number; lit: number }) {
  const holes = Array.from({ length: 14 }, (_, i) => `M${x - 3} ${RACK.top + 30 + i * 30}h6v8h-6z`).join("");
  return (
    <g>
      <rect x={x - 13} y={RACK.top} width="26" height={FLOOR - RACK.top} fill="#1c2128" />
      <rect x={x - 13} y={RACK.top} width="26" height={FLOOR - RACK.top} fill={`url(#${u}-steel)`} />
      <rect x={x - 13 + lit} y={RACK.top} width="3" height={FLOOR - RACK.top} fill="#fff" opacity=".28" />
      <path d={holes} fill="#05070a" />
      <rect x={x - 46} y={FLOOR - 8} width="92" height="12" rx="2" fill="#151a20" />
      <rect x={x - 46} y={FLOOR - 8} width="92" height="3" fill="#fff" opacity=".12" />
    </g>
  );
}

/** Gancho J delante del parante, a la altura del rack: la copa donde descansa la barra. */
function Hook({ x, on, accent }: { x: number; on: boolean; accent: string }) {
  const y = RACK.hook;
  return (
    <g>
      {on && <Glow cx={x} cy={y} rx={60} ry={40} color={accent} o={0.8} />}
      <path d={`M${x - 20} ${y - 4}v16q0 10 10 10h20q10 0 10-10v-22`} fill="none" stroke="#0c0f13" strokeWidth="9" strokeLinecap="round" />
      <path d={`M${x - 20} ${y - 4}v16q0 10 10 10h20q10 0 10-10v-22`} fill="none" stroke={on ? accent : "#9aa4b0"} strokeWidth="3" strokeLinecap="round" opacity=".9" />
    </g>
  );
}

/** Los dos parantes y el travesaño de arriba (con su tira LED, que se prende al dejar la barra en el rack). */
export function RackBack({ u, on, accent }: { u: string; on: boolean; accent: string }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${u}-steel`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".5" /><stop offset=".3" stopColor="#8b96a3" stopOpacity=".35" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#000" stopOpacity=".55" />
        </linearGradient>
      </defs>
      <Upright u={u} x={RACK.left} lit={18} />
      <Upright u={u} x={RACK.right} lit={4} />
      <rect x={RACK.left - 16} y={RACK.beam - 14} width={RACK.right - RACK.left + 32} height="26" fill="#1c2128" />
      <rect x={RACK.left - 16} y={RACK.beam - 14} width={RACK.right - RACK.left + 32} height="4" fill="#fff" opacity=".22" />
      <rect x={RACK.left} y={RACK.beam + 6} width={RACK.right - RACK.left} height="3" fill={accent} opacity={on ? 1 : 0.25} />
      {on && <Glow cx={400} cy={RACK.beam + 10} rx={220} ry={30} color={accent} o={0.55} />}
    </g>
  );
}

/** Los ganchos van delante de la barra que se apoya en ellos. */
export function RackHooks({ on, accent }: { on: boolean; accent: string }) {
  return <g><Hook x={RACK.left} on={on} accent={accent} /><Hook x={RACK.right} on={on} accent={accent} /></g>;
}

/** Banco plano visto desde los pies: la punta del tapizado, el poste y la pata en T. */
export function BenchEnd({ u }: { u: string }) {
  return (
    <g>
      <path d="M392 604h16v150h-16z" fill="#1d232a" />
      <path d="M326 748h148v12h-148z" fill="#1a1f25" />
      <path d="M326 748h148v3h-148z" fill="#fff" opacity=".12" />
      <path d="M368 590h64l8 54h-80z" fill="#0d0f12" />
      <path d="M360 644h80v14h-80z" fill="#16191e" />
      <path d="M360 644h80v14h-80z" fill={`url(#${u}-v)`} opacity=".8" />
    </g>
  );
}
