"use client";
import { Plus } from "lucide-react";
import { TOKEN_LABEL, type EmailToken } from "@/demo/fixtures/emails";
import { cn } from "@/lib/cn";
import { useToasts } from "@/stores/toast";
import { useChipEditors } from "./ChipEditor";

/** Fichas de datos: se insertan con un toque donde está el cursor (asunto, títulos, textos, botones). */
export function TokenPalette({ tokens }: { tokens: EmailToken[] }) {
  const ctx = useChipEditors();
  const push = useToasts((s) => s.push);
  return (
    <div role="group" aria-label="Insertar dato" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto overflow-y-hidden px-1 sm:flex-wrap sm:overflow-visible">
      {tokens.map((token) => {
        const ok = ctx.allowed(token);
        return (
          <button key={token} type="button"
            // mousedown sin foco: el cursor queda en el campo de texto y la ficha entra ahí
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if (!ctx.insert(token)) push({ tone: "info", title: "Elegí dónde va el dato", description: "Tocá primero el asunto, un título, un texto o un botón; después la ficha." }); }}
            aria-label={`Insertar ${TOKEN_LABEL[token]}`}
            className={cn("inline-flex h-9 shrink-0 items-center gap-1 rounded-full px-3 text-[13px] font-bold ring-1 transition-colors",
              ok ? "bg-primary/12 text-primary ring-primary/25 hover:bg-primary/20" : "bg-surface text-muted ring-ink/10 hover:bg-accent")}>
            <Plus size={13} aria-hidden="true" />{TOKEN_LABEL[token]}
          </button>
        );
      })}
    </div>
  );
}
