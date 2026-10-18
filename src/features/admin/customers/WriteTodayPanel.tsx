"use client";
import Link from "next/link";
import { Link2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button, buttonClass } from "@/components/atoms/Button";
import { brand } from "@/config/brand";
import { runOutLine } from "@/demo/admin/repurchase-text";
import { writeLink, writeMessage, writeToday, type WriteToday } from "@/demo/admin/repurchase-today";
import { plural } from "@/lib/plural";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { profileHref } from "./Reminders";
import { shopUrl } from "./shopUrl";
import { useCustomerViews } from "./useCustomerViews";

const VISIBLE = 3;

function Person({ w }: { w: WriteToday }) {
  const notify = useAdmin((s) => s.notifyRepurchase);
  const push = useToasts((s) => s.push);
  const link = w.lines.length ? shopUrl(w.path) : undefined;
  const wa = writeLink(w, brand.name, link);
  const copy = async () => {
    try { await navigator.clipboard.writeText(link!); push({ tone: "success", title: "Link del bolso copiado", description: "Al abrirlo, la tienda carga los mismos productos que compró." }); }
    catch { push({ tone: "error", title: "No se pudo copiar", description: link }); }
  };
  const sent = () => { for (const i of w.items) notify(i, "whatsapp"); push({ tone: "success", title: "WhatsApp listo para mandar", description: "Se abrió con el mensaje escrito y quedó anotado que le avisaste." }); };
  return (
    <li data-write={w.email} className="plate flex flex-col gap-2 rounded-sm p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <Link href={profileHref(w.email)} className="font-bold hover:underline">{w.name}</Link>
        <span className="text-xs text-muted">{w.phone ?? "Sin teléfono"}</span>
      </div>
      <ul className="text-sm">{w.items.map((i) => <li key={i.key} className={i.inDays < 0 ? "font-semibold text-danger" : ""}><strong>{i.product}</strong>: {runOutLine(i).toLowerCase()}</li>)}</ul>
      <p className="rounded-sm bg-bg p-3 text-sm text-muted">{writeMessage(w, brand.name, link)}</p>
      <div className="flex flex-wrap gap-2">
        {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" onClick={sent} aria-label={`WhatsApp a ${w.name}: ${plural(w.items.length, "pote", "potes")} (se abre en otra pestaña)`} className={buttonClass("primary", "sm", "min-h-10 px-3.5")}><MessageCircle size={15} aria-hidden="true" />Escribirle por WhatsApp</a>
          : <p className="text-sm text-muted">No tiene teléfono cargado: avisale por email desde su ficha.</p>}
        {link && <Button variant="secondary" size="sm" className="min-h-10 px-3.5" onClick={copy}><Link2 size={15} aria-hidden="true" />Copiar el link del bolso</Button>}
      </div>
    </li>
  );
}

/**
 * "A quién escribirle hoy" (R4c): arriba de Clientes. Una tarjeta por persona con lo que se le termina (calculado con los
 * servicios del envase), el mensaje ya escrito y dos botones: WhatsApp y el link a la tienda con el bolso ya cargado.
 */
export function WriteTodayPanel() {
  const views = useCustomerViews();
  const profiles = useAdmin((s) => s.workshop.profiles);
  const products = useAdmin((s) => s.data.products);
  const [all, setAll] = useState(false);
  const list = writeToday(views, profiles, products);
  if (!list.length) return null;
  const shown = all ? list : list.slice(0, VISIBLE);
  return (
    <section aria-labelledby="escribir-hoy" className="mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="escribir-hoy" className="font-display text-2xl sm:text-3xl">A quién escribirle hoy</h2>
        <p className="text-sm text-muted">{plural(list.length, "persona", "personas")} a las que se les termina o se les terminó el pote. Orientativo.</p>
      </div>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 lg:grid-cols-3">{shown.map((w) => <Person key={w.email} w={w} />)}</ul>
      {list.length > VISIBLE && <Button variant="secondary" size="sm" className="self-start" aria-expanded={all} onClick={() => setAll((v) => !v)}>{all ? "Ver menos" : `Ver las ${list.length} personas`}</Button>}
    </section>
  );
}
