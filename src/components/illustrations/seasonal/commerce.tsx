import { BOLT, DISPLAY, INK, Lin, MONO, RUBBER, STEEL, useArt, type DecorProps } from "./paint";

/** Ofertas y tecnología: etiqueta, bolsa, llama, chip, batería, calendario y la actualización 2027. */

export function Tag({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("t")} c={RUBBER} /></defs>
      <path d="M50 4c6 0 9 4 7 9" fill="none" stroke="#b4bcc6" strokeWidth="1.6" />
      <path d="M33 6h21a4 4 0 0 1 4 4v21L30.5 58.5a4 4 0 0 1-5.6 0L5.5 39.1a4 4 0 0 1 0-5.6z" fill={fill("t")} stroke={INK.volt} strokeWidth="2" />
      <circle cx="47.5" cy="16.5" r="4" fill="none" stroke={INK.volt} strokeWidth="2" />
      <text x="30" y="41" textAnchor="middle" fill={INK.volt} style={DISPLAY} fontSize="20" transform="rotate(-45 30 35)">%</text>
    </svg>
  );
}

export function Bag({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("b")} c={["#2b313b", "#12161c", "#050608"]} /></defs>
      <path d="M22 22v-6a10 10 0 0 1 20 0v6" fill="none" stroke={INK.volt} strokeWidth="3.4" strokeLinecap="round" />
      <path d="M11 20h42l3 38a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3z" fill={fill("b")} />
      <path d="M11 20h42l.5 6h-43z" fill="#fff" opacity=".07" />
      <path d={BOLT} transform="translate(26 30) scale(.35)" fill={INK.volt} />
      <circle cx="22" cy="24" r="1.8" fill={INK.volt} /><circle cx="42" cy="24" r="1.8" fill={INK.volt} />
    </svg>
  );
}

export function Flame({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("o")} c={["#ffb347", "#ff5a1f", "#c8160c"]} /><Lin id={id("i")} c={["#fff6c2", "#ffd34d", "#ff9a1f"]} /></defs>
      <path d="M32 2c5 11 19 18 19 37a19 19 0 0 1-38 0c0-9 4-14 8-19 0 7 3 10 7 10-2-10 1-21 4-28z" fill={fill("o")} />
      <path d="M32 29c2.6 6 10 9 10 18a10 10 0 0 1-20 0c0-5.5 4-8.5 4.5-12 1.2 3 2.5 4.5 4 4.5-.5-3.5.3-7 1.5-10.5z" fill={fill("i")} />
      <path d="M19 36c-1 5 0 10 3 13" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Chip({ className }: DecorProps) {
  const { id, fill } = useArt();
  const pins = [16, 24, 32, 40, 48];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("c")} c={["#123446", "#0a1c27", "#050d14"]} /></defs>
      <g stroke={INK.ion} strokeWidth="2.4" strokeLinecap="round">
        {pins.map((p) => <path key={p} d={`M${p} 3v8M${p} 53v8M3 ${p}h8M53 ${p}h8`} />)}
      </g>
      <rect x="10" y="10" width="44" height="44" rx="6" fill={fill("c")} stroke={INK.ion} strokeWidth="1.6" />
      <rect x="20" y="20" width="24" height="24" rx="3" fill="#0b2230" stroke="#ff4fd8" strokeWidth="1.2" />
      <path d={BOLT} transform="translate(25.4 23) scale(.35)" fill={INK.volt} />
      <circle cx="15.5" cy="15.5" r="1.6" fill={INK.ion} />
    </svg>
  );
}

export function Battery({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("s")} c={STEEL} /><Lin id={id("v")} c={[INK.voltSoft, INK.volt, "#7fbf00"]} /></defs>
      <rect x="3" y="17" width="52" height="30" rx="6" fill={INK.night} stroke={fill("s")} strokeWidth="3" />
      <rect x="55" y="25" width="6" height="14" rx="2" fill={fill("s")} />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={8 + i * 11.5} y="22" width="9" height="20" rx="2" fill={i < 3 ? fill("v") : "#22303a"} />)}
      <path d={BOLT} transform="translate(43.5 24.5) scale(.29)" fill={INK.volt} />
    </svg>
  );
}

/** Hoja de calendario en "LUN": el clásico "arranco el lunes". */
export function Calendar({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("p")} c={["#ffffff", "#e7eaf0"]} /></defs>
      <rect x="7" y="9" width="50" height="50" rx="7" fill={fill("p")} />
      <path d="M7 16a7 7 0 0 1 7-7h36a7 7 0 0 1 7 7v8H7z" fill={INK.plasma} />
      <rect x="18" y="4" width="5" height="11" rx="2.5" fill={INK.graphite} /><rect x="41" y="4" width="5" height="11" rx="2.5" fill={INK.graphite} />
      <text x="32" y="21.5" textAnchor="middle" fill="#fff" style={MONO} fontSize="7.5" letterSpacing="1.5">LUN</text>
      <text x="32" y="52" textAnchor="middle" fill={INK.graphite} style={DISPLAY} fontSize="25">1</text>
      <path d="M44 31l5-6 2.5 2-5 6z" fill={INK.volt} stroke="#5a8a00" strokeWidth=".8" />
    </svg>
  );
}

/** Insignia "v2027" con flechas de actualización (Año Nuevo). */
export function Update({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("b")} c={["#2a3478", "#141b45", "#0a0f24"]} /></defs>
      <rect x="4" y="4" width="56" height="56" rx="14" fill={fill("b")} stroke={INK.plasma} strokeWidth="1.4" />
      <path d="M18 27a15 15 0 0 1 27-6M46 33a15 15 0 0 1-27 6" fill="none" stroke={INK.volt} strokeWidth="3.2" strokeLinecap="round" />
      <path d="M46.5 14.5 46 22l-7.5-.6M17.5 45.5 18 38l7.5.6" fill="none" stroke={INK.volt} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d={BOLT} transform="translate(27.6 21.5) scale(.26)" fill="#fff" />
      <text x="32" y="56" textAnchor="middle" fill={INK.voltSoft} style={MONO} fontSize="7.6">v2027</text>
    </svg>
  );
}
