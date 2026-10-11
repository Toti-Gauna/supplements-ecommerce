import { ArrowRight } from "lucide-react";
import { LOGO_BOLT, LOGO_VIEWBOX } from "@/components/atoms/Logo";
import { ProductArt } from "@/components/illustrations/ProductArt";
import { frame } from "@/demo/admin/content-slides";
import type { CarouselSlide } from "@/demo/types";
import { cn } from "@/lib/cn";

/** Fondos que rotan por diapositiva: grafito con plasma, plasma profundo e ion profundo (oscuros en cualquier temática). */
const TONES = [
  { bg: "bg-night", eyebrow: "text-volt", glow: "rgb(139_114_255/0.45)", tint: "#5a3220" },
  { bg: "bg-[#120f2e]", eyebrow: "text-volt-soft", glow: "rgb(200_255_46/0.3)", tint: "#e8e4d8" },
  { bg: "bg-[#06222a]", eyebrow: "text-[#7ff5ea]", glow: "rgb(46_230_214/0.38)", tint: "#8b72ff" },
];

const ART = "relative aspect-square w-full max-w-[19rem] transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:-rotate-1 sm:max-w-[24rem]";

/** Clases del contenedor de una diapositiva (enlace en la tienda, caja en la vista previa del panel). */
export const heroSlideClass = (index: number) => cn("group relative grid min-h-[19rem] w-full shrink-0 snap-center grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] overflow-hidden text-on-night sm:min-h-[26rem] sm:grid-cols-[1.05fr_1fr]", TONES[index % TONES.length]!.bg);

/** Imagen propia (con su encuadre) o la ilustración de la demo. */
function SlideArt({ slide, tint }: { slide: CarouselSlide; tint: string }) {
  if (!slide.image) return <ProductArt art={slide.art} tint={tint} bare label="" showBadge={false} className={cn(ART, "drop-shadow-[0_40px_50px_rgb(0_0_0/0.55)]")} />;
  const f = frame(slide.image);
  return (
    <div className={cn(ART, "overflow-hidden rounded-[1.4rem] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.65)] sm:rounded-[2rem]")}>
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
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_1.5px)] [background-size:22px_22px]" />
      <svg aria-hidden="true" viewBox={LOGO_VIEWBOX} className="pointer-events-none absolute -right-[12%] top-1/2 h-[135%] -translate-y-1/2 opacity-[0.07]"><path d={LOGO_BOLT} fill="none" stroke="#c8ff2e" strokeWidth="0.6" /></svg>
      <div className="relative z-10 flex min-w-0 flex-col justify-center py-8 pl-5 pr-1 sm:py-12 sm:pl-[var(--hero-safe)] sm:pr-6 lg:pr-8">
        <p className={cn("eyebrow", tone.eyebrow)}>Volta · {String(index + 1).padStart(2, "0")}</p>
        <p className="font-display font-wide mt-2 text-[1.6rem] leading-[1.02] [overflow-wrap:anywhere] sm:mt-3 sm:text-5xl lg:text-6xl">{slide.title}</p>
        <p className="mt-2 line-clamp-2 max-w-md text-[13px] text-white/80 sm:mt-3 sm:line-clamp-none sm:text-lg">{slide.subtitle}</p>
        <span className="mt-5 inline-flex w-fit max-w-full items-center gap-2 rounded-full bg-volt px-4 py-2.5 text-[13px] font-extrabold sm:mt-6 sm:px-6 sm:py-3 sm:text-sm text-night shadow-[0_12px_34px_-12px_rgb(200_255_46/0.7)] transition-transform group-hover:translate-x-1">
          {slide.ctaLabel} <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>
      <div className="relative grid place-items-center py-8 pl-1 pr-5 sm:py-8 sm:pl-6 sm:pr-[var(--hero-safe)]">
        <div aria-hidden="true" className="absolute inset-0 m-auto aspect-square w-[95%]" style={{ background: `radial-gradient(closest-side, ${tone.glow.replace(/_/g, " ")}, transparent)` }} />
        <SlideArt slide={slide} tint={tone.tint} />
      </div>
    </>
  );
}
