import { ArrowRight } from "lucide-react";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { frame } from "@/demo/admin/content-slides";
import type { CarouselSlide } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Fondos que rotan por diapositiva: noche, oliva (mezcla de noche y primario: oscuro en cualquier temática) y arcilla. */
const TONES = [
  { bg: "bg-night", eyebrow: "text-brass", glow: "rgb(210_173_105/0.28)" },
  { bg: "bg-[color-mix(in_oklab,var(--c-night-2)_68%,var(--color-primary))]", eyebrow: "text-[#e9d9b4]", glow: "rgb(255_253_248/0.22)" },
  { bg: "bg-[#6d3a26]", eyebrow: "text-[#f1cfa0]", glow: "rgb(241_207_160/0.26)" },
];

const ART = "relative aspect-square w-full max-w-[19rem] overflow-hidden rounded-[1.4rem] sm:rounded-[2rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.65)] transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03] sm:max-w-[22rem]";

/** Clases del contenedor de una diapositiva (enlace en la tienda, caja en la vista previa del panel). */
export const heroSlideClass = (index: number) => cn("group relative grid min-h-[19rem] w-full shrink-0 snap-center grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] overflow-hidden text-[#fffdf8] sm:min-h-[26rem] sm:grid-cols-[1.05fr_1fr]", TONES[index % TONES.length]!.bg);

/** Imagen propia (con su encuadre) o la ilustración de la demo. */
function SlideArt({ slide }: { slide: CarouselSlide }) {
  if (!slide.image) return <ProductArt art={slide.art} label="" showBadge={false} className={ART} />;
  const f = frame(slide.image);
  return (
    <div className={ART}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL local del panel demo */}
      <img src={slide.image.src} alt={slide.image.alt} className="h-full w-full object-cover" style={{ objectPosition: `${f.x}% ${f.y}%`, transform: `scale(${f.zoom})`, transformOrigin: `${f.x}% ${f.y}%` }} />
    </div>
  );
}

/**
 * Interior de una diapositiva del carrusel principal (8.3.28: lo usan la tienda y la vista previa del panel, así lo
 * que se edita se ve igual que en el inicio). `index` elige el fondo y el número.
 */
export function HeroSlideBody({ slide, index }: { slide: CarouselSlide; index: number }) {
  const tone = TONES[index % TONES.length]!;
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:repeating-linear-gradient(135deg,#fff_0_1px,transparent_1px_22px)]" />
      <div className="relative z-10 flex min-w-0 flex-col justify-center py-8 pl-5 pr-1 sm:py-12 sm:pl-[var(--hero-safe)] sm:pr-6 lg:pr-8">
        <p className={cn("eyebrow", tone.eyebrow)}>Volta · {String(index + 1).padStart(2, "0")}</p>
        <p className="font-display mt-2 text-[1.75rem] leading-[1.04] [overflow-wrap:anywhere] sm:mt-3 sm:text-5xl lg:text-6xl">{slide.title}</p>
        <p className="mt-2 line-clamp-2 max-w-md text-[13px] text-white/80 sm:mt-3 sm:line-clamp-none sm:text-lg">{slide.subtitle}</p>
        <span className="mt-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-[#fffdf8] px-4 py-2.5 text-[13px] font-bold sm:mt-6 sm:px-6 sm:py-3 sm:text-sm text-night shadow-[0_12px_30px_-14px_rgb(0_0_0/0.6)] transition-transform group-hover:translate-x-1">
          {slide.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
      <div className="relative grid place-items-center py-8 pl-1 pr-5 sm:py-8 sm:pl-6 sm:pr-[var(--hero-safe)]">
        <div aria-hidden="true" className="absolute inset-0 m-auto aspect-square w-[85%]" style={{ background: `radial-gradient(closest-side, ${tone.glow.replace(/_/g, " ")}, transparent)` }} />
        <SlideArt slide={slide} />
      </div>
    </>
  );
}
