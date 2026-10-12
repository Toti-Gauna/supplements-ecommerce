"use client";
import { Field } from "@/components/atoms/Field";
import { Select } from "@/components/atoms/Select";
import type { CustomerView } from "@/demo/admin/customers";
import { GOAL_OPTIONS, goalName } from "@/demo/admin/segments";
import type { Goal } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { Panel } from "../detail/Panel";
import { useDemoSave } from "../useDemoSave";
import { BirthdayPicker, birthdayText } from "./BirthdayPicker";

/**
 * Objetivo y cumpleaños del cliente. El objetivo arma los segmentos y el filtro de Clientes; si no se eligió, la opción
 * vacía muestra el que sale de lo que compra.
 */
export function ProfileCard({ customer }: { customer: CustomerView }) {
  const profile = useAdmin((s) => s.workshop.profiles[customer.email.toLowerCase()]);
  const setGoal = useAdmin((s) => s.setCustomerGoal);
  const setBirthday = useAdmin((s) => s.setCustomerBirthday);
  const save = useDemoSave();
  const inferred = customer.goalFromPurchases ? `Según lo que compra: ${goalName(customer.goal)}` : "Sin definir";
  const onGoal = (value: string) => {
    const goal = (value || undefined) as Goal | undefined;
    save(goal ? `Objetivo: ${goalName(goal)}` : "Objetivo según lo que compra", () => setGoal(customer.email, goal));
  };
  const onBirthday = (b: string) => save(b ? `Cumpleaños: ${birthdayText(b)}` : "Cumpleaños borrado", () => setBirthday(customer.email, b || undefined));
  return (
    <Panel title="Objetivo y cumpleaños">
      <div className="flex flex-col gap-4">
        <Field id="cust-goal" label="Objetivo" hint="Lo usan los segmentos y el filtro de Clientes.">
          <Select id="cust-goal" aria-describedby="cust-goal-hint" value={profile?.goal ?? ""} onChange={(e) => onGoal(e.target.value)}>
            <option value="">{inferred}</option>
            {GOAL_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </Select>
        </Field>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Cumpleaños</span>
          <BirthdayPicker id="cust-bday" value={profile?.birthday ?? ""} onChange={onBirthday} />
        </div>
      </div>
    </Panel>
  );
}
