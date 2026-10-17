"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { cleanPack, newPackDraft } from "@/demo/admin/packs";
import { quotePack, validatePack } from "@/demo/engine/packs";
import type { Pack } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useBackHref } from "../listReturn";
import { SaveBar } from "../SaveBar";
import { savedInBrowser } from "../savedInBrowser";
import { useSessionDraft } from "../useSessionDraft";
import { PackFields } from "./PackFields";
import { PackItemsEditor } from "./PackItemsEditor";
import { PackPreview } from "./PackPreview";

const LIST = "/admin-demo/packs/";
const isPack = (x: unknown): x is Pack => { const p = x as Pack | null; return !!p && typeof p.name === "string" && Array.isArray(p.items) && typeof p.discountPct === "number"; };

function PackForm({ saved, isNew }: { saved: Pack; isNew: boolean }) {
  const router = useRouter();
  const back = useBackHref(LIST);
  const products = useAdmin((s) => s.data.products);
  const categories = useAdmin((s) => s.data.categories);
  const packs = useAdmin((s) => s.data.packs);
  const { savePack, removePack } = useAdmin();
  const push = useToasts((s) => s.push);
  const session = useSessionDraft<Pack>(`volta-ui:pack-draft:${isNew ? "nuevo" : saved.id}`, saved, isPack);
  const [tried, setTried] = useState(false);
  const d = session.draft;
  const errors = validatePack(cleanPack(d), packs);
  const set = (patch: Partial<Pack>) => session.setDraft((c) => ({ ...c, ...patch }));
  // Recargar o cerrar la pestaña con cambios sin guardar pide confirmación; salir a otra sección conserva el borrador.
  useEffect(() => {
    if (!session.dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [session.dirty]);
  const submit = () => {
    setTried(true);
    if (errors.length) return;
    const id = savePack(d);
    if (!savedInBrowser((data) => data.packs, useAdmin.getState().data.packs)) {
      if (isNew) removePack(id); else savePack(saved);
      push({ tone: "error", title: "No hay lugar para guardar el pack", description: "Este navegador se quedó sin espacio. Tus cambios siguen en el editor." });
      return;
    }
    session.reset(cleanPack({ ...d, id }));
    push({ tone: "success", title: isNew ? "Pack creado" : "Pack guardado", description: "Ya se ve en la tienda de este navegador (solo en esta demo).", action: { label: "Ver los packs", href: "/packs/" } });
    router.push(back);
  };
  return (
    <div>
      <Link href={back} className="mb-3 flex w-fit items-center gap-1 text-sm font-bold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Packs</Link>
      <h1 className="font-display mb-6 text-4xl sm:text-5xl">{isNew ? "Nuevo pack" : `Editar: ${saved.name}`}</h1>
      {session.restored && <p role="status" className="mb-4 rounded-sm bg-warning-soft px-4 py-3 text-sm font-bold text-warning ring-1 ring-warning/30">Recuperamos los cambios que quedaron sin guardar.</p>}
      {session.storageError && <p role="alert" className="mb-4 rounded-sm bg-warning-soft p-3 text-sm font-semibold text-warning">No hay espacio para conservar este borrador al salir: guardá antes de irte.</p>}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-4">
          <PackFields d={d} onChange={set} />
          <PackItemsEditor items={d.items} products={products} categories={categories} onChange={(items) => set({ items })} />
        </div>
        <PackPreview quote={quotePack(cleanPack(d))} />
      </div>
      {tried && errors.length > 0 && (
        <div role="alert" className="mt-6 rounded-sm bg-danger-soft p-4 text-sm text-danger ring-1 ring-danger/30">
          <p className="font-extrabold">Todavía no se puede guardar:</p>
          <ul className="mt-1 list-disc pl-5 font-semibold">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <SaveBar onSave={submit} dirty={session.dirty} label="Guardar pack" discardText={isNew ? "El formulario vuelve a quedar vacío." : "El pack vuelve a como está guardado."}
        onDiscard={() => { session.reset(); setTried(false); }} />
    </div>
  );
}

/** Editor de un pack (alta con `?nuevo=1`, edición con `?id=`). Es un borrador hasta "Guardar pack"; guardar lo deja en la tienda. */
export function PackEditor() {
  const params = useSearchParams();
  const isNew = params.get("nuevo") === "1";
  const id = isNew ? null : params.get("id") ?? "";
  const pack = useAdmin((s) => s.data.packs.find((p) => p.id === id));
  const [blank] = useState(newPackDraft);
  if (!isNew && !pack) return <EmptyState title="Pack no encontrado en la demo" action={<ButtonLink href={LIST}>Ver los packs</ButtonLink>}>Puede que lo hayas quitado o que el enlace esté incompleto.</EmptyState>;
  return <PackForm key={id ?? "nuevo"} saved={pack ?? blank} isNew={isNew} />;
}
