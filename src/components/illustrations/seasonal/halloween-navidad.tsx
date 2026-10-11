import type { DecorProps } from "./types";

/** Halloween y Navidad: sombrero de bruja, calabaza, murciélago, fantasma, gorro, árbol, adorno, regalo y copo. */
export function WitchHat({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <ellipse cx="32" cy="51" rx="28" ry="7" fill="#2a1838" />
      <path d="M17 50C22 37 26 23 30 15c3-7 10-10 17-7-5 1-8 5-9 11 0 11 4 21 8 31z" fill="#41275a" />
      <path d="M19 44.5q13 4 26 0l1.6 5.2Q32 54 17.6 49.7z" fill="#ff8a1f" />
      <rect x="28" y="43.6" width="8.4" height="7.4" rx="1.6" fill="none" stroke="#ffd34d" strokeWidth="2" />
      <path d="M46 8l2-3M48.5 9.5l3.5-1" stroke="#ffd34d" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Pumpkin({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 19c-1-6 1-10 6-12" stroke="#4f6b2a" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <path d="M36 12c5-4 11-3 13 1-5 2-9 1-13-1z" fill="#6c8f34" />
      <ellipse cx="20" cy="39" rx="13" ry="17" fill="#d8641a" />
      <ellipse cx="44" cy="39" rx="13" ry="17" fill="#d8641a" />
      <ellipse cx="32" cy="39" rx="12.5" ry="18.5" fill="#f4892a" />
      <path d="M22 33l5 5h-8zM42 33l3 5h-8z" fill="#3a1a08" />
      <path d="M19 45q13 9 26 0l-3 4-3-2-3 3-4-3-3 3-3-3-3 2z" fill="#3a1a08" />
    </svg>
  );
}

export function Bat({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 27c-3 0-5 2-6 4-4-5-11-7-21-5 5 3 6 7 5 11 3-2 7-2 9 1 2-3 6-3 8 0 1 2 3 3 5 3s4-1 5-3c2-3 6-3 8 0 2-3 6-3 9-1-1-4 0-8 5-11-10-2-17 0-21 5-1-2-3-4-6-4z" fill="#241631" />
      <path d="M28.5 28l-1-6 3.5 4zM35.5 28l1-6-3.5 4z" fill="#241631" />
      <circle cx="30" cy="31" r="1.3" fill="#ffd34d" /><circle cx="34" cy="31" r="1.3" fill="#ffd34d" />
    </svg>
  );
}

export function Ghost({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M15 56V30a17 17 0 0 1 34 0v26l-5.5-4.5-5.5 4.5-6-4.5-6 4.5-5.5-4.5z" fill="#f6f1e8" />
      <ellipse cx="26" cy="31" rx="3" ry="4" fill="#241631" /><ellipse cx="38" cy="31" rx="3" ry="4" fill="#241631" />
      <ellipse cx="32" cy="41" rx="3.5" ry="4.5" fill="#241631" />
    </svg>
  );
}

export function SantaHat({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M12 46c2-18 14-32 28-32 10 0 16 8 15 18-4-6-9-8-13-6 4 6 6 13 6 20z" fill="#d33a32" />
      <rect x="8" y="42" width="44" height="12" rx="6" fill="#f6f1e8" />
      <circle cx="55" cy="34" r="6.5" fill="#f6f1e8" />
    </svg>
  );
}

export function Tree({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="28" y="52" width="8" height="9" rx="1.5" fill="#7a4a26" />
      <path d="M32 8l14 19h-7l11 14h-8l11 13H11l11-13h-8l11-14h-7z" fill="#2f7a4a" />
      <path d="M32 2l1.8 3.7 4 .6-2.9 2.8.7 4L32 11.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" fill="#f3c84c" />
      <circle cx="28" cy="24" r="2.2" fill="#e5544a" /><circle cx="38" cy="36" r="2.2" fill="#f3c84c" />
      <circle cx="24" cy="44" r="2.2" fill="#f3c84c" /><circle cx="41" cy="48" r="2.2" fill="#e5544a" /><circle cx="31" cy="38" r="2" fill="#f6f1e8" />
    </svg>
  );
}

export function Ornament({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 2v10" stroke="#c9a24f" strokeWidth="2" />
      <rect x="26.5" y="10" width="11" height="8" rx="2" fill="#c9a24f" />
      <circle cx="32" cy="39" r="21" fill="#d33a32" />
      <path d="M12 36q20 9 40 0M13 45q19 8 38 0" stroke="#f3dca6" strokeWidth="3" fill="none" />
      <ellipse cx="23" cy="29" rx="4" ry="6.5" fill="#fff" opacity=".35" transform="rotate(32 23 29)" />
    </svg>
  );
}

export function Gift({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="10" y="27" width="44" height="31" rx="3" fill="#d33a32" />
      <rect x="7" y="19" width="50" height="10" rx="3" fill="#e5544a" />
      <rect x="28" y="19" width="8" height="39" fill="#f3dca6" />
      <path d="M32 19c-6-11-17-11-15-3 1 4 8 3 15 3zm0 0c6-11 17-11 15-3-1 4-8 3-15 3z" fill="#f3dca6" />
    </svg>
  );
}

export function Snowflake({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g stroke="#eaf4ff" strokeWidth="3.5" strokeLinecap="round" fill="none">
        {[0, 60, 120].map((r) => <path key={r} transform={`rotate(${r} 32 32)`} d="M32 6v52M32 15l-6-6M32 15l6-6M32 49l-6 6M32 49l6 6" />)}
      </g>
    </svg>
  );
}
