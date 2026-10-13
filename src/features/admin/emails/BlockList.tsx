"use client";
import { ArrowDown, ArrowUp, Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { needsOrder, needsRefill } from "@/demo/admin/emails/render";
import { BLOCK_LABEL, LINK_LABEL, type ButtonLink, type EmailBlock, type EmailBlockType, type EmailToken } from "@/demo/fixtures/emails";
import type { ArtKey } from "@/demo/types";
import { ChipEditor } from "./ChipEditor";

const DESCRIBE: Partial<Record<EmailBlockType, string>> = {
  header: "Logo y nombre de la tienda sobre la banda oscura.",
  "order-card": "Código, total, estado, fecha de entrega y forma de entrega del pedido.",
  products: "Los productos del pedido con su sabor, tamaño y servicios; cuando ya está armado, también el lote y el vencimiento.",
  usage: "Cómo se toma cada producto del pedido (la indicación de su ficha).",
  tracking: "Recorrido del pedido como una batería que se carga hasta la etapa actual.",
  refill: "El producto que se le termina, con la fecha estimada.",
  divider: "La línea de pulso de la marca, para separar.",
  footer: "Datos de la tienda y aviso de por qué recibe el email.",
};

const ADDABLE: EmailBlockType[] = ["heading", "text", "button", "image", "order-card", "products", "usage", "tracking", "refill", "divider"];

let seq = 0;
export function newBlock(type: EmailBlockType): EmailBlock {
  const id = `n${Date.now().toString(36)}${++seq}`;
  switch (type) {
    case "heading": return { id, type, content: [{ kind: "text", text: "Título nuevo" }] };
    case "text": return { id, type, content: [{ kind: "text", text: "Escribí acá el mensaje." }] };
    case "button": return { id, type, label: [{ kind: "text", text: "Ver mi pedido" }], link: "tracking" };
    case "image": return { id, type, art: "tub", caption: [] };
    default: return { id, type } as EmailBlock;
  }
}

interface Props {
  blocks: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
  tokens: EmailToken[];
  /** El disparador trae un pedido o, en la recompra, el producto que se termina. */
  hasOrder: boolean;
  arts: { art: ArtKey; name: string }[];
}

/** Bloques del email en orden: se editan, se mueven, se duplican o se quitan; abajo se agregan nuevos. */
export function BlockList({ blocks, onChange, tokens, hasOrder, arts }: Props) {
  const [add, setAdd] = useState<EmailBlockType>("text");
  const patch = (i: number, b: EmailBlock) => onChange(blocks.map((x, k) => (k === i ? b : x)));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...blocks];
    [next[i], next[i + dir]] = [next[i + dir]!, next[i]!];
    onChange(next);
  };
  const tool = "grid h-9 w-9 place-items-center rounded-sm text-muted hover:bg-accent hover:text-ink disabled:opacity-30";
  return (
    <div className="flex flex-col gap-3">
      <ol className="flex flex-col gap-3">
        {blocks.map((b, i) => {
          const label = BLOCK_LABEL[b.type];
          return (
            <li key={b.id} className="rounded-sm bg-surface p-3.5 shadow-[var(--shadow-card)] ring-1 ring-ink/[0.04]">
              <div className="mb-2 flex items-center gap-1">
                <span className="mr-auto text-sm font-extrabold">{i + 1}. {label}</span>
                <button type="button" className={tool} aria-label={`Subir ${label} ${i + 1}`} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
                <button type="button" className={tool} aria-label={`Bajar ${label} ${i + 1}`} disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
                <button type="button" className={tool} aria-label={`Duplicar ${label} ${i + 1}`} onClick={() => onChange([...blocks.slice(0, i + 1), { ...structuredClone(b), id: newBlock(b.type).id }, ...blocks.slice(i + 1)])}><Copy size={15} aria-hidden="true" /></button>
                <button type="button" className={`${tool} hover:bg-danger-soft hover:text-danger`} aria-label={`Quitar ${label} ${i + 1}`} onClick={() => onChange(blocks.filter((_, k) => k !== i))}><Trash2 size={15} aria-hidden="true" /></button>
              </div>
              {(b.type === "heading" || b.type === "text") && (
                <ChipEditor id={`blk-${b.id}`} label={`${label} ${i + 1}`} value={b.content} tokens={tokens} multiline={b.type === "text"} onChange={(content) => patch(i, { ...b, content })} />
              )}
              {b.type === "button" && (
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
                  <ChipEditor id={`blk-${b.id}`} label={`Texto del botón ${i + 1}`} value={b.label} tokens={tokens} onChange={(l) => patch(i, { ...b, label: l })} />
                  <label className="flex flex-col gap-1 text-xs font-bold">Lleva a
                    <select value={b.link} onChange={(e) => patch(i, { ...b, link: e.target.value as ButtonLink })} className="h-11 rounded-sm border border-ink/12 bg-surface px-3 text-sm font-semibold">
                      {(Object.keys(LINK_LABEL) as ButtonLink[]).filter((l) => l === b.link || (hasOrder ? l !== "product" : l !== "tracking")).map((l) => <option key={l} value={l}>{LINK_LABEL[l]}</option>)}
                    </select>
                  </label>
                </div>
              )}
              {b.type === "image" && (
                <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <label className="flex flex-col gap-1 text-xs font-bold">Ilustración
                    <select value={b.art} onChange={(e) => patch(i, { ...b, art: e.target.value as ArtKey })} className="h-11 rounded-sm border border-ink/12 bg-surface px-3 text-sm font-semibold">
                      {arts.map((a) => <option key={a.art} value={a.art}>{a.name}</option>)}
                    </select>
                  </label>
                  <div className="flex flex-col gap-1 text-xs font-bold">Epígrafe
                    <ChipEditor id={`blk-${b.id}`} label={`Epígrafe de la imagen ${i + 1}`} value={b.caption} tokens={tokens} placeholder="Opcional" onChange={(caption) => patch(i, { ...b, caption })} />
                  </div>
                </div>
              )}
              {DESCRIBE[b.type] && <p className="text-sm text-muted">{DESCRIBE[b.type]}</p>}
              {((needsOrder(b) && !hasOrder) || (needsRefill(b) && hasOrder)) && (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-warning"><TriangleAlert size={14} aria-hidden="true" /> {hasOrder ? "Solo sale en el aviso de recompra" : "Este disparador no tiene pedido"}: el bloque no se muestra.</p>
              )}
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-end gap-2 rounded-sm border border-dashed border-ink/15 p-3">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-bold">Agregar bloque
          <select value={add} onChange={(e) => setAdd(e.target.value as EmailBlockType)} className="h-11 rounded-sm border border-ink/12 bg-surface px-3 text-sm font-semibold">
            {ADDABLE.map((t) => <option key={t} value={t}>{BLOCK_LABEL[t]}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => {
          const footer = blocks.findIndex((b) => b.type === "footer");
          const at = footer < 0 ? blocks.length : footer;
          onChange([...blocks.slice(0, at), newBlock(add), ...blocks.slice(at)]);
        }} className="inline-flex h-11 items-center gap-1.5 rounded-sm bg-primary px-4 text-sm font-bold text-on-primary hover:bg-primary-hover">
          <Plus size={16} aria-hidden="true" /> Agregar
        </button>
      </div>
    </div>
  );
}
