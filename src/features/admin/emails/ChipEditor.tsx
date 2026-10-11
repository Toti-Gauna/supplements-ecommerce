"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { TOKEN_LABEL, type EmailToken, type Inline } from "@/demo/fixtures/emails";
import { cn } from "@/lib/cn";

/**
 * Texto con datos dinámicos como fichas visuales (pedido de Ignacio: nada de llaves ni códigos a la vista).
 * Es un `contentEditable` con texto común y fichas `<span contenteditable="false">` que se insertan con un toque
 * desde la paleta, se borran con la tecla de borrar y se guardan como partes { texto | ficha }.
 */

const CHIP = "chip-token mx-0.5 inline-flex select-none items-center rounded-full bg-primary/12 px-2 py-px align-baseline text-[0.92em] font-bold text-primary ring-1 ring-primary/25";

function toNodes(value: Inline, multiline: boolean): Node[] {
  return value.flatMap((p): Node[] => {
    if (p.kind === "token") {
      const span = document.createElement("span");
      span.contentEditable = "false";
      span.dataset.token = p.token;
      span.className = CHIP;
      span.textContent = TOKEN_LABEL[p.token];
      return [span];
    }
    return [document.createTextNode(multiline ? p.text : p.text.replace(/\n/g, " "))];
  });
}

/** Lee el contenido editable y lo vuelve partes; une textos seguidos y descarta los vacíos. */
export function parseNodes(root: Node, multiline: boolean): Inline {
  const out: Inline = [];
  const text = (s: string) => {
    if (!s) return;
    const last = out.at(-1);
    if (last?.kind === "text") last.text += s;
    else out.push({ kind: "text", text: s });
  };
  const walk = (node: Node, first: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) return text((node.textContent ?? "").replace(/​/g, ""));
    if (!(node instanceof HTMLElement)) return;
    const token = node.dataset.token as EmailToken | undefined;
    if (token && token in TOKEN_LABEL) { out.push({ kind: "token", token }); return; }
    if (node.tagName === "BR") return text(multiline ? "\n" : " ");
    // Chrome envuelve cada línea nueva en un <div>
    if ((node.tagName === "DIV" || node.tagName === "P") && !first) text(multiline ? "\n" : " ");
    node.childNodes.forEach((c, i) => walk(c, i === 0));
  };
  root.childNodes.forEach((c, i) => walk(c, i === 0));
  return out;
}

interface Handle {
  insert: (token: EmailToken) => void;
  tokens: EmailToken[];
}

interface ChipCtx {
  register: (id: string, handle: Handle | null) => void;
  activate: (id: string) => void;
  active: string | null;
  insert: (token: EmailToken) => boolean;
  allowed: (token: EmailToken) => boolean;
}

const Ctx = createContext<ChipCtx | null>(null);

/** Sabe qué campo se tocó último para insertar ahí la ficha elegida en la paleta. */
export function ChipEditorsProvider({ children }: { children: ReactNode }) {
  const handles = useRef(new Map<string, Handle>());
  const [active, setActive] = useState<string | null>(null);
  const value: ChipCtx = {
    register: (id, h) => { if (h) handles.current.set(id, h); else handles.current.delete(id); },
    activate: setActive,
    active,
    insert: (token) => {
      const h = active ? handles.current.get(active) : undefined;
      if (!h || !h.tokens.includes(token)) return false;
      h.insert(token);
      return true;
    },
    allowed: (token) => {
      const h = active ? handles.current.get(active) : undefined;
      return !!h && h.tokens.includes(token);
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useChipEditors(): ChipCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ChipEditor fuera de ChipEditorsProvider");
  return ctx;
}

interface Props {
  id: string;
  label: string;
  value: Inline;
  onChange: (value: Inline) => void;
  /** Fichas que se pueden insertar en este campo. */
  tokens: EmailToken[];
  multiline?: boolean;
  placeholder?: string;
  className?: string;
}

/** Formato propio en el portapapeles: copiar y pegar entre campos conserva las fichas (no solo su texto). */
const CLIP = "application/x-volta-inline";

const escapeHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** HTML de partes para `insertHTML` (así la inserción entra en el deshacer del navegador). */
function toHtml(value: Inline, multiline: boolean): string {
  return value.map((p) => (p.kind === "token"
    ? `<span contenteditable="false" data-token="${p.token}" class="${CHIP}">${escapeHtml(TOKEN_LABEL[p.token])}</span>`
    : escapeHtml(multiline ? p.text : p.text.replace(/\n/g, " ")))).join("");
}

export function ChipEditor({ id, label, value, onChange, tokens, multiline = false, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const emitted = useRef<string>("");
  const ctx = useChipEditors();
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  const isActive = ctx.active === id;
  const json = JSON.stringify(value);
  const tokensKey = tokens.join(",");

  // El DOM editable se reconstruye solo cuando el valor cambia desde afuera (cargar, restaurar):
  // si se reconstruyera en cada tecla, el cursor saltaría al principio.
  useEffect(() => {
    const el = ref.current;
    if (!el || json === emitted.current) return;
    el.replaceChildren(...toNodes(JSON.parse(json) as Inline, multiline));
    emitted.current = json;
  }, [json, multiline]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    let next = parseNodes(el, multiline);
    // Campo vaciado: Chrome deja un <br> que no es contenido (y taparía el texto de ayuda).
    if (next.every((p) => p.kind === "text" && !p.text.trim())) { if (el.childNodes.length) el.replaceChildren(); next = []; }
    emitted.current = JSON.stringify(next);
    onChangeRef.current(next);
  };
  const save = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.getRangeAt(0).commonAncestorContainer)) range.current = sel.getRangeAt(0).cloneRange();
  };
  /** Inserta partes donde está el cursor, con las fichas que este campo admite (las otras quedan afuera). */
  const insertParts = (parts: Inline) => {
    const el = ref.current;
    if (!el) return;
    const allowed = tokensKey.split(",");
    const clean = parts.filter((p) => p.kind === "text" || allowed.includes(p.token));
    el.focus();
    const sel = window.getSelection();
    let r = range.current;
    if (!r || !el.contains(r.commonAncestorContainer)) { r = document.createRange(); r.selectNodeContents(el); r.collapse(false); }
    sel?.removeAllRanges();
    sel?.addRange(r);
    document.execCommand("insertHTML", false, toHtml(clean, multiline));
    save();
  };
  const insertRef = useRef(insertParts);
  useEffect(() => { insertRef.current = insertParts; });

  // Registro para la paleta, el cursor en el celular (selectionchange) y los cambios de formato que no se guardan.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ctx.register(id, { tokens: tokensKey.split(",") as EmailToken[], insert: (token) => insertRef.current([{ kind: "token", token }, { kind: "text", text: " " }]) });
    const onSelection = () => { if (document.activeElement === el) save(); };
    const onBefore = (e: InputEvent) => {
      // Negrita, cursiva, etc. no existen en el email: no se permiten (si no, se verían acá y no en el email).
      if (e.inputType.startsWith("format") || e.inputType === "insertFromDrop" || e.inputType === "deleteByDrag") { e.preventDefault(); return; }
      if (e.inputType === "insertParagraph" || e.inputType === "insertLineBreak") {
        e.preventDefault();
        if (multiline) document.execCommand("insertText", false, "\n");
      }
    };
    document.addEventListener("selectionchange", onSelection);
    el.addEventListener("beforeinput", onBefore);
    return () => { ctx.register(id, null); document.removeEventListener("selectionchange", onSelection); el.removeEventListener("beforeinput", onBefore); };
    // ctx cambia en cada render del proveedor; el registro solo depende del campo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tokensKey, multiline]);

  const copySelection = (e: React.ClipboardEvent, cut: boolean) => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount || sel.isCollapsed) return;
    const holder = document.createElement("div");
    holder.append(sel.getRangeAt(0).cloneContents());
    const parts = parseNodes(holder, multiline);
    e.preventDefault();
    e.clipboardData.setData(CLIP, JSON.stringify(parts));
    e.clipboardData.setData("text/plain", parts.map((p) => (p.kind === "text" ? p.text : TOKEN_LABEL[p.token])).join(""));
    if (cut) document.execCommand("delete");
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} id={id} role="textbox" aria-label={label} aria-multiline={multiline} contentEditable suppressContentEditableWarning tabIndex={0}
        data-placeholder={placeholder}
        onFocus={() => { ctx.activate(id); save(); }}
        onInput={emit} onKeyUp={save} onMouseUp={save}
        onCopy={(e) => copySelection(e, false)} onCut={(e) => copySelection(e, true)}
        onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}
        onPaste={(e) => {
          e.preventDefault();
          const own = e.clipboardData.getData(CLIP);
          if (own) {
            try { insertParts(JSON.parse(own) as Inline); return; } catch { /* formato viejo: va como texto */ }
          }
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, multiline ? text : text.replace(/\s*\n\s*/g, " "));
        }}
        className={cn("chip-editor min-h-11 w-full whitespace-pre-wrap break-words rounded-2xl border bg-surface px-3.5 py-2.5 text-[15px] leading-relaxed outline-none transition-colors focus:border-primary focus-visible:ring-4 focus-visible:ring-primary/12",
          isActive ? "border-primary/60" : "border-ink/12", multiline && "min-h-24")} />
    </div>
  );
}
