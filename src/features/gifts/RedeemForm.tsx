"use client";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { normalizeGiftCode } from "@/demo/engine/gifts";

/**
 * Canjear un regalo con su código (REGALO-XXXX-XXXX), como una entrada de la taquilla (R3b): talón troquelado a la
 * izquierda y el código a la derecha. Acepta minúsculas y sin guiones.
 */
export function RedeemForm({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | undefined>();
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const code = normalizeGiftCode(value);
    if (!code) { setError("Revisá el código: son 8 letras y números después de REGALO."); return; }
    router.push(`/regalo/?c=${code}`);
  };
  return (
    <form onSubmit={submit} noValidate aria-label="Entrada con código" className="relative grid w-full grid-cols-[2.75rem_minmax(0,1fr)] rounded-sm bg-surface text-left shadow-[var(--shadow-card)] ring-1 ring-line">
      {/* Talón: rótulo vertical y troquel con muescas. */}
      <div aria-hidden="true" className="relative flex items-center justify-center rounded-l-sm border-r-2 border-dashed border-line bg-night text-volt">
        <span className="font-mono text-[11px] font-extrabold uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">Entrada</span>
        <span className="absolute -right-2.5 -top-2.5 h-5 w-5 rounded-full bg-bg" />
        <span className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full bg-bg" />
      </div>
      <div className="flex flex-col gap-3 p-5">
        <Field id="gift-code" label="Código del regalo" hint="Está en la tarjeta o en el mensaje que te mandaron." error={error}>
          <Input id="gift-code" value={value} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="REGALO-XXXX-XXXX"
            onChange={(e) => { setValue(e.target.value); setError(undefined); }} aria-invalid={Boolean(error)} aria-describedby={describedBy("gift-code", error, true)}
            className="font-mono text-lg uppercase tracking-wider" />
        </Field>
        <Button type="submit" size="lg"><KeyRound size={18} aria-hidden="true" /> Abrir regalo</Button>
      </div>
    </form>
  );
}
