"use client";
import { Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { inputClass } from "@/components/atoms/Field";
import { cn } from "@/lib/cn";
import { STUDIO_TIPS } from "@/demo/fixtures/studio";
import { useToasts } from "@/stores/toast";

/** Texto sugerido para el posteo (VEL-63): se puede retocar, copiar o pedir otra idea de gancho. */
export function StudioCaption({ text, hookName, onAnother }: { text: string; hookName: string; onAnother: () => void }) {
  const toast = useToasts((s) => s.push);
  // Sigue al texto generado: si cambian la fecha, los productos o la idea, se reemplaza lo editado.
  const [value, setValue] = useState(text);
  const [seen, setSeen] = useState(text);
  if (text !== seen) { setSeen(text); setValue(text); }
  const copy = async () => {
    try {
      if (!navigator.clipboard) throw new Error("sin portapapeles");
      await navigator.clipboard.writeText(value);
      toast({ tone: "success", title: "Texto copiado", description: "Pegalo en Instagram al publicar." });
    } catch {
      toast({ tone: "error", title: "No se pudo copiar", description: "Seleccioná el texto y copialo a mano." });
    }
  };
  return (
    <section aria-labelledby="st-caption" className="rounded-3xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="st-caption" className="font-display text-2xl">Texto para el posteo</h2>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">Gancho: {hookName}</span>
      </div>
      <label htmlFor="st-caption-text" className="sr-only">Texto para el posteo</label>
      <textarea id="st-caption-text" value={value} onChange={(e) => setValue(e.target.value)} rows={11} className={cn(inputClass.replace("text-base", "text-sm"), "mt-3 min-h-28 py-2.5 font-mono leading-relaxed")} />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void copy()}><Copy size={16} aria-hidden="true" />Copiar texto</Button>
        <Button size="sm" variant="secondary" onClick={onAnother}><RefreshCw size={16} aria-hidden="true" />Otra idea</Button>
      </div>
      <ul className="mt-4 flex flex-col gap-1.5 text-xs text-muted">
        {STUDIO_TIPS.map((tip) => <li key={tip}>· {tip}</li>)}
      </ul>
    </section>
  );
}
