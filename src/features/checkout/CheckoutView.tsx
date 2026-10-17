"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import { giftsFromLines } from "@/demo/engine/gifts";
import { subscriptionsFromLines } from "@/demo/engine/subscriptions";
import { demoData } from "@/demo/engine/source";
import { toDayKey } from "@/lib/date";
import { missingForFreeShipping, totalsOf } from "@/demo/engine/pricing";
import { demoNow } from "@/demo/clock";
import { DEMO_ORDER_CODE, DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useAdmin } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { useSubscriptions } from "@/stores/subscriptions";
import { useHydrated } from "@/stores/hydration";
import { CouponForm } from "../cart/CouponForm";
import { useCartQuote } from "../cart/useCartQuote";
import { CheckoutSummary } from "./CheckoutSummary";
import { ConfirmStep } from "./ConfirmStep";
import { ContactStep } from "./ContactStep";
import { DeliveryStep } from "./DeliveryStep";
import { PaymentStep } from "./PaymentStep";
import { useOrderPromise } from "./useOrderPromise";

const STEPS = ["Datos", "Entrega", "Pago", "Confirmar"];

export function CheckoutView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const { quote, couponCheck, isRegistered } = useCartQuote();
  const lines = useCart((s) => s.lines);
  const clearCart = useCart((s) => s.clear);
  const isAccount = useAccount((s) => s.user !== null);
  const checkout = useCheckout();
  const mounted = useRef(false);
  const promise = useOrderPromise(lines);

  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [step]);

  if (!hydrated) return (
    <div role="status" aria-label="Cargando checkout" className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Skeleton className="h-10 w-full rounded-sm" /><Skeleton className="h-72 w-full rounded-sm" /><Skeleton className="h-48 w-full rounded-sm" />
    </div>
  );
  if (lines.length === 0 && !checkout.lastOrder?.code) {
    return <EmptyState title="No hay nada para pagar" action={<ButtonLink href="/">Ver productos</ButtonLink>}>Tu carrito está vacío. Agregá productos para iniciar el checkout de demostración.</EmptyState>;
  }
  if (lines.length === 0) {
    return <EmptyState title="El carrito está vacío" action={<ButtonLink href="/checkout/confirmacion/">Ver mi pedido de demostración</ButtonLink>}>Ya confirmaste un pedido de demostración.</EmptyState>;
  }

  const confirm = () => {
    // La hora de verdad sobre el día de la demo: el pedido queda fechado el mismo día que el resto de la demo.
    const createdAt = demoNow();
    // El carrito se lee en el momento: desde "¿Es para regalo?" se puede marcar un regalo y confirmar en el mismo toque.
    const lines = useCart.getState().lines;
    // Una sola fecha del calendario de despachos: la del pedido, la de sus regalos y la que se vio en Entrega.
    const promisedDate = promise(checkout.fulfillment!, lines).day;
    const gifts = giftsFromLines(lines, { orderCode: DEMO_ORDER_CODE, now: new Date(createdAt), eta: promisedDate, random: Math.random });
    if (gifts.length) useGifts.getState().addSent(gifts);
    const order = {
      code: DEMO_ORDER_CODE, token: DEMO_TRACKING_TOKEN, createdAt, contact: checkout.contact, promisedDate,
      fulfillment: checkout.fulfillment!, paymentMethod: checkout.paymentMethod!, lines, quote: totalsOf(quote), asAccount: isAccount,
      ...(gifts.length ? { gifts: gifts.map((g) => g.code) } : {}),
    };
    checkout.placeOrder(order);
    // "Todos los meses" (L3): cada pack suscripto queda en Mi cuenta → Mis suscripciones (simulado, sin cobro).
    const subs = subscriptionsFromLines(lines, [...(demoData().packs ?? []), ...(useCart.getState().customPacks ?? [])], { today: toDayKey(createdAt), orderCode: DEMO_ORDER_CODE, customer: checkout.contact.name || undefined, newId: () => `sub-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` });
    if (subs.length) useSubscriptions.getState().add(subs);
    useAdmin.getState().syncShopOrder(order); // aparece en el panel demo de este navegador
    // El cupón aplicado suma un uso: el premio de la ruleta (un uso) queda como utilizado y no se puede volver a aplicar.
    if (couponCheck?.ok) useAdmin.getState().redeemCoupon(couponCheck.coupon.code);
    clearCart();
    router.push("/checkout/confirmacion/");
  };

  return (
    // Una columna: las opciones del paso, sus botones Atrás/Siguiente (en el lugar y orden de siempre) y debajo el
    // resumen con el total, que se actualiza al cambiar entrega, cupón o medio de pago (8.2.9).
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <StepIndicator steps={STEPS} current={step} />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-extrabold focus:outline-none">{STEPS[step]}</h2>
      <div key={step} className="animate-fade-up">
        {step === 0 && <ContactStep onNext={() => setStep(1)} />}
        {step === 1 && <DeliveryStep onNext={() => setStep(2)} onBack={() => setStep(0)} freeShipping={missingForFreeShipping(quote.subtotal) === 0} />}
        {step === 2 && <PaymentStep onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <ConfirmStep onBack={() => setStep(2)} onConfirm={confirm} onEdit={setStep} />}
      </div>
      {/* El cupón se puede quitar o cambiar hasta confirmar; quitar el de la ruleta lo deja guardado (8.2.14). */}
      <section aria-label="Cupón del pedido" className="rounded-sm bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <CouponForm subtotal={quote.subtotal} isRegistered={isRegistered} check={couponCheck} where="checkout" />
      </section>
      <CheckoutSummary quote={quote} />
    </div>
  );
}
