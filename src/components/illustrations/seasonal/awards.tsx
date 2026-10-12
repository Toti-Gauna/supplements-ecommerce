import { BOLT, HEART, INK, Lin, Rad, RUBBER, useArt, type DecorProps } from "./paint";

/** Premios y afecto: medalla, trofeo, corazones, guantes que chocan, flor y regalo. */
const GOLD = ["#fff3c4", "#ffd34d", "#e09a12", "#a86400"];

export function Medal({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("g")} c={GOLD} /></defs>
      <path d="M18 2h11l8 22h-11z" fill={INK.plasma} /><path d="M46 2H35l-8 22h11z" fill={INK.volt} />
      <path d="M29 2h6l-3 9z" fill="#000" opacity=".2" />
      <circle cx="32" cy="41" r="19" fill={fill("g")} />
      <circle cx="32" cy="41" r="14.5" fill="none" stroke="#a86400" strokeOpacity=".55" strokeWidth="1.2" />
      <path d={BOLT} transform="translate(26.2 30.5) scale(.34)" fill="#8a5200" />
      <path d="M19 34a14 14 0 0 1 8-7" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Trophy({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("g")} c={GOLD} x2={1} y2={0.4} /><Lin id={id("b")} c={RUBBER} /></defs>
      <path d="M17 12H8v5c0 7 5 12 12 13M47 12h9v5c0 7-5 12-12 13" fill="none" stroke={fill("g")} strokeWidth="3.2" />
      <path d="M15 6h34v12c0 11-7.6 19-17 19S15 29 15 18z" fill={fill("g")} />
      <path d="M28 36h8v8h-8z" fill="#c98510" />
      <path d="M21 44h22l2 6H19z" fill={fill("g")} />
      <rect x="15" y="50" width="34" height="9" rx="2" fill={fill("b")} />
      <rect x="25" y="52.5" width="14" height="4" rx="1" fill={INK.volt} />
      <path d={BOLT} transform="translate(26.6 11) scale(.31)" fill="#8a5200" />
      <path d="M20 10v9c0 4 1.5 7.5 4 10" fill="none" stroke="#fff" strokeOpacity=".65" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Heart({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("h")} c={["#ffb3c9", "#ff4f7f", "#c2184c"]} /></defs>
      <path d={HEART} fill={fill("h")} />
      <path d="M15 24c0-4.5 3-7.5 7-7.5" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function PulseHeart({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("h")} c={["#ff9cb9", "#ff3d74", "#a8103f"]} /></defs>
      <path d={HEART} fill={fill("h")} />
      <path d="M2 34h17l4-8 6 15 5-19 4 12h24" fill="none" stroke="#fff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M2 34h17l4-8 6 15 5-19 4 12h24" fill="none" stroke={INK.volt} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/** Dos guantes de box que chocan (el saludo del compañero de gym). */
export function Gloves({ className }: DecorProps) {
  const { id, fill } = useArt();
  const glove = (
    <>
      <path d="M3 22C3 12 9 7 17 7c8 0 13 5 13 13v8c0 6-4 10-10 10H8c-3 0-5-2-5-5z" fill={fill("r")} />
      <path d="M7 26c0-4 3-5.5 6.5-4.5l4.5 1.6c2.4.9 2.4 4.1 0 5L12 30c-2.6 1-5-.6-5-3z" fill="#ff8a7a" opacity=".55" />
      <rect x="5" y="37" width="19" height="11" rx="2.4" fill="#f2f4f7" /><rect x="5" y="41" width="19" height="3" fill={INK.volt} />
      <path d="M8 12c2-2.5 5-3.6 8.5-3.6" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("r")} c={["#ff7a6b", "#e0262f", "#8f0f1a"]} /></defs>
      <g transform="translate(1 10) rotate(-8 16 28)">{glove}</g>
      <g transform="translate(63 10) scale(-1 1) rotate(-8 16 28)">{glove}</g>
      <path d="M32 2v6M25 5l3 4.5M39 5l-3 4.5" stroke={INK.volt} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Flower({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("p")} c={["#ffe3ee", "#ff8fb6", "#d23a74"]} /><Rad id={id("c")} c={["#f4ffd6", INK.volt, "#7fbf00"]} cx={0.4} cy={0.35} r={0.7} /></defs>
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M32 31c-6.5-4-8-13.5-4.4-21C29 7 31 5 32 4.5c1 .5 3 2.5 4.4 5.5 3.6 7.5 2.1 17-4.4 21z" fill={fill("p")} transform={`rotate(${i * 45} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="8" fill={fill("c")} />
      <g fill="#5a8a00">{[0, 72, 144, 216, 288].map((r) => <circle key={r} cx="32" cy="28" r="1" transform={`rotate(${r} 32 32)`} />)}</g>
    </svg>
  );
}

export function Gift({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("b")} c={["#5d47d6", "#3a26a8", "#22166b"]} /><Lin id={id("l")} c={["#7c66ff", "#4a33cc"]} /></defs>
      <path d="M31 17c-6-9-17-9-16-2 1 5 9 4 16 2zM33 17c6-9 17-9 16-2-1 5-9 4-16 2z" fill={INK.volt} />
      <rect x="9" y="29" width="46" height="30" rx="3" fill={fill("b")} />
      <rect x="6" y="18" width="52" height="12" rx="3" fill={fill("l")} />
      <rect x="28" y="18" width="8" height="41" fill={INK.volt} /><rect x="28" y="18" width="2.5" height="41" fill="#fff" opacity=".35" />
      <path d={BOLT} transform="translate(43 37) scale(.24)" fill={INK.volt} opacity=".9" />
      <path d="M9 31h46" stroke="#000" strokeOpacity=".25" strokeWidth="1.5" />
    </svg>
  );
}
