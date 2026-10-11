"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import { promiseFor } from "@/demo/engine/delivery";
import { giftsFromLines } from "@/demo/engine/gifts";
import { missingForFreeShipping, totalsOf } from "@/demo/engine/pricing";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { DEMO_ORDER_CODE, DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useAdmin } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { useHydrated } from "@/stores/hydration";
import { CouponForm } from "../cart/CouponForm";
import { useCartQuote } from "../cart/useCartQuote";
import { CheckoutSummary } from "./CheckoutSummary";
import { ConfirmStep } from "./ConfirmStep";
import { ContactStep } from "./ContactStep";
import { DeliveryStep } from "./DeliveryStep";
import { PaymentStep } from "./PaymentStep";

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

  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [step]);

  if (!hydrated) return (
    <div role="status" aria-label="Cargando checkout" className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <Skeleton className="h-10 w-full rounded-full" /><Skeleton className="h-72 w-full rounded-3xl" /><Skeleton className="h-48 w-full rounded-3xl" />
    </div>
  );
  if (lines.length === 0 && !checkout.lastOrder?.code) {
    return <EmptyState title="No hay nada para pagar" action={<ButtonLink href="/">Ver productos</ButtonLink>}>Tu carrito está vacío. Agregá productos para iniciar el checkout de demostración.</EmptyState>;
  }
  if (lines.length === 0) {
    return <EmptyState title="El carrito está vacío" action={<ButtonLink href="/checkout/confirmacion/">Ver mi pedido de demostración</ButtonLink>}>Ya confirmaste un pedido de demostración.</EmptyState>;
  }

  const confirm = () => {
    const now = new Date();
    // El carrito se lee en el momento: desde "¿Es para regalo?" se puede marcar un regalo y confirmar en el mismo toque.
    const lines = useCart.getState().lines;
    // Cada línea marcada como regalo genera su código y su link; la fecha estimada sale del calendario del taller.
    const { orders, workshop } = useAdmin.getState();
    const gifts = giftsFromLines(lines, { orderCode: DEMO_ORDER_CODE, now, eta: promiseFor(lines, DEMO_TODAY, orders, workshop.settings, DEMO_ORDER_CODE).day, random: Math.random });
    if (gifts.length) useGifts.getState().addSent(gifts);
    const order = {
      code: DEMO_ORDER_CODE, token: DEMO_TRACKING_TOKEN, createdAt: now.toISOString(), contact: checkout.contact,
      fulfillment: checkout.fulfillment!, paymentMethod: checkout.paymentMethod!, lines, quote: totalsOf(quote), asAccount: isAccount,
      ...(gifts.length ? { gifts: gifts.map((g) => g.code) } : {}),
    };
    checkout.placeOrder(order);
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
      <section aria-label="Cupón del pedido" className="rounded-3xl bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
        <CouponForm subtotal={quote.subtotal} isRegistered={isRegistered} check={couponCheck} where="checkout" />
      </section>
      <CheckoutSummary quote={quote} />
    </div>
  );
}
