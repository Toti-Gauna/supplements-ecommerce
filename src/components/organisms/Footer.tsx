import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { brand } from "@/config/brand";
import { Logo } from "@/components/atoms/Logo";
import { DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { StoreSpecs } from "@/features/shell/StoreSpecs";
import { ThemeTryButton } from "@/features/themes/ThemeTryButton";
import { cn } from "@/lib/cn";
import { DOCK_SPACE } from "./bottomBars";
import { ResetDemoButton } from "./ResetDemoButton";
import { WhatsAppLink } from "./WhatsAppLink";

const COLS = [
  { title: "Tienda", links: [["/categorias/", "Todas las categorías"], ["/crear/", "Armá tu stack"], ["/club/", brand.club], ["/club/juego/", "Shaker Rush"], ["/cupones/", "Mis cupones"], ["/regalo/", "Tengo un regalo"]] },
  { title: "Ayuda", links: [["/preguntas/", "Preguntas frecuentes"], [`/pedido/${DEMO_TRACKING_TOKEN}/`, "Seguimiento de pedido"], ["/cuenta/", "Mi cuenta"]] },
  { title: "Legales", links: [["/terminos/", "Términos y condiciones"], ["/privacidad/", "Política de privacidad"], ["/arrepentimiento/", "Botón de arrepentimiento"]] },
];
const FOOT_LINK = "inline-flex min-h-6 items-center font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-volt underline underline-offset-4 hover:text-on-night";

/** Pie como "ficha técnica del local": marca, la ficha (lugar, horarios, cadete, envíos y pagos), links y el pie legal. */
export function Footer() {
  return (
    <footer className={cn("cv-auto floor mt-24 text-on-night [contain-intrinsic-size:auto_640px]", DOCK_SPACE)}>
      <div className="lane h-2" aria-hidden="true" />
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-5">
            <Logo tone="light" />
            <p className="font-display max-w-md text-[2.6rem] text-on-night">Lote y vencimiento a la vista. Cadete propio en {brand.city}</p>
            <StoreSpecs />
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
              <WhatsAppLink className="text-on-night hover:text-volt" />
              {brand.instagram && (
                <a href={`https://instagram.com/${brand.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-volt hover:text-on-night">
                  @{brand.instagram} <ArrowUpRight size={16} aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:pt-14">
            {COLS.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="eyebrow mb-4 text-volt">{c.title}</p>
                <ul className="flex flex-col gap-2.5 text-[15px]">
                  {c.links.map(([href, label]) => <li key={href}><Link href={href!} className="text-on-night hover:text-volt hover:underline hover:underline-offset-4">{label}</Link></li>)}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-night-muted lg:flex-row lg:items-center lg:justify-between">
          <p>Demo de venta por Eclipse: marca, precios y stock de muestra; no se cobra nada ni se guarda ningún pedido real. Vendedor: {brand.legalName ?? "razón social a confirmar"} · CUIT {brand.cuit ?? "a confirmar"}.</p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <ResetDemoButton className={FOOT_LINK} />
            <ThemeTryButton className={FOOT_LINK} />
            <Link href="/admin-demo/" className={FOOT_LINK}>Ver panel demo</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
