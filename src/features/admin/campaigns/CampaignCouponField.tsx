"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { CLUB_COUPON_PREFIX } from "@/demo/engine/club-claims";
import { GAME_COUPON_PREFIX } from "@/demo/engine/game-prize";
import type { SeasonalTheme } from "@/demo/types";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { CouponForm } from "../CouponForm";

/** Cupón de la campaña: se elige de la lista o se crea acá mismo (queda elegido y atado a la campaña). */
export function CampaignCouponField({ theme, onChange }: { theme: SeasonalTheme; onChange: (code: string) => void }) {
  const coupons = useAdmin((s) => s.data.coupons).filter((c) => !c.code.startsWith("RULETA") && !c.code.startsWith(GAME_COUPON_PREFIX) && !c.code.startsWith(CLUB_COUPON_PREFIX));
  const [creating, setCreating] = useState(false);
  const current = coupons.find((c) => c.code === theme.couponCode);
  const detail = current
    ? [current.type === "PERCENT" ? `${current.value} % de descuento` : current.type === "FIXED" ? `${formatARS(current.value)} de descuento` : "Envío gratis",
      current.minSubtotal ? `desde ${formatARS(current.minSubtotal)}` : "sin mínimo", current.active === false ? "pausado: la campaña sale sin oferta" : null].filter(Boolean).join(" · ")
    : "Ese cupón ya no existe: elegí otro o creá uno.";
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="cp-campaign" className="text-sm font-bold">Cupón de la campaña</label>
      <div className="flex flex-wrap gap-2">
        <Select id="cp-campaign" value={theme.couponCode} onChange={(e) => onChange(e.target.value)} aria-describedby="cp-campaign-hint" className="min-w-0 flex-1 basis-56">
          {!current && <option value={theme.couponCode}>{theme.couponCode} (no existe)</option>}
          {coupons.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.description}{c.active === false ? " (pausado)" : ""}</option>)}
        </Select>
        {!creating && <Button variant="secondary" size="sm" onClick={() => setCreating(true)} className="min-h-11"><Plus size={16} aria-hidden="true" />Crear cupón</Button>}
      </div>
      <p id="cp-campaign-hint" className="text-xs text-muted">{detail}. Las condiciones se cambian en <Link href="/admin-demo/cupones/lista/" className="font-bold underline">Cupones</Link>.</p>
      {creating && <CouponForm themeId={theme.id} onCreated={onChange} onDone={() => setCreating(false)} />}
    </div>
  );
}
