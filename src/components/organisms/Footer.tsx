import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { Logo } from "@/components/atoms/Logo";
import { ResetDemoButton } from "./ResetDemoButton";

const COLS = [
  { title: "Tienda", links: [["/categorias/", "Todas las categorías"], ["/crear/", "Por objetivo"], ["/club/", "Club Volta"], ["/cupones/", "Mis cupones"], ["/regalo/", "Tengo un regalo"], ["/buscar/", "Buscar"]] },
  { title: "Ayuda", links: [["/preguntas/", "Preguntas frecuentes"], ["/pedido/demo-volta/", "Seguir mi pedido (demo)"], ["/cuenta/", "Mi cuenta (demo)"]] },
  { title: "Legales", links: [["/terminos/", "Términos y condiciones"], ["/privacidad/", "Política de privacidad"], ["/arrepentimiento/", "Botón de arrepentimiento"]] },
];

export function Footer() {
  return (
    <footer className="cv-auto mt-24 bg-night pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-on-night [contain-intrinsic-size:auto_520px] lg:pb-0">
      <div className="mx-auto max-w-7xl px-6 pb-28 pt-16">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2fr)]">
          <div className="flex flex-col gap-5">
            <Logo tone="light" />
            <p className="font-display max-w-sm text-3xl leading-tight text-on-night">Energía de verdad, con lote y vencimiento.</p>
            <p className="text-sm text-night-muted">{brand.tagline}. Local en {brand.city}.</p>
            {brand.instagram && (
              <a href={`https://instagram.com/${brand.instagram}`} target="_blank" rel="noopener noreferrer" className="flex w-fit items-center gap-1 text-sm font-bold text-volt hover:text-on-night">
                @{brand.instagram} <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="eyebrow mb-4 text-volt">{c.title}</p>
                <ul className="flex flex-col gap-2.5 text-[15px]">
                  {c.links.map(([href, label]) => <li key={href}><Link href={href!} className="text-on-night hover:text-white hover:underline hover:underline-offset-4">{label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-night-muted sm:flex-row sm:items-center sm:justify-between">
          <Link href="/arrepentimiento/" className="w-fit rounded-full border border-on-night/40 px-4 py-2 text-sm font-bold text-on-night hover:bg-white/10">Botón de arrepentimiento</Link>
          <p>Vendedor: {brand.legalName ?? "razón social a confirmar"} · CUIT {brand.cuit ?? "a confirmar"}</p>
          <p className="flex flex-wrap gap-x-3">
            <span>Demo de venta por Eclipse · marca de muestra</span>
            <ResetDemoButton className="font-bold text-volt underline underline-offset-2" />
            <Link href="/admin-demo/" className="font-semibold underline underline-offset-2 hover:text-white">Ver panel demo</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
