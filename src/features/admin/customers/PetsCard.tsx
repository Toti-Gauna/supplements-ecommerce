"use client";
import { PawPrint, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Field";
import type { CustomerProfile, PetSpecies } from "@/demo/fixtures/workshop";
import { useAdmin } from "@/stores/admin";
import { Panel } from "../detail/Panel";
import { useDemoSave } from "../useDemoSave";
import { BirthdayPicker, birthdayText } from "./BirthdayPicker";

const SPECIES: Record<PetSpecies, string> = { perro: "Perro", gato: "Gato", otro: "Otra" };
const select = "h-12 rounded-2xl border border-ink/12 bg-surface px-3 text-base font-semibold";

/** Mascotas del cliente y alta de una nueva. El formulario se apila si la tarjeta es angosta (8.3.13). */
export function PetsCard({ email, profile }: { email: string; profile: CustomerProfile }) {
  const { savePet, removePet } = useAdmin();
  const save = useDemoSave();
  const [pet, setPet] = useState({ name: "", species: "perro" as PetSpecies, breed: "", birthday: "" });
  return (
    <Panel title="Mascotas" action={<PawPrint size={18} aria-hidden="true" className="text-brass-ink" />}>
      {profile.pets.length ? (
        <ul className="mb-4 flex flex-col divide-y divide-line">
          {profile.pets.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1"><span className="block font-bold">{p.name}</span><span className="text-sm text-muted">{SPECIES[p.species]}{p.breed ? ` · ${p.breed}` : ""} · {birthdayText(p.birthday)}</span></span>
              <button type="button" aria-label={`Quitar a ${p.name}`} onClick={() => save(`${p.name} quitado de la ficha`, () => removePet(email, p.id))}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-danger-soft hover:text-danger"><Trash2 size={16} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      ) : <p className="mb-4 text-sm text-muted">Sin mascotas cargadas.</p>}
      <form className="@container flex flex-col gap-3 rounded-2xl bg-bg p-3" onSubmit={(e) => {
        e.preventDefault();
        if (!pet.name.trim()) return;
        save(`${pet.name.trim()} agregado a la ficha`, () => savePet(email, { id: `pet-${Date.now().toString(36)}`, name: pet.name.trim(), species: pet.species, breed: pet.breed.trim() || undefined, birthday: pet.birthday || undefined }));
        setPet({ name: "", species: "perro", breed: "", birthday: "" });
      }}>
        <p className="text-sm font-bold">Agregar mascota</p>
        <div className="grid gap-3 @min-[24rem]:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs font-bold">Nombre<Input value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} placeholder="Pancho" /></label>
          <label className="flex flex-col gap-1 text-xs font-bold">Especie
            <select value={pet.species} onChange={(e) => setPet({ ...pet, species: e.target.value as PetSpecies })} className={select}>
              {(Object.keys(SPECIES) as PetSpecies[]).map((s) => <option key={s} value={s}>{SPECIES[s]}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-bold">Raza o color<Input value={pet.breed} onChange={(e) => setPet({ ...pet, breed: e.target.value })} placeholder="Opcional" /></label>
          <div className="flex flex-col gap-1 text-xs font-bold">Cumpleaños<BirthdayPicker id="pet-bday" value={pet.birthday} onChange={(birthday) => setPet({ ...pet, birthday })} /></div>
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={!pet.name.trim()} className="self-start"><Plus size={16} aria-hidden="true" /> Agregar</Button>
      </form>
    </Panel>
  );
}
