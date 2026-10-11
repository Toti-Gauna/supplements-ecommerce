"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { EmptyState } from "@/components/molecules/EmptyState";
import { checkSteps, newProductDraft, PRODUCT_STEPS } from "@/demo/admin/product-steps";
import type { Product } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { useBackHref } from "./listReturn";
import { EditorBar } from "./products/EditorBar";
import { cameFromEditor, clearSnapshot, draftKey, forgetPreview, loadSnapshot, markPreview, previewHref, saveSnapshot } from "./products/editorDrafts";
import { EditorSections } from "./products/EditorSections";
import { EditorStepper } from "./products/EditorStepper";
import { useEditorNav } from "./products/useEditorNav";
import { useDemoSave } from "./useDemoSave";

const LIST = "/admin-demo/productos/";

interface EditorProps { draftKey: string; origin: "edit" | "new"; saved: Product | null }

/**
 * Editor de producto (8.3.20 y 8.3.21): alta y edición con los mismos bloques, foto primero. Todo es borrador hasta
 * "Guardar": ir a la vista previa, a otra sección o recargar la pestaña no lo pierde, y el alta no existe en el
 * catálogo hasta guardarla (ir y volver de la vista previa no crea productos).
 */
function Editor({ draftKey: key, origin, saved }: EditorProps) {
  const router = useRouter();
  const categories = useAdmin((s) => s.data.categories);
  const products = useAdmin((s) => s.data.products);
  const saveProduct = useAdmin((s) => s.saveProduct);
  const save = useDemoSave();
  const back = useBackHref(LIST);
  const [start] = useState(() => {
    const snap = loadSnapshot(key);
    const pristine = saved ?? newProductDraft(snap?.product.slug ?? `producto-nuevo-${Date.now().toString(36)}`, categories);
    return { snap, pristine, returning: cameFromEditor(key) };
  });
  const [d, setD] = useState<Product>(start.snap?.product ?? start.pristine);
  const [tried, setTried] = useState(false);
  const [asking, setAsking] = useState(false);
  /** Ya se guardó: el borrador no se vuelve a escribir mientras la página se va. */
  const done = useRef(false);
  const nav = useEditorNav(start.snap?.step ?? "foto");
  const dirty = JSON.stringify(d) !== JSON.stringify(start.pristine);
  const [restored, setRestored] = useState(() => !start.returning && dirty);
  const checks = checkSteps(d, categories);
  const missing = tried ? PRODUCT_STEPS.filter((s) => s.id !== "revision" && checks[s.id].errors.length).map((s) => s.id) : [];
  const set = (p: Partial<Product>) => setD((x) => ({ ...x, ...p }));
  const snapshot = () => ({ key, origin, product: d, step: nav.current, scrollY: window.scrollY });

  // El borrador se guarda en la pestaña mientras tenga cambios; sin cambios no queda nada viejo para "recuperar".
  useEffect(() => {
    if (done.current) return;
    if (dirty) saveSnapshot(snapshot()); else clearSnapshot(key);
  });
  useEffect(() => {
    if (!start.returning) return;
    forgetPreview();
    // Con ancla (#paso-…) la posición la pone la navegación; si no, se vuelve al mismo punto de la vista previa.
    if (start.snap && !location.hash) nav.restore(start.snap.scrollY, start.snap.step);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- solo al montar

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    const first = PRODUCT_STEPS.find((s) => s.id !== "revision" && checks[s.id].errors.length);
    if (first) { nav.goTo(first.id); return; }
    const title = origin === "new" ? (d.active === false ? "Producto creado (pausado)" : "Producto creado") : "Producto guardado";
    done.current = true;
    clearSnapshot(key);
    save(title, () => saveProduct(d));
    router.push(back);
  };
  const preview = () => { saveSnapshot(snapshot()); markPreview(key); router.push(previewHref(key)); };
  const discard = () => { setAsking(false); setRestored(false); setTried(false); clearSnapshot(key); setD(start.pristine); };

  return (
    <div className="@container">
      <EditorStepper layout="compact" checks={checks} current={nav.current} tried={tried} onGo={nav.goTo} />
      {restored && dirty && (
        <div role="status" className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-warning-soft px-4 py-3 text-sm ring-1 ring-warning/30">
          <p className="flex-1 font-bold text-warning">Recuperamos los cambios sin guardar de la última vez.</p>
          <Button size="sm" variant="secondary" onClick={() => setAsking(true)}>Descartar cambios</Button>
        </div>
      )}
      <div className="grid gap-6 @min-[56rem]:grid-cols-[minmax(0,1fr)_15rem]">
        <form noValidate onSubmit={submit} className="flex min-w-0 flex-col gap-5">
          <EditorSections d={d} set={set} checks={checks} tried={tried} categories={categories} products={products} onGo={nav.goTo} />
          <EditorBar missing={missing.length} dirty={dirty} isNew={origin === "new"} onShowMissing={() => missing[0] && nav.goTo(missing[0])} onDiscard={() => setAsking(true)} onPreview={preview} />
        </form>
        <EditorStepper layout="rail" checks={checks} current={nav.current} tried={tried} onGo={nav.goTo} />
      </div>
      <Sheet open={asking} onClose={() => setAsking(false)} title="¿Descartar los cambios?" side="dialog" className="bg-bg">
        <div className="flex flex-col gap-4 p-6 pt-7">
          <h2 className="pr-12 font-display text-2xl">¿Descartar los cambios?</h2>
          <p className="text-sm text-muted">{origin === "new" ? "El formulario vuelve a quedar vacío." : "El producto vuelve a como está guardado."} Lo guardado no cambia.</p>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="ghost" onClick={() => setAsking(false)}>Seguir editando</Button>
            <Button variant="danger" onClick={discard}>Descartar cambios</Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export function ProductEditor() {
  const params = useSearchParams();
  const isNew = params.get("nuevo") === "1";
  const slug = isNew ? null : params.get("id") ?? "";
  const product = useAdmin((s) => s.data.products.find((p) => p.slug === slug));
  const back = useBackHref(LIST);
  if (!isNew && !product) return <EmptyState title="Producto no encontrado en la demo" action={<ButtonLink href={LIST}>Ver productos</ButtonLink>} />;
  const key = draftKey(slug);
  return (
    <>
      <Link href={back} className="mb-3 flex w-fit items-center gap-1 text-sm font-bold text-primary"><ArrowLeft size={16} aria-hidden="true" /> Productos</Link>
      <h1 className="mb-4 text-2xl font-extrabold">{product ? `Editar: ${product.name}` : "Nuevo producto"} <span className="text-sm text-warning">(demo)</span></h1>
      <Editor key={key} draftKey={key} origin={isNew ? "new" : "edit"} saved={product ?? null} />
    </>
  );
}
