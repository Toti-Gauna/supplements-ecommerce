import { shade } from "@/lib/color";

export function LampPhoto() {
  return (
    <g>
      <rect x="110" y="292" width="180" height="34" rx="8" fill="#c9a77a" />
      <rect x="110" y="292" width="180" height="8" rx="4" fill="#e3c99e" />
      <path d="M128 292V160a72 72 0 0 1 144 0v132Z" fill="#fff7e2" stroke="#e4dccb" strokeWidth="4" />
      <ellipse cx="200" cy="250" rx="60" ry="50" fill="#ffe9a8" opacity=".55" />
      <circle cx="200" cy="200" r="36" fill="#c9a77a" opacity=".55" />
      <ellipse cx="174" cy="176" rx="12" ry="22" fill="#a8845a" opacity=".6" transform="rotate(-20 174 176)" />
      <ellipse cx="226" cy="176" rx="12" ry="22" fill="#a8845a" opacity=".6" transform="rotate(20 226 176)" />
      <path d="M150 292c4-34 24-52 50-52s46 18 50 52Z" fill="#c9a77a" opacity=".5" />
    </g>
  );
}

export function LampPainted() {
  return (
    <g>
      <rect x="100" y="296" width="200" height="30" rx="8" fill="#c9a77a" />
      <path d="M200 96c40 0 64 34 60 80 30 10 44 40 40 70l-6 50H106l-6-50c-4-30 10-60 40-70-4-46 20-80 60-80Z" fill="#f6efe1" stroke="#3d4a2a" strokeWidth="5" />
      <path d="M150 180c20-30 80-30 100 0" fill="none" stroke="#c0503f" strokeWidth="10" strokeLinecap="round" />
      <circle cx="176" cy="150" r="7" fill="#23251d" /><circle cx="224" cy="150" r="7" fill="#23251d" />
      <path d="M130 240c30 20 110 20 140 0" fill="none" stroke="#6f8f5a" strokeWidth="12" strokeLinecap="round" />
      <path d="M140 270c40 12 80 12 120 0" fill="none" stroke="#e3a948" strokeWidth="10" strokeLinecap="round" />
    </g>
  );
}

export function Dachshund() {
  const wood = "#c9a77a";
  return (
    <g>
      <path d="M80 190l40-40 40 20h110l30-34 20 10-4 34 24 20-30 14-20-8-6 64h-24l-6-50H140l-8 50h-24l-6-60-30-10Z" fill={wood} />
      <path d="M120 150l40 20-30 30Zm40 20h110l-60 40Zm110 0 30-34 24 44-34 16Zm-160 40 50 0-24 56Z" fill={shade(wood, -0.15)} />
      <circle cx="316" cy="160" r="5" fill="#23251d" />
    </g>
  );
}

export function FigurePair() {
  const mdf = "#b88b5c";
  return (
    <g fill={mdf}>
      <circle cx="160" cy="110" r="24" />
      <path d="M136 140h48l14 84h-18l-4 100h-16l-4-74-6 74h-16l-4-100h-18Z" />
      <path d="M190 180c30-6 50 4 60 30" stroke={mdf} strokeWidth="5" fill="none" />
      <path d="M232 240c0-20 14-30 34-30h30l14-20 8 24c14 6 18 20 14 34l-4 76h-14l-4-50h-48l-6 50h-14Z" />
      <rect x="110" y="324" width="230" height="10" rx="5" fill={shade(mdf, -0.2)} />
    </g>
  );
}

export function CandlePoodle({ tint = "#f3e6cf" }: { tint?: string }) {
  const dark = shade(tint, -0.12);
  return (
    <g>
      <rect x="110" y="300" width="180" height="28" rx="8" fill="#c9a77a" />
      {[[170, 270, 30], [230, 270, 30], [200, 232, 40], [150, 196, 26], [200, 160, 34], [244, 196, 22], [200, 116, 24]].map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill={i % 2 ? dark : tint} />
      ))}
      <path d="M200 92v-18" stroke="#23251d" strokeWidth="4" />
      <path d="M200 74c-8-10-2-24 0-30 2 6 8 20 0 30Z" fill="#e3a948" />
    </g>
  );
}

export function HomeSpray() {
  return (
    <g>
      <rect x="150" y="150" width="100" height="176" rx="22" fill="#f4f1ea" stroke="#d9d0bf" strokeWidth="4" />
      <rect x="182" y="110" width="36" height="44" rx="6" fill="#3d4a2a" />
      <path d="M218 120h32v14h-32Z" fill="#3d4a2a" />
      <rect x="162" y="200" width="76" height="80" rx="10" fill="#ede0c6" />
      <path d="M182 232l18-14 18 14M182 252l18-14 18 14" stroke="#3d4a2a" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function Diffuser() {
  return (
    <g>
      {[-22, -8, 6, 20].map((a) => <path key={a} d="M200 220V70" stroke="#8a6a44" strokeWidth="5" transform={`rotate(${a} 200 220)`} />)}
      <path d="M150 230c0-20 22-30 50-30s50 10 50 30v80a20 20 0 0 1-20 20h-60a20 20 0 0 1-20-20Z" fill="#cfe0d3" fillOpacity=".8" stroke="#a8bfae" strokeWidth="4" />
      <path d="M152 270h96v40a20 20 0 0 1-20 20h-56a20 20 0 0 1-20-20Z" fill="#e3c99e" opacity=".8" />
      <rect x="176" y="190" width="48" height="18" rx="4" fill="#3d4a2a" />
    </g>
  );
}

export function MdpSign() {
  return (
    <g>
      <rect x="80" y="130" width="240" height="150" rx="18" fill="#fff" stroke="#c9a77a" strokeWidth="8" />
      <text x="200" y="202" textAnchor="middle" fontSize="56" fontWeight="900" fill="#23251d" fontFamily="ui-rounded, system-ui">I ♥</text>
      <text x="200" y="258" textAnchor="middle" fontSize="50" fontWeight="900" fill="#3f7fb5" fontFamily="ui-rounded, system-ui">MDP</text>
    </g>
  );
}
