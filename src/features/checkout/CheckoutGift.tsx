"use client";
import { Gift } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import type { CartLine } from "@/demo/engine/cart-types";
import { getProduct } from "@/demo/engine/catalog";
import { useAccount } from "@/stores/account";
import { useCart } from "@/stores/cart";
import { useGiftDraft } from "@/stores/giftDraft";
import { useToasts } from "@/stores/toast";
import { GiftModal } from "../gifts/GiftModal";
import { useCurrentTheme } from "../themes/useCurrentTheme";

const nameOf = (l: CartLine) => getProduct(l.productSlug)?.name ?? "Producto";

/**
 * "¿Es para regalo?" en el último paso del checkout (8.2.16): abre el mismo modal que "Regalar ahora" en la ficha,
 * con el mismo borrador. Marca un producto del carrito como regalo, lo edita o lo vuelve a dejar como compra común.
 */
export function CheckoutGift({ onPayNow }: { onPayNow: () => void }) {
  const lines = useCart((s) => s.lines);
  const setGift = useCart((s) => s.setGift);
  const user = useAccount((s) => s.user);
  const { theme } = useCurrentTheme();
  const toast = useToasts((s) => s.push);
  const [open, setOpen] = useState(false);
  const [lineId, setLineId] = useState<string | null>(null);
  const gifts = lines.filter((l) => l.gift);
  const free = lines.find((l) => !l.gift);
  const selected = lines.find((l) => l.id === lineId) ?? free ?? lines[0];
  const openFor = (line: CartLine | undefined) => {
    if (!line) return;
    setLineId(line.id);
    useGiftDraft.getState().prime({ from: user?.name.split(" ")[0], occasion: theme?.id ?? "volta" }, line.gift);
    setOpen(true);
  };
  return (
    <section aria-labelledby="es-regalo" className="rounded-sm border border-line bg-surface p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-sm bg-accent text-volt-ink"><Gift size={19} aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h3 id="es-regalo" className="font-bold">¿Es para regalo?</h3>
          {gifts.length === 0 ? (
            <p className="text-sm text-muted">Le mandás un link y un código; lo abre a golpes y nunca ve el precio.</p>
          ) : (
            <ul className="mt-1 flex flex-col gap-2">
              {gifts.map((l) => (
                <li key={l.id} className="text-sm">
                  <span className="block"><strong>Regalo para {l.gift!.to}</strong> · de {l.gift!.from} · {nameOf(l)}</span>
                  <span className="mt-0.5 flex gap-4">
                    <button type="button" onClick={() => openFor(l)} className="min-h-9 font-bold text-primary underline">Editar</button>
                    <button type="button" onClick={() => { setGift(l.id, null); toast({ tone: "info", title: "Ya no va como regalo", description: nameOf(l) }); }} className="min-h-9 font-bold text-danger underline">Quitar</button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* El botón va debajo: en el celular no le quita ancho al texto. */}
      {free && <Button size="sm" variant="secondary" className="mt-3 w-full sm:ml-[3.25rem] sm:w-auto" onClick={() => openFor(free)}>{gifts.length ? "Regalar otro" : "Sí, es para regalar"}</Button>}
      {selected && (
        <GiftModal open={open} onClose={() => setOpen(false)} productName={nameOf(selected)}
          choices={lines.map((l) => ({ id: l.id, label: `${l.quantity} × ${nameOf(l)}${l.gift ? ` (regalo para ${l.gift.to})` : ""}` }))}
          choice={selected.id} onChoice={setLineId}
          onSubmit={(gift, mode) => {
            setGift(selected.id, gift);
            setOpen(false);
            toast({ tone: "success", title: "Va como regalo", description: `Para ${gift.to} · ${nameOf(selected)}` });
            if (mode === "buy") onPayNow();
          }} />
      )}
    </section>
  );
}
