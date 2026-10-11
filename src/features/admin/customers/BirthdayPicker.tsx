"use client";
import { useState } from "react";

export const MONTHS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export const birthdayText = (mmdd?: string) => (mmdd ? `${Number(mmdd.slice(3))} de ${MONTHS[Number(mmdd.slice(0, 2)) - 1]}` : "Sin cumpleaños");

/** Días por mes para un cumpleaños sin año (febrero hasta el 28: el 29 no existe todos los años). */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

/** Cumpleaños sin año: día y mes por separado; se guarda recién cuando están los dos. */
export function BirthdayPicker({ id, value, onChange }: { id: string; value: string; onChange: (mmdd: string) => void }) {
  const [draft, setDraft] = useState<{ m: string; d: string } | null>(null);
  const m = draft?.m ?? value.slice(0, 2);
  const d = draft?.d ?? value.slice(3);
  const max = m ? MONTH_DAYS[Number(m) - 1]! : 31;
  const set = (mm: string, dd: string) => {
    const day = dd && Number(dd) > (mm ? MONTH_DAYS[Number(mm) - 1]! : 31) ? "" : dd;
    if (mm && day) { setDraft(null); if (`${mm}-${day}` !== value) onChange(`${mm}-${day}`); }
    else if (!mm && !day) { setDraft(null); if (value) onChange(""); }
    else setDraft({ m: mm, d: day });
  };
  const cls = "h-12 rounded-2xl border border-ink/12 bg-surface px-3 font-semibold";
  return (
    <span className="flex gap-2">
      <label htmlFor={`${id}-d`} className="sr-only">Día del cumpleaños</label>
      <select id={`${id}-d`} value={d} onChange={(e) => set(m, e.target.value)} className={`${cls} w-20`}>
        <option value="">Día</option>
        {Array.from({ length: max }, (_, i) => String(i + 1).padStart(2, "0")).map((x) => <option key={x} value={x}>{Number(x)}</option>)}
      </select>
      <label htmlFor={`${id}-m`} className="sr-only">Mes del cumpleaños</label>
      <select id={`${id}-m`} value={m} onChange={(e) => set(e.target.value, d)} className={`${cls} min-w-0 flex-1`}>
        <option value="">Mes</option>
        {MONTHS.map((x, i) => <option key={x} value={String(i + 1).padStart(2, "0")}>{x}</option>)}
      </select>
    </span>
  );
}

