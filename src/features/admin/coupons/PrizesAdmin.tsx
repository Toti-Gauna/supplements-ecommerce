"use client";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { prizeCondition, PRIZE_TEMPLATES } from "@/demo/admin/wheel-prizes";
import { useAdmin } from "@/stores/admin";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";
import { COUPONS_SECTION } from "./CouponsHub";
import { PrizeDialog } from "./PrizeDialog";

/** Premios disponibles (8.3.25): el catálogo que se elige en cada gajo. Los premios no se borran: su ID queda estable. */
export function PrizesAdmin() {
  const { prizes = [], segments } = useAdmin((s) => s.data.wheel);
  const [adding, setAdding] = useState(false);
  return (
    <>
      <SubpageHeader trail={[MARKETING, COUPONS_SECTION]} back={COUPONS_SECTION} title="Premios disponibles"
        intro="Cada premio se entrega como cupón de un uso con vencimiento. Los gajos de la ruleta eligen de esta lista."
        actions={<Button onClick={() => setAdding(true)}><Plus size={18} aria-hidden="true" /> Agregar premio</Button>} />
      <ul aria-label="Catálogo de premios" className="grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
        {prizes.map((p) => {
          const uses = segments.filter((s) => s.prizeId === p.id);
          return (
            <li key={p.id} className="flex flex-col gap-2 rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)]">
              <div className="flex flex-wrap items-center gap-2"><p className="text-lg font-extrabold">{p.name}</p><Badge>{PRIZE_TEMPLATES.find((t) => t.id === p.template)?.label}</Badge></div>
              <p className="text-sm text-muted">Cupón de un uso, {prizeCondition(p)}.</p>
              <p className="text-sm">{uses.length ? <>En la ruleta: <strong>{uses.length} {uses.length === 1 ? "gajo" : "gajos"}</strong>{uses.some((s) => !s.active) ? " (alguno pausado)" : ""}</> : <span className="text-muted">Todavía no está en ningún gajo.</span>}</p>
            </li>
          );
        })}
      </ul>
      <PrizeDialog open={adding} onClose={() => setAdding(false)} />
    </>
  );
}
