"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { overlapError } from "@/demo/admin/campaign-calendar";
import type { SeasonalTheme } from "@/demo/types";
import { useAdmin } from "@/stores/admin";
import { reloadWithTheme } from "@/features/themes/reloadWithTheme";
import { SubpageHeader } from "../marketing/SubpageHeader";
import { SaveBar } from "../SaveBar";
import { ThemeProductsField } from "../themes/ThemeProductsField";
import { useDemoSave } from "../useDemoSave";
import { useSessionDraft } from "../useSessionDraft";
import { CampaignCouponField } from "./CampaignCouponField";
import { CampaignFields } from "./CampaignFields";
import { CampaignPreview } from "./CampaignPreview";
import { CampaignResultCard } from "./CampaignResultCard";
import { CAMPAIGNS, piecesHref } from "./links";
import { RealDiscountWarning, useFakeDiscounts } from "./RealDiscountWarning";

const isTheme = (id: string) => (x: unknown): x is SeasonalTheme => {
  const t = x as SeasonalTheme | null;
  return !!t && t.id === id && typeof t.headline === "string" && typeof t.startsOn === "string" && Array.isArray(t.productSlugs);
};

/** Editor de una campaña (Panel → Campañas → Editar): textos, fechas, cupón y productos con la vista previa doble. */
export function CampaignEditor() {
  const id = useSearchParams().get("id") ?? "";
  const saved = useAdmin((s) => s.data.themes.find((t) => t.id === id));
  if (!saved) return <EmptyState title="No encontramos esa campaña" action={<Link href={CAMPAIGNS.href} className="font-bold text-primary underline">Volver a Campañas</Link>} />;
  return <Editor key={saved.id} saved={saved} />;
}

function Editor({ saved }: { saved: SeasonalTheme }) {
  const themes = useAdmin((s) => s.data.themes);
  const saveTheme = useAdmin((s) => s.saveTheme);
  const save = useDemoSave();
  const session = useSessionDraft<SeasonalTheme>(`volta-ui:campaign-draft:${saved.id}`, saved, isTheme(saved.id));
  const t = session.draft;
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<SeasonalTheme>) => { setError(null); session.setDraft((x) => ({ ...x, ...patch })); };
  const [seen, setSeen] = useState(saved);
  if (saved !== seen) { setSeen(saved); session.reset(saved); }
  const draftCoupon = useAdmin((s) => s.data.coupons.find((c) => c.code === t.couponCode));
  const fake = useFakeDiscounts(draftCoupon?.active === false ? null : draftCoupon, t.productSlugs);
  const overlap = t.startsOn && t.endsOn ? overlapError(t, themes) : null;

  useEffect(() => {
    if (!session.dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [session.dirty]);

  const submit = () => {
    if (!t.startsOn || !t.endsOn) return setError("Elegí las dos fechas.");
    if (overlap) return setError(overlap);
    if (!t.headline.trim() || !t.ribbon.trim()) return setError("El titular y la cinta no pueden quedar vacíos.");
    if (t.productSlugs.length === 0) return setError("Elegí al menos un producto para la campaña.");
    save(`${t.name} guardada`, () => saveTheme({ ...t, headline: t.headline.trim(), subtitle: t.subtitle.trim(), ribbon: t.ribbon.trim() }));
  };

  return (
    <>
      <SubpageHeader back={CAMPAIGNS} title={t.name}
        intro={t.sport ? "Día del deporte: la campaña habla de entrenar, con su cupón y productos para ese deporte." : "Fecha comercial: el Drop de la tienda, la cinta, el cupón como ticket y los productos en oferta."}
        actions={<div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => reloadWithTheme(t.id, "/")}><Eye size={16} aria-hidden="true" />Ver en la tienda</Button>
          <ButtonLink href={piecesHref(t.id)} variant="secondary"><Images size={16} aria-hidden="true" />Sacar las piezas</ButtonLink>
        </div>} />
      {session.restored && <p role="status" className="mb-4 rounded-sm bg-accent p-3 text-sm">Recuperamos los cambios que no habías guardado.</p>}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6 rounded-sm bg-surface p-5 shadow-[var(--shadow-card)]">
          <CampaignFields theme={t} set={set} overlap={overlap} />
          <CampaignCouponField theme={t} onChange={(couponCode) => set({ couponCode })} />
          <ThemeProductsField value={t.productSlugs} onChange={(productSlugs) => set({ productSlugs })} />
        </div>
        <div className="order-first flex min-w-0 flex-col gap-4 xl:order-none xl:sticky xl:top-4 xl:self-start">
          <CampaignPreview theme={t} />
          <RealDiscountWarning hits={fake} what={`${t.couponCode}`} />
          <CampaignResultCard theme={t} />
        </div>
      </div>
      <SaveBar dirty={session.dirty} label="Guardar campaña" onSave={submit} onDiscard={() => { setError(null); session.reset(); }}
        discardText="Vuelven el titular, las fechas, el cupón y los productos guardados." status={error ? <span className="text-danger">{error}</span> : undefined} />
    </>
  );
}
