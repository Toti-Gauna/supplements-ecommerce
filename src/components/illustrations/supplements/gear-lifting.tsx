import { DISPLAY_SVG, MONO_SVG, Rim, fitSize, tone } from "./defs";
import { Contact, Patch, Stitch, inside, onEllipse, printOn } from "./gear-kit";
import type { ContainerProps, PackStyle } from "./types";

/** Cinta (strap) dibujada como trazo: canto oscuro, color, costuras a los dos lados y volumen. */
function Ribbon({ d, color, stitch, w = 26 }: { d: string; color: string; stitch: string; w?: number }) {
  return (
    <g fill="none">
      <path d={d} stroke={tone(color, -0.5)} strokeWidth={w} />
      <path d={d} stroke={color} strokeWidth={w - 3} />
      <path d={d} stroke={stitch} strokeWidth={w - 9} strokeDasharray="4 3" opacity=".8" />
      <path d={d} stroke={color} strokeWidth={w - 11} />
      <path d={d} stroke="url(#sp-cyl)" strokeWidth={w} opacity=".5" />
    </g>
  );
}

/** Strap tipo lazo: la cinta pasada por su ojal forma el aro, con la caja en X cosida y la punta en el piso. */
function Lasso({ pack, tint, cx, s, r = 0, back }: ContainerProps & { cx: number; s: number; r?: number; back?: boolean }) {
  const color = back ? tone(tint, -0.22) : tint;
  const ring = `M${cx} 262C${cx - 74} 226 ${cx - 70} 104 ${cx} 104C${cx + 70} 104 ${cx + 74} 226 ${cx} 262`;
  const tail = `M${cx - 13} 262C${cx - 14} 300 ${cx + 6} 318 ${cx + 90} 320L${cx + 92} 328C${cx + 2} 330 ${cx - 13} 318 ${cx + 13} 262Z`;
  return (
    <g transform={`translate(${cx} 328) rotate(${r}) scale(${s}) translate(${-cx} -328)`}>
      <path d={tail} fill={tone(color, -0.1)} />
      <path d={tail} fill="url(#sp-v)" />
      <Ribbon d={ring} color={color} stitch={tone(color, -0.5)} />
      {!back && <Patch x={cx - 34} y={93} w={68} h={23} pack={pack} />}
      <rect x={cx - 17} y={236} width="34" height="50" rx="3" fill={color} />
      <rect x={cx - 17} y={236} width="34" height="50" rx="3" fill="url(#sp-cyl)" opacity=".55" />
      <Stitch d={`M${cx - 11} 244h22v20h-22zM${cx - 11} 244l22 20M${cx + 11} 244l-22 20`} color={pack.accent} w={1.4} />
      <path d={`M${cx - 17} 272h34`} stroke="#000" strokeOpacity=".4" strokeWidth="2" />
    </g>
  );
}

/** Straps de levantamiento: el par tipo lazo, con la caja en X y el parche bordado. */
export function Straps({ pack, tint }: ContainerProps) {
  return (
    <g>
      <Contact cx={200} rx={100} />
      <Lasso pack={pack} tint={tint} cx={236} s={0.9} r={9} back />
      <Lasso pack={pack} tint={tint} cx={168} s={1} />
    </g>
  );
}

/** Hebilla de palanca de acero con la marca grabada. */
function Lever({ pack }: { pack: PackStyle }) {
  return (
    <g>
      <rect x="168" y="250" width="44" height="70" rx="4" fill="#7d8591" />
      <rect x="168" y="250" width="44" height="70" rx="4" fill="url(#sp-cyl)" />
      {[[174, 256], [206, 256], [174, 314], [206, 314]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="#e8ebef" stroke="#4b525c" strokeWidth=".8" />)}
      <rect x="176" y="263" width="28" height="44" rx="3" fill="#dfe3e8" />
      <rect x="176" y="263" width="28" height="44" rx="3" fill="url(#sp-cyl)" opacity=".6" />
      <rect x="176" y="263" width="28" height="6" rx="3" fill="#fff" opacity=".6" />
      <text transform="translate(193 302) rotate(-90)" fill="#2c3139" style={{ fontFamily: MONO_SVG, fontWeight: 800, letterSpacing: "0.04em" }} fontSize={fitSize(pack.mark, 36, 8, 0.62)}>{pack.mark}</text>
      <path d="M179 303h22" stroke={pack.accent} strokeWidth="2.2" />
    </g>
  );
}

/** Cinturón de levantamiento enrollado en C: cuero del color elegido con canto pintado, interior de gamuza, punta con
 * ojalillos, costura del acento, parche y palanca de acero. */
export function Belt({ pack, tint }: ContainerProps) {
  const cx = 200, rx = 104, ry = 40, top = 198, bot = 290;
  const P = (y: number, deg: number) => onEllipse(cx, y, rx, ry, deg).join(" ");
  const wall = (a: number, b: number) => `M${P(top, a)}A${rx} ${ry} 0 0 1 ${P(top, b)}L${P(bot, b)}A${rx} ${ry} 0 0 0 ${P(bot, a)}Z`;
  const arc = (y: number, a: number, b: number) => `M${P(y, a)}A${rx} ${ry} 0 0 1 ${P(y, b)}`;
  const back = `M${cx - rx} ${top}A${rx} ${ry} 0 0 1 ${cx + rx} ${top}V${bot}A${rx} ${ry} 0 0 1 ${cx - rx} ${bot}Z`;
  const main = wall(-6, 104);
  const tail = wall(140, 186);
  const edge = tone(tint, -0.5);
  return (
    <g>
      <Contact cx={200} rx={112} />
      <path d={back} fill={inside(tint)} />
      <ellipse cx={cx} cy={top + 30} rx={rx - 12} ry={ry - 10} fill="#000" opacity=".32" />
      <path d={arc(top, 180, 360)} fill="none" stroke={edge} strokeWidth="3.2" />
      <path d={tail} fill={tint} />
      <path d={tail} fill="#000" opacity=".3" />
      {[152, 164, 176].map((a) => {
        const [hx, hy] = onEllipse(cx, (top + bot) / 2, rx, ry, a);
        return <g key={a}><ellipse cx={hx} cy={hy} rx="3" ry="4.6" fill="#c9ced6" /><ellipse cx={hx} cy={hy} rx="1.7" ry="3" fill="#0b0d10" /></g>;
      })}
      <path d={`M${P(top, 140)}L${P(bot, 140)}`} stroke={tone(tint, 0.15)} strokeWidth="2.5" />
      <path d={main} fill={tint} />
      <path d={main} fill="url(#sp-cyl)" opacity=".7" />
      {[[top + 9, -6, 104], [bot - 9, -6, 104], [top + 9, 140, 186], [bot - 9, 140, 186]].map(([y, a, b]) => <Stitch key={`${y}-${a}`} d={arc(y!, a!, b!)} color={pack.accent} w={1.3} />)}
      <path d={arc(top, -6, 104)} fill="none" stroke={edge} strokeWidth="3.2" />
      <path d={arc(top + 2.6, -6, 104)} fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="1.2" />
      <path d={arc(top, 140, 186)} fill="none" stroke={edge} strokeWidth="3" />
      <path d={`M${P(top, 104)}L${P(bot, 104)}`} stroke={edge} strokeWidth="3" />
      <Patch x={234} y={254} w={56} h={32} pack={pack} />
      <g transform="translate(12 0)"><Lever pack={pack} /></g>
      <Rim x={303} y1={210} y2={292} />
    </g>
  );
}

/** Rodillera de neoprene: tubo con la curva de la rodilla, costura plana, boca con el canto a la vista y logo grande. */
function Sleeve({ pack, tint, cx, base, h, back }: ContainerProps & { cx: number; base: number; h: number; back?: boolean }) {
  const rt = 46, rb = 44, ry = 13, top = base - h, tx = cx - 10;
  const d = `M${tx - rt} ${top}C${tx - rt + 18} ${top + h * 0.36} ${cx - rb + 14} ${top + h * 0.7} ${cx - rb} ${base}A${rb} ${ry} 0 0 0 ${cx + rb} ${base}C${cx + rb + 3} ${top + h * 0.7} ${tx + rt + 6} ${top + h * 0.36} ${tx + rt} ${top}A${rt} ${ry} 0 0 0 ${tx - rt} ${top}Z`;
  const seam = `M${tx - rt + 13} ${top + ry}C${tx - rt + 28} ${top + h * 0.38} ${cx - rb + 26} ${top + h * 0.7} ${cx - rb + 13} ${base + ry - 2}`;
  const color = back ? tone(tint, -0.16) : tint;
  const ink = printOn(tint);
  return (
    <g>
      <path d={d} fill={color} />
      <path d={seam} fill="none" stroke={tone(color, -0.45)} strokeWidth="4" opacity=".7" />
      <Stitch d={seam} color={pack.accent} w={1.1} o={0.85} />
      <text transform={`translate(${cx + 12} ${base - 18}) rotate(-92)`} fill={ink} opacity=".92" style={{ fontFamily: DISPLAY_SVG, fontWeight: 850, fontStretch: "125%" }} fontSize={fitSize(pack.mark, h * 0.66, 30)}>{pack.mark}</text>
      <path d={`M${cx + 18} ${base - 10}v-14`} stroke={pack.accent} strokeWidth="5" />
      <path d={d} fill="url(#sp-cyl)" opacity=".85" />
      <path d={`M${cx - rb + 4} ${base - 4}A${rb} ${ry} 0 0 0 ${cx + rb - 4} ${base - 4}`} fill="none" stroke={tone(color, 0.3)} strokeWidth="1.4" opacity=".5" />
      <ellipse cx={tx} cy={top} rx={rt - 1} ry={ry - 0.5} fill={tone(color, -0.55)} />
      <ellipse cx={tx + 2} cy={top + 3} rx={rt - 10} ry={ry - 5} fill={tone(color, -0.82)} />
      <ellipse cx={tx} cy={top} rx={rt - 1.5} ry={ry - 1} fill="none" stroke={tone(color, 0.4)} strokeWidth="3" />
      {!back && <path d={`M${cx + rb + 1} ${base - 6}C${cx + rb + 4} ${top + h * 0.7} ${tx + rt + 7} ${top + h * 0.36} ${tx + rt + 1} ${top + 8}`} fill="none" stroke="url(#sp-rim)" strokeWidth="2.2" />}
    </g>
  );
}

/** Rodilleras: el par de pie, una detrás de la otra. */
export function Sleeves({ pack, tint }: ContainerProps) {
  return (
    <g>
      <Contact cx={198} rx={102} />
      <Sleeve pack={pack} tint={tint} cx={162} base={312} h={186} back />
      <Sleeve pack={pack} tint={tint} cx={240} base={326} h={174} />
    </g>
  );
}
