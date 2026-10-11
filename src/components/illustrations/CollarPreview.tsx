import type { CollarConfig, CollarDesign } from "@/demo/fixtures/collar";
import { collarPieces } from "@/demo/engine/collar";
import { cn } from "@/lib/cn";
import { Cord } from "./collar/Cord";
import { CORD_LENGTH, CORD_PATH, P, at, isLight, spread, tAtLength, tone } from "./collar/geometry";
import { Charm, Motif } from "./collar/Motifs";

/**
 * Vista previa en vivo del collar (ilustrativa): el cordón con su material, patrón y colores, y el nombre según el
 * estilo elegido: letras sueltas que cuelgan, letras en línea que pasan por el cordón, de corrido en una pieza o en
 * una chapita hueso; con adorno a los costados, dije y hebilla. Las piezas se achican para que entren nombres
 * largos. Las que cuelgan se balancean (sin movimiento si el sistema pide reducirlo).
 */

interface Props {
  text: string;
  font: string;
  letterColor: string;
  config: CollarConfig;
  className?: string;
  label?: string;
  /** Miniatura (carrito, galería): sin rótulo ni sombra grande. */
  compact?: boolean;
  /** Aviso junto al rótulo, por ejemplo que la combinación tiene ejemplos de la demo. */
  note?: string;
}

/** Ancho aproximado de un texto (para achicar la letra antes de que se salga de la pieza). */
const textWidth = (s: string, size: number) => [...s].length * size * 0.62;

function NameText({ x, y, text, size, max, fill, font }: { x: number; y: number; text: string; size: number; max: number; fill: string; font: string }) {
  const fit = Math.min(size, max / Math.max(1, [...text].length * 0.62));
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={fit} fontWeight="800" fill={fill} style={{ fontFamily: font }}
      {...(textWidth(text, fit) > max ? { textLength: max, lengthAdjust: "spacingAndGlyphs" } : {})}>{text}</text>
  );
}

export function CollarPreview({ text, font, letterColor, config, className, label, compact = false, note }: Props) {
  const name = (text || "Tu nombre").trim();
  const uid = `collar-${(config.format + config.material + config.charm + (config.pattern ?? "") + (config.design ?? "") + config.cordColor + text).replace(/[^a-z0-9]/gi, "").slice(0, 32) || "x"}`;
  const letters = collarPieces(name, config);
  const design: Exclude<CollarDesign, "none"> | null = config.design && config.design !== "none" && (config.format === "letters" || config.format === "inline") ? config.design : null;
  const pieces = design ? [null, ...letters, null] : letters;
  const ink = tone(letterColor, isLight(letterColor) ? -0.45 : -0.6);
  const metal = `url(#${uid}-metal)`;
  const drop = `url(#${uid}-drop)`;
  const [cx, cy] = at(0.5);

  // Sueltas: cuelgan a la misma distancia sobre el cordón. En línea: pasan por el cordón, pegadas, siguiendo la curva.
  const pitch = config.format === "inline" ? Math.min(27, 250 / Math.max(pieces.length, 1)) : Math.min(32, 220 / Math.max(pieces.length, 1));
  const spots = config.format === "letters" || config.format === "inline" ? spread(pieces.length, pitch) : [];
  const charmAt = spots.length
    ? at(tAtLength(CORD_LENGTH / 2 + ((pieces.length - 1) / 2 + (config.format === "inline" ? 1.4 : design ? 1.6 : 1.1)) * pitch))
    : at(tAtLength(CORD_LENGTH / 2 + 92));
  const plateW = Math.min(260, Math.max(110, [...name].length * 18 + 52));

  return (
    <div className={cn("relative overflow-hidden", !compact && "rounded-[1.5rem] bg-[radial-gradient(120%_90%_at_50%_0%,#fffaf1,#efe6d4)]", className)}>
      <svg viewBox="0 18 400 290" role="img" aria-label={label ?? `Vista previa del collar ${name}`} className="h-full w-full">
        <defs>
          <linearGradient id={`${uid}-metal`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6e2b0" /><stop offset=".5" stopColor="#d2ad69" /><stop offset="1" stopColor="#9a7434" /></linearGradient>
          <linearGradient id={`${uid}-buckle`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4d50" /><stop offset="1" stopColor="#1e2022" /></linearGradient>
          <filter id={`${uid}-drop`} x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#1c2016" floodOpacity=".28" /></filter>
        </defs>
        {!compact && <ellipse cx="200" cy="292" rx="150" ry="9" fill="#1c2016" opacity=".07" />}

        <g filter={drop}>
          <Cord d={CORD_PATH} material={config.material} pattern={config.pattern ?? "solid"} cord={config.cordColor} accent={config.accentColor ?? tone(config.cordColor, -0.45)} />
        </g>
        {/* Hebilla de clic y argolla */}
        <g transform={`translate(${P[3][0] - 8} ${P[3][1] - 16})`}>
          <rect width="30" height="32" rx="7" fill={`url(#${uid}-buckle)`} />
          <rect x="6" y="9" width="18" height="14" rx="3" fill="#0f1011" opacity=".55" />
        </g>
        <rect x={P[0][0] - 12} y={P[0][1] - 14} width="22" height="28" rx="6" fill={`url(#${uid}-buckle)`} />

        {config.format === "letters" && pieces.map((ch, i) => {
          const { x, y } = spots[i]!;
          return (
            <g key={`${ch ?? "adorno"}-${i}`} className="collar-swing" style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", animationDelay: `${-i * 0.37}s` }}>
              <line x1={x} y1={y + 4} x2={x} y2={y + 12} stroke="#b9b4a8" strokeWidth="2" />
              <circle cx={x} cy={y + 15} r="3.6" fill="none" stroke="#b9b4a8" strokeWidth="2" />
              {ch === null ? <g filter={drop}><Motif kind={design!} x={x} y={y + 34} scale={Math.min(1.1, pitch / 26)} fill={letterColor} ink={ink} /></g> : (
                <text x={x} y={y + 50} textAnchor="middle" fontSize={Math.min(32, pitch * 1.15)} fontWeight="800" fill={letterColor} stroke={ink} strokeWidth="2.6" paintOrder="stroke"
                  style={{ fontFamily: font }} filter={drop}>{ch}</text>
              )}
            </g>
          );
        })}
        {config.format === "inline" && (
          <g filter={drop}>
            {pieces.map((ch, i) => {
              const { x, y, angle } = spots[i]!;
              const half = pitch / 2 - 0.6;
              return (
                <g key={`${ch ?? "adorno"}-${i}`} transform={`translate(${x} ${y}) rotate(${angle})`}>
                  {ch === null ? (
                    <><circle r={half} fill={metal} stroke="#7a5a26" strokeWidth="1.2" /><Motif kind={design!} x={0} y={0} scale={half / 17} fill="#fffaf0" ink="#7a5a26" /></>
                  ) : (
                    <>
                      <rect x={-half} y={-half - 2} width={half * 2} height={half * 2 + 4} rx={half * 0.4} fill={letterColor} stroke={ink} strokeWidth="1.6" />
                      <text y={half * 0.42} textAnchor="middle" fontSize={half * 1.25} fontWeight="800" fill={isLight(letterColor) ? "#1c2016" : "#fffaf0"} style={{ fontFamily: font }}>{ch}</text>
                    </>
                  )}
                </g>
              );
            })}
          </g>
        )}
        {config.format === "joined" && (
          <g className="collar-swing" style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }} filter={drop}>
            <circle cx={cx - plateW / 2 + 22} cy={cy + 12} r="4" fill="none" stroke="#b9b4a8" strokeWidth="2" />
            <circle cx={cx + plateW / 2 - 22} cy={cy + 12} r="4" fill="none" stroke="#b9b4a8" strokeWidth="2" />
            <rect x={cx - plateW / 2} y={cy + 16} width={plateW} height="48" rx="24" fill={letterColor} stroke={ink} strokeWidth="2" />
            <NameText x={cx} y={cy + 50} text={name} size={27} max={plateW - 30} fill={isLight(letterColor) ? "#1c2016" : "#fffaf0"} font={font} />
          </g>
        )}
        {config.format === "tag" && (
          <g className="collar-swing" style={{ transformOrigin: `${cx}px ${cy}px`, transformBox: "view-box" }} filter={drop}>
            <circle cx={cx} cy={cy + 14} r="5" fill="none" stroke="#b9b4a8" strokeWidth="2.2" />
            <path transform={`translate(${cx} ${cy + 56})`} d="M-62 -14a13 13 0 1 1 13-13h98a13 13 0 1 1 13 13v28a13 13 0 1 1-13 13h-98a13 13 0 1 1-13-13z" fill="#fbf6ea" stroke="#cdbf9f" strokeWidth="2" />
            <NameText x={cx} y={cy + 57} text={name} size={23} max={116} fill={isLight(letterColor) ? "#3d4a2a" : letterColor} font={font} />
            <text x={cx} y={cy + 74} textAnchor="middle" fontSize="11" fontWeight="700" fill="#8a8170">Tel. 223 ··· ····</text>
          </g>
        )}
        <Charm kind={config.charm} x={charmAt[0]} y={charmAt[1]} metal={metal} />
      </svg>
      {!compact && (
        <span className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-white/85 px-2.5 py-0.5 text-[11px] font-semibold text-[#4f5545]">Vista previa ilustrativa</span>
          {note && <span className="rounded-full bg-[#2b2f22]/85 px-2.5 py-0.5 text-[11px] font-semibold text-[#f3dca6]">{note}</span>}
        </span>
      )}
    </div>
  );
}
