import type { ArtKey, ArtView } from "@/demo/types";
import { cn } from "@/lib/cn";
import { BowlDog, BowlWood, Collar, LeashHanger } from "./pets";
import { CandleBowl, CandleTin, LabelGuide, NfcPlate, NfcSocial } from "./crafts";
import { CandlePoodle, Dachshund, Diffuser, FigurePair, HomeSpray, LampPainted, LampPhoto, MdpSign } from "./home";

type ArtComponent = (props: { tint?: string }) => React.JSX.Element;

const ART: Record<ArtKey, ArtComponent> = {
  "bowl-dog": BowlDog, "bowl-wood": BowlWood, collar: Collar, "nfc-plate": NfcPlate, "nfc-social": NfcSocial,
  "lamp-photo": LampPhoto, "lamp-painted": LampPainted, "leash-hanger": LeashHanger, dachshund: Dachshund,
  "figure-pair": FigurePair, "candle-poodle": CandlePoodle, "home-spray": HomeSpray, diffuser: Diffuser, "mdp-sign": MdpSign,
  "candle-tin": CandleTin, "candle-bowl": CandleBowl, "label-guide": LabelGuide,
};

const STUDIO: Record<Exclude<ArtView, "context">, [string, string, string]> = {
  front: ["#f5eee2", "#eadfcb", "#ddd0b8"],
  detail: ["#f1e6d3", "#e5d6bd", "#d6c4a6"],
};

/** Fondo de estudio: degradado, luz lateral, horizonte y sombra difusa. IDs deterministas (definiciones idénticas). Las temáticas cambian el degradado con --studio-1/2/3. */
function Studio({ view }: { view: Exclude<ArtView, "context"> }) {
  const [top, mid, floor] = STUDIO[view];
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id={`st-${view}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: `var(--studio-1, ${top})` }} /><stop offset=".72" style={{ stopColor: `var(--studio-2, ${mid})` }} /><stop offset="1" style={{ stopColor: `var(--studio-3, ${floor})` }} />
        </linearGradient>
        <radialGradient id="st-light" cx=".22" cy=".12" r=".75"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <filter id="st-blur" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <rect width="400" height="400" fill={`url(#st-${view})`} />
      <rect width="400" height="400" fill="url(#st-light)" />
      <path d="M0 292 Q200 278 400 292" stroke="#fff" strokeOpacity=".35" strokeWidth="2" fill="none" />
      <ellipse cx="200" cy="334" rx="132" ry="15" fill="#1c2016" opacity=".2" filter="url(#st-blur)" />
    </g>
  );
}

function ContextScene() {
  return (
    <g aria-hidden="true">
      <defs>
        <linearGradient id="ctx-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f3ede2" /><stop offset="1" stopColor="#e4dccd" /></linearGradient>
        <linearGradient id="ctx-wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d4b48a" /><stop offset="1" stopColor="#b98b5c" /></linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="300" fill="url(#ctx-wall)" />
      <rect x="0" y="300" width="400" height="100" fill="url(#ctx-wood)" />
      <path d="M0 300h400" stroke="#a87b4f" strokeWidth="4" />
      <rect x="-40" y="-40" width="220" height="220" fill="#fff" opacity=".25" transform="rotate(20)" />
      <path d="M346 300c-4-40 4-80 24-110M346 300c-20-30-40-46-64-50M350 300c10-34 30-52 44-56" stroke="#6f8f5a" strokeWidth="8" fill="none" strokeLinecap="round" />
      <ellipse cx="370" cy="190" rx="14" ry="26" fill="#6f8f5a" transform="rotate(30 370 190)" />
      <ellipse cx="284" cy="250" rx="12" ry="24" fill="#86a56f" transform="rotate(-60 284 250)" />
    </g>
  );
}

export interface ProductArtProps {
  art: ArtKey;
  view?: ArtView;
  tint?: string;
  label: string;
  className?: string;
  showBadge?: boolean;
}

/** Imagen ilustrativa de producto (placeholder vectorial hasta tener fotos reales de Volta). */
export function ProductArt({ art, view = "front", tint, label, className, showBadge = true }: ProductArtProps) {
  const Art = ART[art];
  const transform = view === "detail" ? "translate(-140 -120) scale(1.7)" : view === "context" ? "translate(40 40) scale(0.8)" : undefined;
  return (
    <div className={cn(/\babsolute\b/.test(className ?? "") ? "" : "relative", "overflow-hidden", className)}>
      <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${label} (imagen ilustrativa)`} className="block h-full w-full">
        {view === "context" ? <ContextScene /> : <Studio view={view} />}
        <g transform={transform}>
          <Art tint={tint} />
        </g>
      </svg>
      {showBadge && (
        <span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#fffdf8]/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5d6050] backdrop-blur">
          Imagen ilustrativa
        </span>
      )}
    </div>
  );
}
