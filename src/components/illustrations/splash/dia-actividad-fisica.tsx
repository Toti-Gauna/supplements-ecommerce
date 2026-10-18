import { PropDefs } from "../campaigns/props";
import { Dust } from "../campaigns/stage";
import { Glow, Layer, LedBox, SW, SH, VGrad, Vignette, ids } from "./kit";

const VOLT = "#c8ff2e";
const DAWN = "#f4ffb0";
const HORIZON = 262;
/** Contador de pasos al costado de la pista: el vidrio lleva el descuento (dia-actividad-fisica.css). */
export const AF_LED = { x: 512, y: 84, w: 182, h: 70 };
/** Barra de pasos (diez celdas): el CSS recorta la tapa a este rectángulo y la corre de a una celda. */
export const AF_BAR = { x: 513, y: 178, w: 180, h: 26 };
/** Talón de la zapatilla apoyada (el CSS la hace girar desde acá): 258,476 de 800 × 600. */
const HEEL = { x: 258, y: 476 };
/** La línea de largada, en perspectiva: de lejos (arriba) a cerca (abajo). */
const LINE = `M452 ${HORIZON}h7L532 ${SH}H500Z`;
const cells = (fill: string, o = 1) => Array.from({ length: 10 }, (_, i) => <rect key={i} x={AF_BAR.x + i * 18 + 2} y={AF_BAR.y + 3} width="14" height={AF_BAR.h - 6} rx="2" fill={fill} opacity={o} />);

/** 1 · La pista al amanecer: arboleda en silueta, carriles, la línea de largada y el contador de pasos apagado. */
function Track() {
  const lanes = [276, 296, 326, 370, 432, 520].map((y) => `M0 ${y}H${SW}`).join("");
  return (
    <Layer>
      <defs>
        <VGrad id="sky" stops={[[0, "#02100b"], [0.5, "#062a1f"], [0.85, "#0f6b4a"], [1, "#6fc27a"]]} />
        <VGrad id="track" stops={[[0, "#173b2f"], [0.35, "#0d2a20"], [1, "#030d09"]]} />
        <VGrad id="house" stops={[[0, "#2a2f37"], [0.5, "#14171c"], [1, "#0b0d10"]]} />
      </defs>
      <PropDefs ids={ids} />
      <rect width={SW} height={SH} fill="url(#sky)" />
      <Glow id="sun" cx={190} cy={HORIZON} rx={300} ry={160} color={DAWN} o={0.55} />
      <circle cx="190" cy={HORIZON - 4} r="38" fill={DAWN} />
      <path d={`M0 ${HORIZON}V230Q40 196 80 222Q120 180 170 214Q230 176 290 220Q350 190 400 224Q470 184 540 218Q600 192 660 220Q720 186 ${SW} 216V${HORIZON}Z`} fill="#03170f" />
      <rect y={HORIZON} width={SW} height={SH - HORIZON} fill="url(#track)" />
      <path d={lanes} stroke="#eef1f5" strokeOpacity=".22" strokeWidth="3" />
      <path d={LINE} fill="#eef1f5" opacity=".85" />
      <Glow id="dawn" cx={240} cy={HORIZON + 30} rx={360} ry={70} color={DAWN} o={0.25} />
      <Dust seed={6} n={30} x={80} y={120} w={640} h={140} color={DAWN} rMax={1.8} o={0.4} />
      {/* El contador de pasos en su poste, del otro lado de la pista. */}
      <rect x="597" y="236" width="12" height={HORIZON + 22 - 236} fill={ids.url("steel")} />
      <rect x="490" y="62" width="226" height="174" rx="8" fill="url(#house)" stroke="#2d323b" strokeWidth="3" />
      <rect x="494" y="65" width="218" height="2" fill="#fff" opacity=".22" />
      <LedBox {...AF_LED} color={VOLT} />
      <rect x={AF_BAR.x - 4} y={AF_BAR.y - 4} width={AF_BAR.w + 8} height={AF_BAR.h + 8} rx="4" fill="#07080a" stroke="#2d323b" strokeWidth="2" />
      {cells(VOLT, 0.08)}
      <Vignette o={0.7} />
    </Layer>
  );
}

/** 2 · Las diez celdas de pasos encendidas (quedan tapadas por la capa 3 hasta que se corre). */
function Steps() {
  return (
    <Layer>
      <g>{cells(VOLT)}</g>
      <rect x={AF_BAR.x} y={AF_BAR.y} width={AF_BAR.w} height={AF_BAR.h} fill={VOLT} opacity=".12" />
    </Layer>
  );
}

/** 3 · La tapa de la barra: las celdas apagadas, que se corren de a una a la derecha (recortadas a la barra). */
function Cover() {
  return (
    <Layer>
      <rect x={AF_BAR.x} y={AF_BAR.y} width={AF_BAR.w} height={AF_BAR.h} fill="#07080a" />
      {cells(VOLT, 0.08)}
    </Layer>
  );
}

/** 4 · La línea de largada que se prende con la pisada. */
function LineGlow() {
  return (
    <Layer>
      <path d={LINE} fill={VOLT} opacity=".55" />
      <path d={LINE} fill="none" stroke={VOLT} strokeOpacity=".25" strokeWidth="14" strokeLinejoin="round" />
      <Glow id="hit" cx={492} cy={HEEL.y} rx={150} ry={30} color={VOLT} o={0.45} />
    </Layer>
  );
}

/** 5 · La zapatilla con la pierna (calza y media), apoyada con la punta justo detrás de la línea. */
function Sneaker() {
  const upper = "M6 -30L4 -80Q4 -102 24 -106L56 -96Q66 -86 80 -98L98 -118Q110 -122 114 -110L150 -74Q190 -58 222 -46Q240 -38 236 -30Z";
  return (
    <Layer>
      <defs>
        {/* La pierna se funde con la oscuridad hacia arriba: queda lejos del logo. */}
        <VGrad id="leg" stops={[[0, "#14231d", 0], [0.42, "#14231d", 1], [1, "#0f1c17"]]} />
        <VGrad id="rim" stops={[[0, DAWN, 0], [0.45, DAWN, 0.55], [1, DAWN, 0.55]]} />
        <VGrad id="pipe" stops={[[0, VOLT, 0], [0.45, VOLT, 0.7], [1, VOLT, 0.7]]} />
      </defs>
      <ellipse cx={HEEL.x + 118} cy={HEEL.y + 2} rx="134" ry="9" fill="#000" opacity=".55" />
      <g transform={`translate(${HEEL.x} ${HEEL.y})`}>
        <path d="M22 -120Q-14 -250 34 -360Q44 -440 56 -540H176Q150 -420 132 -330Q112 -230 86 -120Z" fill="url(#leg)" />
        <path d="M22 -120Q-14 -250 34 -360Q44 -440 56 -540" stroke="url(#rim)" strokeWidth="3" fill="none" />
        <path d="M60 -126Q46 -260 84 -380L104 -540" stroke="url(#pipe)" strokeWidth="2.5" fill="none" />
        <path d="M18 -94Q14 -116 22 -128Q54 -136 86 -128Q92 -114 88 -94Z" fill="#c9ced6" />
        <path d="M22 -120Q54 -128 86 -120M20 -110Q54 -118 88 -110" stroke="#8b95a3" strokeWidth="2" fill="none" />
        <path d={upper} fill="#1a1f28" />
        <path d="M30 -60Q120 -70 214 -40" stroke={VOLT} strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M6 -78L4 -40H22L24 -82Z" fill={VOLT} />
        <path d="M104 -106L96 -96M118 -96L108 -86M132 -86L122 -76M146 -76L136 -66" stroke="#eef1f5" strokeWidth="3.5" strokeLinecap="round" />
        <path d={upper} fill={ids.url("cyl")} opacity=".35" />
        <path d="M2 -30Q-2 -6 14 -2H206Q232 -4 238 -22Q238 -30 228 -32Z" fill="#eef1f5" />
        <path d="M2 -30Q-2 -6 14 -2H206Q232 -4 238 -22" stroke="#9aa4b2" strokeWidth="3" fill="none" />
        <path d="M8 0H210Q228 0 234 -10" stroke="#0b0d10" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M40 -18H90M120 -16H170" stroke="#9aa4b2" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </Layer>
  );
}

/** 6 · El polvo que levanta la pisada. */
function Puff() {
  return (
    <Layer>
      <Glow id="puff" cx={HEEL.x + 140} cy={HEEL.y - 6} rx={190} ry={36} color="#e6eae0" o={0.35} />
      <Dust seed={17} n={60} x={HEEL.x - 40} y={HEEL.y - 40} w={340} h={46} color="#e6eae0" rMax={2.4} o={0.8} />
    </Layer>
  );
}

export const diaActividadFisicaLayers = [Track, Steps, Cover, LineGlow, Sneaker, Puff];
