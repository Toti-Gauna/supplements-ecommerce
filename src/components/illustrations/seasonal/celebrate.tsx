import { useId } from "react";
import type { DecorProps } from "./types";

/** Año Nuevo, San Valentín y Pascuas. */
const HEART = "M32 32C24 27 17 22 17 15.5 17 11 20.5 8 24.5 8c3.5 0 6.5 2.5 7.5 5.5C33 10.5 36 8 39.5 8c4 0 7.5 3 7.5 7.5C47 22 40 27 32 32z";

export function Champagne({ className }: DecorProps) {
  const glass = (rot: number, cx: number) => (
    <g transform={`rotate(${rot} ${cx} 40)`}>
      <path d={`M${cx - 8} 12h16l-2 20a6 6 0 0 1-12 0z`} fill="#f3dca6" />
      <path d={`M${cx - 7.4} 18h14.8`} stroke="#fff" strokeWidth="1.5" opacity=".7" />
      <path d={`M${cx} 38v14M${cx - 6} 54h12`} stroke="#f6f1e8" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {glass(-16, 22)}{glass(16, 42)}
      <path d="M32 2v6M26 5l2 4M38 5l-2 4" stroke="#ffd34d" strokeWidth="2" strokeLinecap="round" />
      <circle cx="21" cy="22" r="1.2" fill="#fff" /><circle cx="44" cy="24" r="1.2" fill="#fff" /><circle cx="42" cy="18" r="1" fill="#fff" />
    </svg>
  );
}

export function Firework({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g strokeWidth="3" strokeLinecap="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((r, i) => <path key={r} transform={`rotate(${r} 32 32)`} d="M32 8v11" stroke={i % 2 ? "#f3dca6" : "#ff7aa8"} />)}
      </g>
      {[22.5, 112.5, 202.5, 292.5].map((r) => <circle key={r} transform={`rotate(${r} 32 32)`} cx="32" cy="10" r="2" fill="#8fd3ff" />)}
      <circle cx="32" cy="32" r="4" fill="#ffd34d" />
    </svg>
  );
}

export function PartyHat({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 8l18 46H14z" fill="#6c4cc4" />
      <circle cx="27" cy="38" r="2.5" fill="#f3dca6" /><circle cx="37" cy="44" r="2.5" fill="#ff7aa8" /><circle cx="33" cy="26" r="2.5" fill="#8fd3ff" /><circle cx="24" cy="48" r="2" fill="#8fd3ff" />
      <rect x="11" y="51" width="42" height="7" rx="3.5" fill="#f3dca6" />
      <circle cx="32" cy="7" r="5" fill="#ff7aa8" />
    </svg>
  );
}

export function Star({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 5l7.6 16.4 17.9 2.1-13.2 12.3 3.5 17.7L32 44.7l-15.8 8.8 3.5-17.7L6.5 23.5l17.9-2.1z" fill="#f3c84c" />
    </svg>
  );
}

export function Heart({ className }: DecorProps) {
  return (
    <svg viewBox="8 4 48 32" aria-hidden="true" className={className}><path d={HEART} fill="#e4577a" /></svg>
  );
}

export function LoveLetter({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect x="6" y="16" width="52" height="36" rx="4" fill="#fbe3e8" />
      <path d="M7 18l25 19 25-19" stroke="#e4a3b4" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      <path d={HEART} fill="#d33a5a" transform="translate(21.3 21) scale(.33)" />
    </svg>
  );
}

export function EasterEgg({ className }: DecorProps) {
  const clip = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <defs><clipPath id={clip}><path d="M32 4c11 0 20 18 20 33s-9 23-20 23-20-8-20-23S21 4 32 4z" /></clipPath></defs>
      <path d="M32 4c11 0 20 18 20 33s-9 23-20 23-20-8-20-23S21 4 32 4z" fill="#ffd36e" />
      <g clipPath={`url(#${clip})`} fill="none" strokeWidth="4" strokeLinejoin="round">
        <path d="M8 26l6 5 6-5 6 5 6-5 6 5 6-5 6 5 6-5" stroke="#f07aa0" />
        <path d="M8 42l6 5 6-5 6 5 6-5 6 5 6-5 6 5 6-5" stroke="#7cc6e8" />
      </g>
      <circle cx="24" cy="18" r="2" fill="#7cc6e8" /><circle cx="40" cy="34" r="2" fill="#a77be0" /><circle cx="24" cy="35" r="2" fill="#a77be0" />
    </svg>
  );
}

export function BunnyEars({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g transform="rotate(-14 22 28)"><ellipse cx="22" cy="26" rx="7.5" ry="20" fill="#f6f1e8" /><ellipse cx="22" cy="28" rx="3.6" ry="14" fill="#f7b6c8" /></g>
      <g transform="rotate(16 42 28)"><ellipse cx="42" cy="26" rx="7.5" ry="20" fill="#f6f1e8" /><ellipse cx="42" cy="28" rx="3.6" ry="14" fill="#f7b6c8" /></g>
      <path d="M8 56q24-16 48 0" stroke="#f7b6c8" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}
