import { useId } from "react";
import type { DecorProps } from "./types";

/** Día del Animal, Hot Sale, Black Friday, días de la Madre, del Padre, del Amigo y del Niño. */
export function Tulip({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 34v26" stroke="#4f7a35" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 52c-10-2-15-10-15-17 9 2 13 9 15 17zM32 56c8-2 12-8 12-14-7 2-10 7-12 14z" fill="#5f8f3f" />
      <path d="M19 12c4 4 7 6 9 5 1-4 4-7 4-7s3 3 4 7c2 1 5-1 9-5 2 11 0 24-13 24S17 23 19 12z" fill="#e4577a" />
      <path d="M32 10c-3 6-3 16 0 26 3-10 3-20 0-26z" fill="#f07a98" />
    </svg>
  );
}

export function Paw({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g fill="#f3dca6">
        <path d="M32 30c-9 0-17 11-17 18 0 6 5 8 9 7 3-1 5-2 8-2s5 1 8 2c4 1 9-1 9-7 0-7-8-18-17-18z" />
        <ellipse cx="14" cy="27" rx="5.5" ry="7" transform="rotate(-20 14 27)" /><ellipse cx="25" cy="15" rx="5.5" ry="7.5" transform="rotate(-6 25 15)" />
        <ellipse cx="39" cy="15" rx="5.5" ry="7.5" transform="rotate(6 39 15)" /><ellipse cx="50" cy="27" rx="5.5" ry="7" transform="rotate(20 50 27)" />
      </g>
    </svg>
  );
}

export function Bone({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <g fill="#f6f1e8" transform="rotate(-30 32 32)">
        <rect x="15" y="27" width="34" height="10" rx="3" /><circle cx="14" cy="26" r="7" /><circle cx="14" cy="38" r="7" /><circle cx="50" cy="26" r="7" /><circle cx="50" cy="38" r="7" />
      </g>
    </svg>
  );
}

export function Flame({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 3c4 10 17 17 17 34a17 17 0 0 1-34 0c0-8 4-13 7-17 0 6 3 9 6 9-2-9 1-19 4-26z" fill="#ff6a2b" />
      <path d="M32 30c2 5 9 8 9 16a9 9 0 0 1-18 0c0-5 4-8 4-11 1 3 2 4 3 4 0-3 1-6 2-9z" fill="#ffd34d" />
    </svg>
  );
}

export function PriceTag({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M34 5h21a4 4 0 0 1 4 4v21L31 58a4 4 0 0 1-5.7 0L6 38.7a4 4 0 0 1 0-5.7z" fill="#f6f1e8" />
      <circle cx="48" cy="16" r="4" fill="#111214" />
      <text x="30" y="40" fontSize="19" fontWeight="800" textAnchor="middle" fill="#111214" fontFamily="system-ui, sans-serif" transform="rotate(-45 30 34)">%</text>
    </svg>
  );
}

export function Bag({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M24 20v-4a8 8 0 0 1 16 0v4" stroke="#f3dca6" strokeWidth="3.5" fill="none" />
      <path d="M12 20h40l-3 38H15z" fill="#2b2b30" stroke="#f3dca6" strokeWidth="2" />
      <text x="32" y="45" fontSize="12" fontWeight="900" textAnchor="middle" fill="#f3dca6" fontFamily="system-ui, sans-serif">SALE</text>
    </svg>
  );
}

export function Tie({ className }: DecorProps) {
  const clip = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M25 6h14l-3 9h-8z" fill="#1d3557" />
      <defs><clipPath id={clip}><path d="M28 15h8l7 33-11 12-11-12z" /></clipPath></defs>
      <path d="M28 15h8l7 33-11 12-11-12z" fill="#2f5d8a" />
      <g clipPath={`url(#${clip})`} stroke="#e9c27a" strokeWidth="3"><path d="M18 30l28-12M18 42l28-12M18 54l28-12" /></g>
    </svg>
  );
}

export function Mustache({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 30c-4-6-12-8-18-3-4 3-6 9-11 9 5 7 15 7 21 3 4-2 6-5 8-6 2 1 4 4 8 6 6 4 16 4 21-3-5 0-7-6-11-9-6-5-14-3-18 3z" fill="#3a2a1e" />
    </svg>
  );
}

export function Fedora({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M4 46c9 7 47 7 56 0-6-2-10-4-15-4H19c-5 0-9 2-15 4z" fill="#3a3f47" />
      <path d="M17 45c0-13 2-25 7-27 3-1 5 2 8 2s5-3 8-2c5 2 7 14 7 27z" fill="#4a515b" />
      <path d="M17.4 37h29.2l.3 7H17.1z" fill="#e9c27a" />
    </svg>
  );
}

export function Mate({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M46 3l-9 25" stroke="#c9ccd1" strokeWidth="3" strokeLinecap="round" />
      <path d="M18 27h28c2 8 4 13 4 19 0 8-8 13-18 13s-18-5-18-13c0-6 2-11 4-19z" fill="#8a5a34" />
      <rect x="15" y="22" width="34" height="6" rx="3" fill="#c9a24f" />
      <ellipse cx="32" cy="22.5" rx="14" ry="3" fill="#5d8a3a" />
      <path d="M22 40q10 6 20 0" stroke="#a87449" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function Balloon({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M32 3c11 0 18 9 18 19 0 12-10 21-18 23-8-2-18-11-18-23C14 12 21 3 32 3z" fill="#ef5b5b" />
      <path d="M29 45h6l-3 4z" fill="#d94848" />
      <path d="M32 49c-4 4 4 7 0 12" stroke="#f6f1e8" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <ellipse cx="25" cy="16" rx="3" ry="5.5" fill="#fff" opacity=".4" transform="rotate(25 25 16)" />
    </svg>
  );
}

export function Kite({ className }: DecorProps) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <path d="M30 3l16 18-16 22-16-22z" fill="#ffd34d" />
      <path d="M30 3v40M14 21h32" stroke="#e88a1f" strokeWidth="2" />
      <path d="M30 3l16 18H30zM30 21v22l-16-22z" fill="#4fb3e8" />
      <path d="M30 43q-6 6 0 10t2 9" stroke="#f6f1e8" strokeWidth="1.6" fill="none" />
      <path d="M26 50l4 2-4 2zM32 57l4 2-4 2z" fill="#ef5b5b" />
    </svg>
  );
}
