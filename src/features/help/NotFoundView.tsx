import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { buttonClass } from "@/components/atoms/Button";
import { inputClass } from "@/components/atoms/Field";
import { Led } from "@/components/atoms/Led";
import { cn } from "@/lib/cn";
import { withBase } from "@/lib/base-path";

const POPULAR = ["creatina", "whey", "pre-entreno", "guantes", "sin TACC"];
const LINKS = [
  { href: "/", label: "Inicio", hint: "Lo más elegido del box" },
  { href: "/categorias/", label: "Todas las categorías", hint: "Suplementos y equipamiento" },
  { href: "/crear/", label: "Armá tu stack", hint: "Con el descuento stack" },
  { href: "/favoritos/", label: "Mi rack", hint: "Lo que guardaste" },
  { href: "/preguntas/", label: "Ayuda del box", hint: "Envíos, pagos y cambios" },
];

/** La barra sin discos: barra olímpica con los topes y las mangas vacías (SVG decorativo, solo tokens). */
function EmptyBar() {
  return (
    <svg aria-hidden="true" viewBox="0 0 320 60" className="h-auto w-full max-w-md">
      <rect x="4" y="27" width="312" height="6" className="fill-current opacity-70" />
      {[22, 254].map((x) => <rect key={x} x={x} y="19" width="44" height="22" rx="2" className="fill-current opacity-40" />)}
      {[66, 246].map((x) => <rect key={x} x={x} y="13" width="8" height="34" rx="1" className="fill-current" />)}
      {[24, 36, 48, 268, 280, 292].map((x) => <rect key={x} x={x} y="4" width="9" height="52" rx="1" fill="none" stroke="currentColor" strokeDasharray="3 3" className="opacity-30" />)}
      <rect x="120" y="27" width="80" height="6" className="fill-[var(--season-accent)] opacity-80" />
    </svg>
  );
}

/**
 * 404 dentro de la tienda (R2c): "Esta barra está vacía", el 404 en el marcador, un buscador que funciona sin
 * JavaScript (formulario GET a /buscar/), búsquedas frecuentes y los atajos a lo que más se usa.
 */
export function NotFoundView() {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div className="min-w-0">
        <div className="floor led-dark relative overflow-hidden border border-white/10 px-5 pb-6 pt-5 text-on-night sm:px-8 sm:pt-8">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-volt" />
          <p className="eyebrow text-volt">Error 404 · Página no encontrada</p>
          <Led value="404" label="Error 404" className="mt-4 h-16 sm:h-24" />
          <h1 className="font-display mt-5 text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.95]">Esta barra está vacía</h1>
          <p className="mt-3 max-w-xl text-night-muted">No hay nada cargado en esta dirección. Puede que el link esté incompleto o que el producto ya no esté en la tienda. Buscalo o volvé al rack.</p>
          <div className="mt-6 text-on-night"><EmptyBar /></div>
        </div>
        <form role="search" action={withBase("/buscar/")} method="get" className="plate mt-6 border border-line p-4 sm:p-5">
          <label htmlFor="not-found-q" className="eyebrow text-muted">Buscá un producto</label>
          <div className="mt-2 flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink" />
              <input id="not-found-q" name="q" type="search" required autoComplete="off" placeholder="Whey, creatina, guantes…" className={cn(inputClass, "pl-11")} />
            </div>
            <button type="submit" className={buttonClass("primary", "md", "shrink-0")}>Buscar</button>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[11px] text-muted">
            <span className="uppercase tracking-[0.08em]">Lo más buscado:</span>
            {POPULAR.map((q) => (
              <Link key={q} href={`/buscar/?q=${encodeURIComponent(q)}`} className="flex min-h-9 items-center border border-line bg-surface px-2.5 text-ink hover:border-ink/50">{q}</Link>
            ))}
          </p>
        </form>
      </div>
      <nav aria-label="Atajos" className="border-t-2 border-ink pt-4">
        <p className="eyebrow text-muted">Volvé al box</p>
        <ul className="mt-2 flex flex-col">
          {LINKS.map((l, i) => (
            <li key={l.href}>
              <Link href={l.href} className="group grid min-h-14 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-2 border-b border-line py-2 hover:bg-accent/50">
                <span aria-hidden="true" className="font-mono text-[11px] font-bold text-volt-ink">{String(i + 1).padStart(2, "0")}</span>
                <span><span className="font-display block text-xl leading-none text-ink">{l.label}</span><span className="text-xs text-muted">{l.hint}</span></span>
                <ArrowUpRight size={18} aria-hidden="true" className="text-volt-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
