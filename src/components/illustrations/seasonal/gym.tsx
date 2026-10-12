import { BOLT, DISPLAY, INK, Lin, Rad, RUBBER, STEEL, useArt, type DecorProps } from "./paint";

/** Equipo de gimnasio: mancuerna, pesa rusa, disco, shaker, scoop, rayo, destello, cronómetro y zapatilla. */
export function Dumbbell({ className }: DecorProps) {
  const { id, fill } = useArt();
  const head = (x: number) => <path d={`M${x} 21h9l3.5 4.5v13L${x + 9} 43h-9l-3.5-4.5v-13z`} fill={fill("r")} />;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("s")} c={STEEL} /><Lin id={id("r")} c={RUBBER} /></defs>
      <g transform="rotate(-22 32 32)">
        <rect x="16" y="29" width="32" height="6" rx="2" fill={fill("s")} />
        <path d="M23 29.6v4.8M26 29.6v4.8M38 29.6v4.8M41 29.6v4.8" stroke="#6b7480" strokeWidth=".8" />
        {head(3.5)}{head(51.5)}
        <rect x="13" y="23.5" width="4.5" height="17" rx="1.4" fill={fill("s")} /><rect x="46.5" y="23.5" width="4.5" height="17" rx="1.4" fill={fill("s")} />
        <path d="M2 30.5h13M49 30.5h13" stroke={INK.volt} strokeWidth="1.8" />
        <path d="M5 22h7M53 22h7" stroke="#fff" strokeOpacity=".3" strokeWidth="1.2" strokeLinecap="round" />
      </g>
    </svg>
  );
}

export function Kettlebell({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("b")} c={["#5a6372", "#1f242d", "#0b0e13"]} /><Lin id={id("h")} c={["#4a525f", "#161a21"]} /></defs>
      <path d="M20.5 33c-3.5-15 3.5-25 11.5-25s15 10 11.5 25" fill="none" stroke={fill("h")} strokeWidth="6" strokeLinecap="round" />
      <path d="M22 26c-1-8 3.5-14 10-14" fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="32" cy="59" rx="14" ry="2.4" fill="#000" opacity=".28" />
      <circle cx="32" cy="40" r="19.5" fill={fill("b")} />
      <path d="M13.5 45.5q18.5 8.5 37 0" fill="none" stroke={INK.volt} strokeWidth="2.4" />
      <path d={BOLT} transform="translate(26.6 28) scale(.32)" fill={INK.volt} />
      <ellipse cx="24" cy="31" rx="7" ry="3.6" transform="rotate(-35 24 31)" fill="#fff" opacity=".16" />
    </svg>
  );
}

export function Plate({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("p")} c={["#4f7dff", "#2450c9", "#122c78"]} /><Lin id={id("s")} c={STEEL} /></defs>
      <circle cx="32" cy="32" r="29" fill={fill("p")} />
      <circle cx="32" cy="32" r="22" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.4" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="#fff" strokeOpacity=".14" strokeWidth=".9" />
      <circle cx="32" cy="32" r="9.5" fill={fill("s")} /><circle cx="32" cy="32" r="5" fill={INK.night} />
      <text x="32" y="18.5" textAnchor="middle" fill="#fff" opacity=".9" style={DISPLAY} fontSize="8">20 KG</text>
      <path d="M12 22a22 22 0 0 1 10-10" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ShakerCup({ className }: DecorProps) {
  const { id, fill } = useArt();
  const cup = "M18.5 19h27l-3.2 36.5q-.4 4.5-4.8 4.5H26.5q-4.4 0-4.8-4.5z";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("l")} c={[INK.voltSoft, INK.volt, "#78b800"]} /><Lin id={id("c")} c={RUBBER} /></defs>
      <path d={cup} fill="#dfe6ef" opacity=".32" />
      <path d="M20.2 35h23.6l-1.7 20.5q-.4 4.5-4.8 4.5H26.7q-4.4 0-4.8-4.5z" fill={fill("l")} />
      <path d="M20.2 35q5.9-2.2 11.8 0t11.8 0" fill="#f4ffd6" opacity=".8" />
      <path d={BOLT} transform="translate(28 40) scale(.24)" fill={INK.night} opacity=".7" />
      <path d="M39 23h3M39.5 27h2M39 31h3" stroke="#fff" strokeOpacity=".7" strokeWidth="1" />
      <path d={cup} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
      <path d="M23.5 23v30" stroke="#fff" strokeOpacity=".4" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="16.5" y="12.5" width="31" height="7.5" rx="2.2" fill={fill("c")} />
      <path d="M21.5 12.5q0-5.5 5.5-5.5h10q5.5 0 5.5 5.5z" fill="#2c323d" />
      <rect x="34" y="3.5" width="8" height="5" rx="1.6" fill={INK.plasma} />
    </svg>
  );
}

export function Scoop({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("b")} c={["#ffffff", "#d3d9e1", "#97a1ad"]} /><Rad id={id("h")} c={["#f4ffd6", INK.volt, "#7fbf00"]} cx={0.4} cy={0.2} r={0.9} /></defs>
      <path d="M36 37h21q3.5 0 3.5 3.5v.5q0 3.5-3.5 3.5H36z" fill="#c3cad4" />
      <path d="M5 33h33v5.5c0 10-7.4 16.5-16.5 16.5S5 48.5 5 38.5z" fill={fill("b")} />
      <path d="M3 34.5c2.6-12 10-18 18.5-18S37.4 22.5 40 34.5z" fill={fill("h")} />
      <g fill="#6aa300">{[[12, 28], [19, 23], [26, 27], [32, 31], [16, 32]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1" />)}</g>
      <path d="M8 40c1 6 5 10 10 11.5" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.5" strokeLinecap="round" />
      <g fill={INK.voltSoft}><circle cx="46" cy="22" r="1.6" /><circle cx="51" cy="28" r="1.1" /><circle cx="44" cy="14" r="1" /></g>
    </svg>
  );
}

export function Bolt({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("v")} c={["#f4ffd6", INK.volt, "#7fbf00"]} x2={1} /></defs>
      <path d={BOLT} transform="translate(13.5 6)" fill={fill("v")} />
      <path d="M30.5 6h17L34.5 28" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.2" />
    </svg>
  );
}

export function Spark({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("s")} c={["#ffffff", INK.voltSoft, INK.volt]} cx={0.5} cy={0.5} r={0.5} /></defs>
      <path d="M32 3c2 15 6.5 22.5 29 29-22.5 6.5-27 14-29 29-2-15-6.5-22.5-29-29C25.5 25.5 30 18 32 3z" fill={fill("s")} />
    </svg>
  );
}

export function Stopwatch({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("c")} c={["#5a6372", "#1f242d"]} /><Lin id={id("s")} c={STEEL} /></defs>
      <rect x="27.5" y="3" width="9" height="6.5" rx="1.8" fill={fill("s")} />
      <path d="M45 11.5l4-4 3.5 3.5-4 4z" fill={fill("s")} />
      <circle cx="32" cy="37" r="24" fill={fill("c")} />
      <circle cx="32" cy="37" r="19.5" fill={INK.night} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M32 19.5v3.2" stroke={i % 3 ? "#6b7480" : "#fff"} strokeWidth="1.6" transform={`rotate(${i * 30} 32 37)`} />)}
      <path d="M32 21a16 16 0 0 1 15.2 11" fill="none" stroke={INK.volt} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 37 41 27" stroke={INK.volt} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="37" r="2.8" fill={INK.volt} />
      <path d="M15 28a19 19 0 0 1 9-9" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Sneaker({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("u")} c={["#a594ff", INK.plasma, "#4a2fd0"]} /></defs>
      <path d="M5 46c0-7 3-11 8-13l10-4c3.5-1.4 5-6 6-10.5l.8-3.2c.6-2.3 3-3 5-1.6l6.4 4.6c2.6 1.9 3.6 5.6 6.6 7.2l8.6 4.8c3.2 1.8 5.6 5 5.6 9V47H5z" fill={fill("u")} />
      <path d="M31 19.5l9 6.5M29.5 24l9 6M27.5 28.5l8 5.5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M11 0h11L13.5 14.5H18L0 34l5.5-15H1.3z" transform="translate(38 33) scale(.36) rotate(-62)" fill={INK.volt} />
      <path d="M3.5 47h57v3.5q0 4.5-4.5 4.5H8q-4.5 0-4.5-4.5z" fill="#f2f4f7" />
      <path d="M3.5 51.5h57" stroke={INK.volt} strokeWidth="2.2" />
      <path d="M10 40c4-4 10-6 16-6" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
