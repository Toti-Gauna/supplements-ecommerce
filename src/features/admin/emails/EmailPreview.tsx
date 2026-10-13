"use client";
import { LogoMark } from "@/components/atoms/Logo";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import type { RenderedBlock, RenderedEmail } from "@/demo/admin/emails/render";
import { brand } from "@/config/brand";
import { withBase } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { OrderCard, ProductsList, PulseDivider, RefillCard, TrackingBattery, UsageList } from "./EmailBlocks";

export const FROM = `${brand.name} <${brand.email ?? `hola@${brand.demoDomain}`}>`;

function Block({ block: b }: { block: RenderedBlock }) {
  switch (b.type) {
    case "header":
      return (
        <div className="bg-night px-6 pb-4 pt-5 text-on-night">
          <p className="flex items-center justify-center gap-2.5">
            <LogoMark className="h-7 w-7 text-on-night" />
            <span className="font-display font-wide text-2xl uppercase leading-none">{brand.name}</span>
          </p>
          <p className="font-lab mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-volt">{brand.descriptor} · {brand.city}</p>
        </div>
      );
    case "heading":
      return <h2 className="font-display whitespace-pre-line px-6 pt-6 text-[1.7rem] leading-tight text-[#0b0d10]">{b.text}</h2>;
    case "text":
      return <p className="whitespace-pre-line px-6 pt-3 text-[15px] leading-relaxed text-[#23272f]">{b.text}</p>;
    case "image":
      return (
        <figure className="px-6 pt-5">
          <ProductVisual art={b.art} label={b.caption || "Imagen de la tienda"} showBadge={false} className="aspect-[16/9] w-full rounded-sm" />
          {b.caption && <figcaption className="mt-2 text-center text-xs text-[#5b6370]">{b.caption}</figcaption>}
        </figure>
      );
    case "button":
      // Voltio con texto grafito (16:1), como el botón principal de la tienda.
      return (
        <div className="px-6 pt-5 text-center">
          <a href={b.href.startsWith("/") ? withBase(b.href) : b.href} target="_blank" rel="noopener noreferrer" style={{ background: brand.colors.primary, color: brand.colors.onPrimary }}
            className="inline-block rounded-sm px-7 py-3.5 text-[15px] font-extrabold no-underline">{b.label}</a>
        </div>
      );
    case "order-card": return <OrderCard b={b} />;
    case "products": return <ProductsList b={b} />;
    case "usage": return <UsageList b={b} />;
    case "tracking": return <TrackingBattery b={b} />;
    case "refill": return <RefillCard b={b} />;
    case "divider": return <PulseDivider />;
    case "footer":
      return (
        <div className="mt-8 border-t border-[#eceef1] px-6 py-5 text-center text-xs leading-relaxed text-[#5b6370]">
          <p className="font-bold text-[#23272f]">{brand.name} · {brand.descriptor} · {brand.city}</p>
          <p>Originales, con lote y vencimiento a la vista{brand.instagram ? ` · @${brand.instagram}` : ""}</p>
          <p className="mt-2">Recibís este email porque compraste en la tienda. Demo: no se envió a nadie.</p>
        </div>
      );
  }
}

/**
 * Cómo se ve el email en la casilla del cliente: remitente, asunto, preencabezado y el cuerpo con la marca.
 * "mobile" lo muestra al ancho de un celular. Las temáticas no cambian los emails.
 */
export function EmailPreview({ email, to, device = "desktop", className }: { email: RenderedEmail; to: string; device?: "desktop" | "mobile"; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-sm bg-[#e6e9ee] ring-1 ring-ink/10", className)}>
      <div className="border-b border-black/5 bg-[#fafbfc] px-4 py-3 text-xs text-[#23272f]">
        <p className="truncate"><span className="text-[#5b6370]">De:</span> {FROM}</p>
        <p className="truncate"><span className="text-[#5b6370]">Para:</span> {to}</p>
        <p className="mt-1 text-sm font-bold text-[#0b0d10]">{email.subject}</p>
        <p className="truncate text-[#5b6370]">{email.preheader}</p>
      </div>
      <div className="p-3 sm:p-5">
        <article aria-label={`Email: ${email.subject}`} className={cn("mx-auto overflow-hidden rounded-sm bg-white pb-2 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.35)]", device === "mobile" ? "max-w-[360px]" : "max-w-[600px]")}>
          {email.blocks.map((b) => <Block key={b.id} block={b} />)}
        </article>
      </div>
    </div>
  );
}
