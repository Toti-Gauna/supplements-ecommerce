"use client";
import { Copy } from "lucide-react";
import type { CSSProperties } from "react";
import { RewardGlyph, glyphFor, shortValue } from "@/components/illustrations/RewardGlyph";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import type { Coupon, GiftOccasion } from "@/demo/types";
import { formatDate } from "@/lib/date";
import { useToasts } from "@/stores/toast";
import { occasionColors } from "../gifts/occasion";
import { SKINS } from "../themes/skins";

/**
 * Cupón ganado en la ruleta, con estética de ticket y la ropa de la festividad vigente (colores y decoraciones de la
 * temática; sin temática, el de Volta en noche y bronce). Talón con el valor, perforación y el detalle con el código.
 */
export function ThemedCoupon({ coupon, label, occasion }: { coupon: Coupon | undefined; label: string; occasion: GiftOccasion }) {
  const toast = useToasts((s) => s.push);
  const c = occasionColors(occasion);
  const decor = occasion === "volta" ? [] : SKINS[occasion].decor.slice(0, 3);
  const value = coupon ? shortValue(coupon.type, coupon.value, coupon.description) : label;
  const code = coupon?.code ?? "";
  const copy = () => { void navigator.clipboard?.writeText(code).then(() => toast({ tone: "success", title: "Código copiado", description: code }), () => {}); };
  return (
    <div className="themed-coupon relative w-[min(88vw,420px)] text-left" style={{ "--c-from": c.from, "--c-to": c.to, "--c-accent": c.accent, "--c-ink": c.ink } as CSSProperties}>
      <div className="relative flex min-h-[9.5rem] overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,var(--c-from),var(--c-to))] text-[#f6f1e8] shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)] ring-1 ring-white/15">
        {/* Talón: valor grande sobre un guilloché del color de acento y las decoraciones de la fecha. */}
        <div className="relative grid w-[38%] shrink-0 place-items-center overflow-hidden bg-black/25 px-2 py-4 text-center">
          <svg aria-hidden="true" viewBox="0 0 120 150" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-35">
            {Array.from({ length: 7 }, (_, i) => <circle key={i} cx="60" cy="75" r={14 + i * 10} fill="none" stroke="var(--c-accent)" strokeWidth=".7" />)}
            {Array.from({ length: 10 }, (_, i) => <ellipse key={`e${i}`} cx="60" cy="75" rx="56" ry="17" fill="none" stroke="var(--c-accent)" strokeWidth=".45" transform={`rotate(${i * 18} 60 75)`} />)}
          </svg>
          {decor.map((d, i) => (
            <span key={d + i} aria-hidden="true" className={`absolute ${["-left-1 -top-1 h-9 w-9 -rotate-12", "-bottom-2 -right-1 h-10 w-10 rotate-12", "bottom-2 left-1 h-6 w-6 rotate-6 opacity-80"][i]}`}><Decor kind={d} className="h-full w-full" /></span>
          ))}
          <span className="relative flex flex-col items-center gap-1">
            {coupon && <RewardGlyph kind={glyphFor(coupon.type, coupon.description)} size={34} color="var(--c-accent)" />}
            <span className="font-display text-[clamp(1.6rem,7vw,2.1rem)] leading-none" style={{ color: "var(--c-accent)" }}>{value}</span>
            {coupon?.type === "PERCENT" && <span className="text-[10px] font-bold tracking-[0.24em]">OFF</span>}
          </span>
        </div>
        <div aria-hidden="true" className="relative w-0">
          <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-[#07080a]" />
          <span className="absolute -bottom-3 -left-3 h-6 w-6 rounded-full bg-[#07080a]" />
          <span className="absolute inset-y-4 left-0 border-l-2 border-dashed border-white/30" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4 pl-5">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em]">Cupón de la ruleta</p>
            <p className="mt-1 font-bold leading-snug">{coupon?.description ?? label}</p>
            <p className="mt-1 text-xs">{coupon?.endsAt ? `Vence ${formatDate(coupon.endsAt)} · ` : ""}1 uso</p>
          </div>
          {code && (
            <button type="button" onClick={copy} aria-label={`Copiar código ${code}`}
              className="flex w-full items-center justify-between gap-2 rounded-xl border border-dashed border-white/45 bg-black/20 px-3 py-2 font-mono text-[15px] font-extrabold tracking-wider hover:bg-black/30">
              <span className="truncate">{code}</span> <Copy size={15} aria-hidden="true" className="shrink-0" />
            </button>
          )}
        </div>
        <span aria-hidden="true" className="coupon-shine pointer-events-none absolute inset-0" />
      </div>
    </div>
  );
}
