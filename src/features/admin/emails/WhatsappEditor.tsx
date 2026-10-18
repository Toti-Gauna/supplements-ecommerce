"use client";
import { MessageCircle, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { contextForOrder, resolveInline } from "@/demo/admin/emails/context";
import type { AdminOrder } from "@/demo/admin/types";
import { waInline, waMessage, waMessageIdFor, waSampleOrder, waTokens } from "@/demo/admin/whatsapp";
import type { Inline } from "@/demo/fixtures/emails";
import type { WaMessageId } from "@/demo/fixtures/whatsapp";
import { useToasts } from "@/stores/toast";
import { useWhatsappTexts } from "@/stores/whatsapp";
import { ChipEditor } from "./ChipEditor";
import { TokenPalette } from "./TokenPalette";

interface Props {
  id: WaMessageId;
  orders: AdminOrder[];
  /** Pedido elegido para la vista previa (el del email); si no corresponde a este estado, se usa uno que sí. */
  sampleCode?: string;
  /** Paleta de fichas propia (en el panel). En el editor del email ya está la de arriba. */
  palette?: boolean;
}

const hasText = (v: Inline) => v.some((p) => p.kind === "token" || p.text.trim());

/**
 * Versión WhatsApp de un estado del pedido (R4b): el texto corto con fichas de datos, cómo le llega al cliente con un
 * pedido real y guardar o volver al de muestra. Se guarda aparte del email (solo en este navegador).
 */
export function WhatsappEditor({ id, orders, sampleCode, palette = true }: Props) {
  const texts = useWhatsappTexts((s) => s.texts);
  const { save, restore } = useWhatsappTexts();
  const push = useToasts((s) => s.push);
  const saved = waInline(id, texts);
  const [draft, setDraft] = useState<Inline>(saved);
  const [seen, setSeen] = useState(saved);
  // Guardar o volver al de muestra (acá o en otra pestaña) trae el texto guardado.
  if (saved !== seen) { setSeen(saved); setDraft(saved); }
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const tokens = waTokens(id);
  const chosen = orders.find((o) => o.code === sampleCode && waMessageIdFor(o) === id);
  const sample = chosen ?? waSampleOrder(id, orders);
  const preview = sample ? resolveInline(draft, contextForOrder(sample)) : "";
  const label = waMessage(id).label;
  const submit = () => { save(id, draft); push({ tone: "success", title: "Mensaje de WhatsApp guardado", description: `“${label}”. Se usa en Pedidos al tocar “Escribirle por WhatsApp”. Solo en esta demo.` }); };
  const back = () => { restore(id); push({ tone: "info", title: "WhatsApp con el texto de muestra", description: `“${label}” volvió al mensaje original.` }); };
  return (
    <div className="flex flex-col gap-3">
      {palette && <TokenPalette tokens={tokens} />}
      <ChipEditor id={`wa-${id}`} label={`Mensaje de WhatsApp: ${label}`} value={draft} tokens={tokens} multiline onChange={setDraft} />
      {!hasText(draft) && <p role="alert" className="text-sm font-bold text-danger">Escribí el mensaje: vacío no se puede guardar.</p>}
      <figure aria-label="Vista previa del WhatsApp" className="max-w-md self-start rounded-sm rounded-tl-none bg-success-soft p-3 text-sm ring-1 ring-success/25">
        <figcaption className="mb-1 flex items-center gap-1.5 text-xs font-bold text-success"><MessageCircle size={13} aria-hidden="true" />{sample ? `Así le llega a ${sample.customer.name} (${sample.code})` : "Vista previa"}</figcaption>
        <p className="whitespace-pre-wrap text-ink">{preview}</p>
      </figure>
      <div className="flex flex-wrap items-center gap-2">
        {dirty && <span role="status" className="text-sm font-bold text-warning">WhatsApp sin guardar</span>}
        <Button size="sm" disabled={!dirty || !hasText(draft)} onClick={submit}>Guardar WhatsApp</Button>
        {texts[id] && <Button variant="ghost" size="sm" onClick={back}><RotateCcw size={15} aria-hidden="true" /> Volver al de muestra</Button>}
      </div>
    </div>
  );
}
