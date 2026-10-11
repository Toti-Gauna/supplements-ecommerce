"use client";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/atoms/Button";
import { Field, Input, describedBy } from "@/components/atoms/Field";
import { normalizeGiftCode } from "@/demo/engine/gifts";

/** Canjear un regalo con su código (REGALO-XXXX-XXXX). Acepta minúsculas y sin guiones. */
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
    <form onSubmit={submit} noValidate className="flex w-full flex-col gap-3 rounded-[1.6rem] bg-surface p-5 text-left shadow-[var(--shadow-card)]">
      <Field id="gift-code" label="Código del regalo" hint="Lo encontrás en el mensaje que te mandaron." error={error}>
        <Input id="gift-code" value={value} autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="REGALO-XXXX-XXXX"
          onChange={(e) => { setValue(e.target.value); setError(undefined); }} aria-invalid={Boolean(error)} aria-describedby={describedBy("gift-code", error, true)}
          className="font-mono uppercase tracking-wider" />
      </Field>
      <Button type="submit" size="lg"><KeyRound size={18} aria-hidden="true" /> Abrir regalo</Button>
    </form>
  );
}
