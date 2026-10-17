import { ArrowRight, Ticket } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { BoothArt } from "./BoothArt";

interface Props {
  eyebrow: string;
  title: string;
  children: ReactNode;
  state?: "idle" | "valid";
  /** Lo que va debajo del texto: la entrada con código, o el botón para abrir. */
  action: ReactNode;
  /** Pie de la columna (códigos de muestra, "Regalá energía"). */
  footer?: ReactNode;
}

/**
 * /regalo/ como taquilla de entrada (R3b): la boletería de noche a lo ancho, con el titular en itálica de campaña y la
 * entrada al costado. Nunca un formulario centrado: en escritorio el arte va a la izquierda y la entrada a la derecha;
 * en el celular, el arte arriba como un cartel y la entrada debajo.
 */
export function GiftBooth({ eyebrow, title, children, state, action, footer }: Props) {
  return (
    <section aria-labelledby="taquilla-titulo" className="grid grid-cols-[minmax(0,1fr)] items-center gap-6 py-2 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 lg:py-6">
      <div className="relative overflow-hidden rounded-sm ring-1 ring-ink/10 max-lg:-mx-4 max-lg:rounded-none sm:max-lg:mx-0 sm:max-lg:rounded-sm">
        <BoothArt state={state} className="block h-auto w-full" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-volt" />
      </div>
      <div className="flex min-w-0 flex-col gap-5">
        <div>
          <p className="eyebrow flex items-center gap-2 text-volt-ink"><Ticket size={15} aria-hidden="true" /> {eyebrow}</p>
          <h1 id="taquilla-titulo" className="mt-2 font-display text-[clamp(2.6rem,7vw,4.5rem)] uppercase italic leading-[0.88]">{title}</h1>
          <div className="mt-3 max-w-prose text-muted">{children}</div>
        </div>
        {action}
        {footer}
      </div>
    </section>
  );
}

/** Pie de la taquilla: códigos de prueba para la demo y el camino para regalar. */
export function BoothFooter({ samples }: { samples: { code: string; label: string }[] }) {
  return (
    <div className="flex flex-col gap-3 border-t border-dashed border-line pt-4">
      {samples.length > 0 && (
        <div>
          <p className="eyebrow text-muted">Para probar la demo</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {samples.map((s) => (
              <li key={s.code}>
                <Link href={`/regalo/?c=${s.code}`} className="plate flex min-h-10 items-center gap-2 rounded-sm border border-line px-3 font-mono text-xs font-bold hover:border-ink/40">
                  <span className="text-volt-ink">{s.code}</span><span className="text-muted">{s.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Link href="/regalar/" className="group flex w-fit items-center gap-2 text-sm font-bold text-volt-ink underline underline-offset-4">
        ¿Querés regalar? Regalá energía <ArrowRight size={15} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
