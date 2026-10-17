"use client";
import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { brand } from "@/config/brand";
import { storeHours, storeHoursConfirmed } from "@/demo/fixtures/store";
import { cn } from "@/lib/cn";
import { whatsappLink, whatsappMessage } from "@/lib/whatsapp";
import { useDemoData } from "@/stores/admin";

const SHORTCUTS = [
  { href: "/arrepentimiento/", label: "Botón de arrepentimiento" },
  { href: "/cuenta/", label: "Seguí tu pedido en Mi cuenta" },
  { href: "/crear/quiz/", label: "¿Qué necesitás? Hacé el quiz" },
];

/**
 * Placa de contacto de la ayuda (banda noche en los dos modos): "Preguntale al local" por WhatsApp con el mensaje ya
 * escrito, los horarios del local y atajos a lo que más se busca. No reemplaza el flujo de compra.
 */
export function HelpContact({ className }: { className?: string }) {
  useDemoData((d) => d.settings.whatsappNumber); // re-render si cambia el número en el panel
  return (
    <aside aria-labelledby="help-contact-title" className={cn("floor led-dark relative overflow-hidden border border-white/10 p-5 text-on-night", className)}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-volt" />
      <p className="eyebrow text-volt">Mostrador</p>
      <h2 id="help-contact-title" className="font-display mt-2 text-3xl leading-none">¿No está tu pregunta?</h2>
      <p className="mt-2 text-sm text-night-muted">Preguntale al local: te responde una persona del box, no un bot.</p>
      <a href={whatsappLink(whatsappMessage({ page: "ayuda" }))} target="_blank" rel="noopener noreferrer"
        className="mt-4 flex min-h-12 items-center justify-center gap-2 bg-volt px-4 font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-night shadow-[inset_0_-3px_0_rgb(0_0_0/0.28)] hover:bg-volt-soft">
        <MessageCircle size={18} aria-hidden="true" /> Preguntale al local por WhatsApp
      </a>
      <dl className="mt-4 border-t border-white/10 pt-3 font-mono text-[12px]">
        {storeHours.map((h) => (
          <div key={h.days} className="flex justify-between gap-3 py-1"><dt className="text-night-muted">{h.days}</dt><dd>{h.time}</dd></div>
        ))}
      </dl>
      {!storeHoursConfirmed && <p className="font-mono text-[10.5px] text-night-muted">Horarios de muestra · {brand.city}</p>}
      <ul className="mt-4 flex flex-col border-t border-white/10 pt-2">
        {SHORTCUTS.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className="flex min-h-11 items-center justify-between gap-2 text-sm text-on-night hover:text-volt">
              {s.label}<ArrowUpRight size={16} aria-hidden="true" className="shrink-0 text-volt" />
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
