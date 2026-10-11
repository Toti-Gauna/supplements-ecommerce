"use client";
import { Check } from "lucide-react";
import { LogoMark } from "@/components/atoms/Logo";
import { ProductVisual } from "@/components/illustrations/ProductVisual";
import type { RenderedBlock, RenderedEmail } from "@/demo/admin/emails/render";
import { brand } from "@/config/brand";
import { withBase } from "@/lib/base-path";
import { cn } from "@/lib/cn";

export const FROM = "Volta <hola@volta.demo>";

function Block({ block: b, primary }: { block: RenderedBlock; primary: string }) {
  switch (b.type) {
    case "header":
      return (
        <div className="flex items-center justify-center gap-2.5 bg-[#1c2016] px-6 py-5 text-[#f6f1e8]">
          <LogoMark className="h-7 w-7 text-brass" />
          <span className="font-display text-2xl leading-none">Volta</span>
        </div>
      );
    case "heading":
      return <h2 className="font-display whitespace-pre-line px-6 pt-6 text-[1.7rem] leading-tight text-[#1c2016]">{b.text}</h2>;
    case "text":
      return <p className="whitespace-pre-line px-6 pt-3 text-[15px] leading-relaxed text-[#3b3a33]">{b.text}</p>;
    case "image":
      return (
        <figure className="px-6 pt-5">
          <ProductVisual art={b.art} label={b.caption || "Imagen del taller"} showBadge={false} className="aspect-[16/9] w-full rounded-2xl" />
          {b.caption && <figcaption className="mt-2 text-center text-xs text-[#6b675c]">{b.caption}</figcaption>}
        </figure>
      );
    case "button":
      return (
        <div className="px-6 pt-5 text-center">
          <a href={b.href.startsWith("/") ? withBase(b.href) : b.href} target="_blank" rel="noopener noreferrer" style={{ background: primary }}
            className="inline-block rounded-full px-7 py-3.5 text-[15px] font-bold text-white no-underline">{b.label}</a>
        </div>
      );
    case "order-card":
      return (
        <div className="mx-6 mt-5 rounded-2xl border border-[#e6dfd1] bg-[#faf7f1] p-4 text-sm text-[#3b3a33]">
          <p className="flex justify-between font-bold text-[#1c2016]"><span>Pedido {b.code}</span><span className="tabular-nums">{b.total}</span></p>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-[#6b675c]">Estado</dt><dd className="font-semibold">{b.status}</dd>
            <dt className="text-[#6b675c]">Entrega</dt><dd className="font-semibold first-letter:uppercase">{b.deliveryDate}</dd>
            <dt className="text-[#6b675c]">Cómo</dt><dd className="font-semibold">{b.fulfillment}</dd>
          </dl>
        </div>
      );
    case "products":
      return (
        <ul className="mx-6 mt-5 flex flex-col divide-y divide-[#eee7da] rounded-2xl border border-[#e6dfd1]">
          {b.lines.map((l, i) => (
            <li key={i} className="flex items-center gap-3 p-3 text-sm">
              <ProductVisual art={l.art} tint={l.tint} label={l.name} showBadge={false} className="aspect-square w-14 shrink-0 rounded-xl" />
              <span className="min-w-0 flex-1 text-[#3b3a33]">
                <span className="block font-bold text-[#1c2016]">{l.quantity} × {l.name}</span>
                {l.variant}{l.detail ? ` · ${l.detail}` : ""}
              </span>
            </li>
          ))}
        </ul>
      );
    case "tracking":
      return (
        <ol className="mx-6 mt-5 flex justify-between gap-1 rounded-2xl bg-[#faf7f1] p-4">
          {b.steps.map((s) => (
            <li key={s.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
              <span className={cn("grid h-7 w-7 place-items-center rounded-full text-xs font-bold", s.state === "next" ? "border border-[#d6cfbf] text-[#8a8577]" : "text-white")}
                style={s.state === "next" ? undefined : { background: s.state === "current" ? primary : "#5b7a3a" }}>
                {s.state === "done" ? <Check size={14} aria-hidden="true" /> : "•"}
              </span>
              <span className={cn("text-[11px] leading-tight", s.state === "current" ? "font-bold text-[#1c2016]" : "text-[#6b675c]")}>{s.label}</span>
            </li>
          ))}
        </ol>
      );
    case "divider":
      return <hr className="mx-6 mt-6 border-[#e6dfd1]" />;
    case "footer":
      return (
        <div className="mt-8 border-t border-[#eee7da] px-6 py-5 text-center text-xs leading-relaxed text-[#6b675c]">
          <p className="font-bold text-[#3b3a33]">Volta · Mar del Plata</p>
          <p>Objetos hechos a mano para tu casa y tu mascota · @volta.mdp</p>
          <p className="mt-2">Recibís este email porque compraste en la tienda. Demo: no se envió a nadie.</p>
        </div>
      );
  }
}

/**
 * Cómo se ve el email en la casilla del cliente: remitente, asunto, preencabezado y el cuerpo con la marca.
 * "mobile" lo muestra al ancho de un celular.
 */
export function EmailPreview({ email, to, device = "desktop", className }: { email: RenderedEmail; to: string; device?: "desktop" | "mobile"; className?: string }) {
  // Color de la marca Volta (8.3.29: sin editor de paleta; las temáticas no cambian los emails).
  const primary = brand.colors.primary;
  return (
    <div className={cn("overflow-hidden rounded-[1.5rem] bg-[#ece6da] ring-1 ring-ink/10", className)}>
      <div className="border-b border-black/5 bg-[#fbf9f4] px-4 py-3 text-xs text-[#3b3a33]">
        <p className="truncate"><span className="text-[#6b675c]">De:</span> {FROM}</p>
        <p className="truncate"><span className="text-[#6b675c]">Para:</span> {to}</p>
        <p className="mt-1 text-sm font-bold text-[#1c2016]">{email.subject}</p>
        <p className="truncate text-[#6b675c]">{email.preheader}</p>
      </div>
      <div className="p-3 sm:p-5">
        <article aria-label={`Email: ${email.subject}`} className={cn("mx-auto overflow-hidden rounded-2xl bg-white pb-2 shadow-[0_10px_30px_-18px_rgb(0_0_0/0.35)]", device === "mobile" ? "max-w-[360px]" : "max-w-[600px]")}>
          {email.blocks.map((b) => <Block key={b.id} block={b} primary={primary} />)}
        </article>
      </div>
    </div>
  );
}
