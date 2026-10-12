import { BOLT, INK, Lin, Rad, STEEL, useArt, type DecorProps } from "./paint";

/** Fiestas: Halloween (calabaza musculosa, murciélago, cuernitos), Navidad y Año Nuevo. */
export function MusclePumpkin({ className }: DecorProps) {
  const { id, fill } = useArt();
  const arm = <path d="M17 44c-7 0-11.5-3-12-9-.4-4.6 1.6-8.4 4-11.6M9.5 23.5c-2.2-1.6-2.4-5.6.8-6.6 3-1 5 1.2 4.6 4" fill="none" stroke="#d9600c" strokeWidth="6.5" strokeLinecap="round" />;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("p")} c={["#ffc070", "#ff8a1f", "#b8470a"]} cy={0.3} /></defs>
      {arm}<g transform="translate(64 0) scale(-1 1)">{arm}</g>
      <circle cx="7.6" cy="31" r="5" fill="#ff9a35" /><circle cx="56.4" cy="31" r="5" fill="#ff9a35" />
      <path d="M33 21c0-5 2-8 6-9" fill="none" stroke="#3f7a1e" strokeWidth="3.4" strokeLinecap="round" />
      <ellipse cx="22" cy="41" rx="11" ry="16" fill={fill("p")} /><ellipse cx="42" cy="41" rx="11" ry="16" fill={fill("p")} />
      <ellipse cx="32" cy="41" rx="12" ry="17.5" fill={fill("p")} />
      <path d="M32 24.5v33M22 26c-3 9-3 21 0 30M42 26c3 9 3 21 0 30" fill="none" stroke="#b8470a" strokeOpacity=".5" strokeWidth="1.2" />
      <path d="M14 30q18-8 36 0l-1 4.5q-17-7-34 0z" fill={INK.volt} />
      <path d="M19 40l5-5 5 5zM35 40l5-5 5 5z" fill="#ffe680" />
      <path d="M20 47l4 4 4-3 4 4 4-4 4 3 4-4-2 6H22z" fill="#ffe680" />
    </svg>
  );
}

export function Bat({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 26c-3 0-4-3-4-6l2.5 2h3l2.5-2c0 3-1 6-4 6zM29 27c-9-9-19-10-27-4 6 1 8 5 7 10 4-3 8-3 10 1 2-4 6-5 9-3zM35 27c9-9 19-10 27-4-6 1-8 5-7 10-4-3-8-3-10 1-2-4-6-5-9-3z" fill="#1a1124" stroke={INK.plasma} strokeOpacity=".55" strokeWidth=".8" />
      <ellipse cx="32" cy="32" rx="5" ry="8" fill="#1a1124" />
      <circle cx="30.2" cy="24" r="1.1" fill="#ff8a1f" /><circle cx="33.8" cy="24" r="1.1" fill="#ff8a1f" />
    </svg>
  );
}

export function Horns({ className }: DecorProps) {
  const { id, fill } = useArt();
  const horn = <path d="M14 46C10 36 9 22 16 9c1 9 6 17 13 25z" fill={fill("h")} />;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("h")} c={["#ffb070", "#ff5a1f", "#a3200a"]} /></defs>
      {horn}<g transform="translate(64 0) scale(-1 1)">{horn}</g>
      <path d="M6 48q26-14 52 0l-1.5 6q-24.5-12-49 0z" fill={INK.volt} />
      <path d="M15 14c-2 6-3 13-1.6 20" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SantaHat({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("r")} c={["#ff5a52", "#d61f2c", "#8f0d18"]} /></defs>
      <path d="M10 46C12 28 22 10 38 8c9-1 15 6 16 16-5-6-10-8-14-6 2 8 4 18 4 28z" fill={fill("r")} />
      <path d="M18 40c2-12 8-24 18-29" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="43" width="45" height="12" rx="6" fill="#f6f8fb" />
      <path d={BOLT} transform="translate(23.5 44.5) scale(.17)" fill={INK.volt} />
      <circle cx="54" cy="27" r="6.5" fill="#f6f8fb" />
    </svg>
  );
}

/** Bola del arbolito que es un disco de pesas (con su gancho dorado). */
export function Ornament({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Rad id={id("p")} c={["#ff7b72", "#d6262f", "#7a0c14"]} /><Lin id={id("s")} c={STEEL} /></defs>
      <path d="M32 2a5 5 0 1 1 0 8" fill="none" stroke="#ffd34d" strokeWidth="1.6" />
      <rect x="27" y="9" width="10" height="6" rx="1.5" fill="#ffd34d" />
      <circle cx="32" cy="38" r="23" fill={fill("p")} />
      <circle cx="32" cy="38" r="17" fill="none" stroke="#000" strokeOpacity=".25" strokeWidth="1.2" />
      <circle cx="32" cy="38" r="7.5" fill={fill("s")} /><circle cx="32" cy="38" r="3.6" fill="#0b0e13" />
      <path d="M15 31a18 18 0 0 1 9-9" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Arbolito de discos: un pin de carga con discos verdes de mayor a menor y el rayo de VOLTA como estrella. */
export function PlateTree({ className }: DecorProps) {
  const { id, fill } = useArt();
  const discs = [[52, 26], [42, 20.5], [32.5, 15], [23.5, 9.5]] as const;
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><Lin id={id("g")} c={["#3ccf78", "#1a8a4a", "#0c4d29"]} x2={1} y2={0} /><Lin id={id("s")} c={STEEL} x2={1} y2={0} /></defs>
      <rect x="30" y="16" width="4" height="46" rx="1.5" fill={fill("s")} />
      {discs.map(([y, rx], i) => (
        <g key={i}>
          <path d={`M${32 - rx} ${y}v4a${rx} 3.6 0 0 0 ${rx * 2} 0v-4z`} fill={fill("g")} />
          <ellipse cx="32" cy={y} rx={rx} ry="3.6" fill="#4be08a" />
          <ellipse cx="32" cy={y} rx="3" ry="1" fill="#0b0e13" />
          {[-0.62, 0.1, 0.7].map((k, j) => <circle key={j} cx={32 + rx * k} cy={y + 2.6 + j % 2} r="1.3" fill={["#ffd34d", "#ff5a52", INK.voltSoft][(i + j) % 3]} />)}
        </g>
      ))}
      <path d={BOLT} transform="translate(26.5 0) scale(.23)" fill="#ffd34d" />
    </svg>
  );
}

export function Snowflake({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {([["#5b8db0", 4.4, 0.55], ["#eaf6ff", 2.6, 1]] as const).map(([c, w, o]) => (
        <g key={c} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" opacity={o}>
          {[0, 60, 120].map((r) => <path key={r} d="M32 5v54" transform={`rotate(${r} 32 32)`} />)}
          {[0, 60, 120, 180, 240, 300].map((r) => <path key={r} d="M25 12l7 6 7-6M27 21l5 4 5-4" transform={`rotate(${r} 32 32)`} />)}
        </g>
      ))}
      <circle cx="32" cy="32" r="3.4" fill={INK.ion} />
    </svg>
  );
}

export function Firework({ className }: DecorProps) {
  const colors = [INK.volt, INK.plasma, INK.ion, "#ff7aa8"];
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g strokeLinecap="round">
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={i % 2 ? "M32 10v8" : "M32 4v13"} stroke={colors[i % 4]} strokeWidth={i % 2 ? 2 : 3} transform={`rotate(${i * 30} 32 32)`} />)}
      </g>
      {Array.from({ length: 6 }, (_, i) => <circle key={i} cx="32" cy="9" r="1.6" fill="#fff" transform={`rotate(${15 + i * 60} 32 32)`} />)}
      <circle cx="32" cy="32" r="5" fill="#fff" /><circle cx="32" cy="32" r="3" fill={INK.volt} />
    </svg>
  );
}

export function PartyHat({ className }: DecorProps) {
  const { id, fill } = useArt();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs>
        <Lin id={id("c")} c={["#a594ff", "#5a3fe6", "#2a1d8f"]} x2={1} y2={0.3} />
        <clipPath id={id("k")}><path d="M32 9l19 46H13z" /></clipPath>
      </defs>
      <path d="M32 9l19 46H13z" fill={fill("c")} />
      <path d="M20 20l26 10.5M12 32l38 15.4M6 44l38 15.4" stroke={INK.volt} strokeWidth="3.4" clipPath={`url(#${id("k")})`} />
      <path d="M13 55h38" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M32 0c.8 5 2.4 7 7 8-4.6 1-6.2 3-7 8-.8-5-2.4-7-7-8 4.6-1 6.2-3 7-8z" fill={INK.voltSoft} />
    </svg>
  );
}
