import { BOLT, INK, Lin, Rad, STEEL, useArt, type DecorProps } from "./paint";

/** Operación verano: sol, ola, botella térmica y anteojos de sol. */
export function Sun({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("s")} c={["#fffbe0", "#ffd34d", "#ff9a1f"]} /></defs>
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M32 1.5l3 9h-6z" fill={i % 2 ? "#ffd34d" : "#ffb02e"} transform={`rotate(${i * 30} 32 32)`} />)}
      <circle cx="32" cy="32" r="17" fill={fill("s")} />
      <path d="M21 27a12 12 0 0 1 8-8" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Wave({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("w")} c={["#5ee8da", "#14a3c7", "#0a4f78"]} /></defs>
      <path d="M2 58V40C8 22 22 10 38 10c12 0 20 8 20 17 0 7-5 11-11 11-5 0-8-3-8-7 0-3 2-5 5-5-1-4-5-6-9-5-9 2-14 12-14 22 0 6 3 10 7 12z" fill={fill("w")} />
      <path d="M2 58h60v4H2z" fill="#0a4f78" />
      <path d="M40 26c2-4 9-4 11 1M20 50c-4-12 2-26 14-30" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <g fill="#fff"><circle cx="56" cy="20" r="2" /><circle cx="60" cy="27" r="1.4" /><circle cx="50" cy="13" r="1.2" /></g>
    </svg>
  );
}

/** Botella térmica de hidratación con gotas de frío. */
export function Bottle({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("b")} c={["#5ee8da", INK.ion, "#0f8f84"]} x2={1} y2={0} /><Lin id={id("s")} c={STEEL} x2={1} y2={0} /></defs>
      <path d="M26 3h12v4H26z" fill={fill("s")} /><path d="M36 4c8 0 8 9 2 9" fill="none" stroke="#6b7480" strokeWidth="2.2" />
      <rect x="23" y="7" width="18" height="8" rx="2" fill={INK.graphite} />
      <path d="M21 17q0-2 3-2h16q3 0 3 2l2 6v33q0 5-5 5H24q-5 0-5-5V23z" fill={fill("b")} />
      <rect x="19" y="30" width="26" height="14" fill={INK.graphite} />
      <path d={BOLT} transform="translate(28 31.5) scale(.21)" fill={INK.volt} />
      <path d="M24 22v32" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      <g fill="#fff" opacity=".8"><circle cx="38" cy="50" r="1.2" /><circle cx="35" cy="25" r="1" /><circle cx="40" cy="22" r=".9" /></g>
    </svg>
  );
}

export function Sunglasses({ className }: DecorProps) {
  const { id, fill } = useArt();
  const lens = "M3.5 23h25c0 11.5-4.5 18-12.5 18S3.5 34.5 3.5 23z";
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("l")} c={[INK.plasma, "#ff5fa2", "#ffb347"]} x2={1} y2={1} /></defs>
      <path d="M2 22h60" stroke={INK.graphite} strokeWidth="4" strokeLinecap="round" />
      <path d={lens} fill={fill("l")} stroke={INK.graphite} strokeWidth="2.4" />
      <path d={lens} transform="translate(32 0)" fill={fill("l")} stroke={INK.graphite} strokeWidth="2.4" />
      <path d="M8 29l9-4M40 29l9-4" stroke="#fff" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
      <path d="M28 25q4-3.5 8 0" fill="none" stroke={INK.graphite} strokeWidth="2.6" />
    </svg>
  );
}
