"use client";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { DateInput } from "@/components/atoms/DateInput";
import { Input } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import { Switch } from "@/components/atoms/Switch";
import { normalizeCode } from "@/demo/engine/coupons";
import type { Coupon } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { NumberField } from "./NumberField";
import { useDemoSave } from "./useDemoSave";

const TYPES: { value: Coupon["type"]; label: string }[] = [{ value: "PERCENT", label: "Porcentaje" }, { value: "FIXED", label: "Monto fijo (ARS)" }, { value: "FREE_SHIPPING", label: "Envío gratis" }];

export function CouponForm({ onDone }: { onDone: () => void }) {
  const coupons = useAdmin((s) => s.data.coupons);
  const saveCoupon = useAdmin((s) => s.saveCoupon);
  const save = useDemoSave();
  const [c, setC] = useState<Coupon>({ code: "", type: "PERCENT", value: 10, description: "", active: true, usedCount: 0 });
  const [error, setError] = useState<string | null>(null);
  const set = (p: Partial<Coupon>) => setC((x) => ({ ...x, ...p }));
  return (
    <form noValidate className="flex flex-col gap-3 rounded-2xl border-2 border-primary bg-surface p-4" onSubmit={(e) => {
      e.preventDefault();
      const code = normalizeCode(c.code);
      if (!/^[A-Z0-9]{3,20}$/.test(code)) return setError("Código de 3 a 20 letras o números, sin espacios.");
      if (coupons.some((x) => x.code === code)) return setError(`Ya existe el cupón ${code}.`);
      if (c.type === "PERCENT" && (c.value < 1 || c.value > 100)) return setError("El porcentaje va de 1 a 100.");
      save(`Cupón ${code} creado`, () => saveCoupon({ ...c, code, description: c.description || `Cupón ${code}` }));
      onDone();
    }}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm font-bold">Código<Input value={c.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} placeholder="FERIA10" autoCapitalize="characters" /></label>
        <label className="flex flex-col gap-1 text-sm font-bold">Tipo<Select value={c.type} onChange={(e) => set({ type: e.target.value as Coupon["type"] })}>{TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select></label>
        {c.type !== "FREE_SHIPPING" && <NumberField id="cp-value" label="Valor" suffix={c.type === "PERCENT" ? "%" : "ARS"} value={c.value} onChange={(n) => set({ value: n })} />}
        <NumberField id="cp-min" label="Compra mínima" suffix="ARS" value={c.minSubtotal} onChange={(n) => set({ minSubtotal: n || undefined })} hint="0 = sin mínimo" />
        <NumberField id="cp-max" label="Usos totales" value={c.maxUses} onChange={(n) => set({ maxUses: n || undefined })} hint="0 = sin límite" />
        <label className="flex min-w-0 flex-col gap-1 text-sm font-bold">Vence<DateInput value={c.endsAt ?? ""} onChange={(e) => set({ endsAt: e.target.value || undefined })} /></label>
        <label className="flex flex-col gap-1 text-sm font-bold sm:col-span-2">Descripción<Input value={c.description} onChange={(e) => set({ description: e.target.value })} placeholder="10% para clientes de la feria" /></label>
      </div>
      <Switch checked={c.onlyRegistered ?? false} onChange={(v) => set({ onlyRegistered: v })} label="Solo con cuenta" />
      {error && <p role="alert" className="text-sm font-semibold text-danger">{error}</p>}
      <div className="flex gap-2"><Button type="submit" size="sm">Crear cupón</Button><Button variant="ghost" size="sm" onClick={onDone}>Cancelar</Button></div>
    </form>
  );
}
