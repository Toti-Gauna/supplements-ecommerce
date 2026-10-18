"use client";
import Link from "next/link";
import { Cake, Gift, Link2, MessageCircle } from "lucide-react";
import { Button, buttonClass } from "@/components/atoms/Button";
import { ConfirmButton } from "@/components/molecules/ConfirmButton";
import { brand } from "@/config/brand";
import { BIRTHDAY_GIFT_AMOUNT, BIRTHDAY_PROFILE_DAYS, birthdayLink, birthdayMessage, birthdayState, birthdayWhen, giftPathFor } from "@/demo/admin/birthday";
import type { CustomerView } from "@/demo/admin/customers";
import { dayText } from "@/demo/admin/repurchase-text";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { useToasts } from "@/stores/toast";
import { useDemoSave } from "../useDemoSave";
import { shopUrl } from "./shopUrl";

/**
 * "Mandarle el regalo de cumpleaños" (R4c): si el cliente cumple en los próximos días, arma una gift card de la casa con
 * el sistema de regalos y deja el mensaje de WhatsApp con el link. Uno por año. Aparece en "Hoy en tu tienda" en su día.
 */
export function BirthdayGiftAction({ customer }: { customer: CustomerView }) {
  const profile = useAdmin((s) => s.workshop.profiles[customer.email.toLowerCase()]);
  const send = useAdmin((s) => s.sendBirthdayGift);
  const push = useToasts((s) => s.push);
  const save = useDemoSave();
  const state = birthdayState(profile, DEMO_TODAY);
  if (!state) return null;
  const gift = profile?.birthdayGift && profile.birthdayGift.year === Number(state.date.slice(0, 4)) ? profile.birthdayGift : null;
  const link = gift ? shopUrl(giftPathFor(gift.param)) : "";
  const wa = gift ? birthdayLink(customer.phone, customer.name, link, brand.name) : null;
  const copy = async () => {
    try { await navigator.clipboard.writeText(link); push({ tone: "success", title: "Link del regalo copiado" }); }
    catch { push({ tone: "error", title: "No se pudo copiar", description: link }); }
  };
  const soon = state.inDays <= BIRTHDAY_PROFILE_DAYS;
  return (
    <div id="regalo-cumple" data-birthday-gift className="flex flex-col gap-2 rounded-sm bg-accent p-3">
      <p className="flex items-center gap-2 text-sm font-bold"><Cake size={16} aria-hidden="true" />Cumple {birthdayWhen(state.inDays)} ({dayText(state.date)})</p>
      {gift ? (
        <>
          <p className="text-sm text-success">Regalo armado: gift card de {formatARS(BIRTHDAY_GIFT_AMOUNT)} <span className="font-lab">({gift.code})</span>. Está en Promos → Regalos.</p>
          <p className="rounded-sm bg-bg p-3 text-sm text-muted">{birthdayMessage(customer.name, "(link a su regalo)", brand.name)}<span className="sr-only"> El link completo va en el mensaje.</span></p>
          <div className="flex flex-wrap gap-2">
            {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp con el regalo de cumpleaños (se abre en otra pestaña)" className={buttonClass("primary", "sm", "min-h-10 px-3.5")}><MessageCircle size={15} aria-hidden="true" />Escribirle por WhatsApp</a>
              : <p className="text-sm text-muted">No tiene teléfono cargado: copiá el link y mandáselo.</p>}
            <Button variant="secondary" size="sm" className="min-h-10 px-3.5" onClick={copy}><Link2 size={15} aria-hidden="true" />Copiar el link</Button>
            <Link href={`/admin-demo/regalos/?ver=regalos&q=${gift.code}`} className={buttonClass("ghost", "sm", "min-h-10 px-3.5")}>Ver el regalo</Link>
          </div>
        </>
      ) : soon ? (
        <ConfirmButton variant="primary" size="sm" className="self-start" title="Armar el regalo de cumpleaños" confirmLabel="Sí, armar el regalo"
          description={<>Se emite una gift card de la casa de <strong>{formatARS(BIRTHDAY_GIFT_AMOUNT)}</strong> para {customer.name}. Se descuenta en su próxima compra y vence a los 12 meses; no es un pago. Después te dejamos el mensaje de WhatsApp.</>}
          onConfirm={() => save("Regalo de cumpleaños armado", () => { if (!send(customer.email, customer.name)) return "No se pudo armar: ya tiene el regalo de este año."; })}>
          <Gift size={15} aria-hidden="true" /> Mandarle el regalo de cumpleaños
        </ConfirmButton>
      ) : <p className="text-sm text-muted">El regalo se puede armar desde {BIRTHDAY_PROFILE_DAYS} días antes.</p>}
    </div>
  );
}
