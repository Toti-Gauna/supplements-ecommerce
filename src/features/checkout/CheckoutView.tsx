"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ButtonLink } from "@/components/atoms/Button";
import { Skeleton } from "@/components/atoms/Skeleton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StepIndicator } from "@/components/molecules/StepIndicator";
import { giftsFromLines } from "@/demo/engine/gifts";
import { missingForFreeShipping, quoteCart, totalsOf } from "@/demo/engine/pricing";
import { demoNow } from "@/demo/clock";
import { DEMO_ORDER_CODE, DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { useAccount } from "@/stores/account";
import { useAdmin } from "@/stores/admin";
import { useCart } from "@/stores/cart";
import { useCheckout } from "@/stores/checkout";
import { useGifts } from "@/stores/gifts";
import { useHydrated } from "@/stores/hydration";
import { useCartQuote } from "../cart/useCartQuote";
import { CheckoutTicket } from "./CheckoutTicket";
import { ConfirmStep } from "./ConfirmStep";
import { DetailsStep } from "./DetailsStep";
import { PaymentStep } from "./PaymentStep";
import { useOrderPromise } from "./useOrderPromise";

const STEPS = ["Datos y entrega", "Pago", "Revisar"];

/** Checkout en 3 pasos (R2): el paso a la izquierda y el ticket fijo a la derecha (plegable arriba en el celular). */
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
    <div role="status" aria-label="Cargando checkout" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <Skeleton className="h-[32rem] w-full rounded-sm" /><Skeleton className="h-80 w-full rounded-sm max-lg:hidden" />
    </div>
  );
  if (lines.length === 0 && !checkout.lastOrder?.code) {
    return <EmptyState title="No hay nada para pagar" action={<ButtonLink href="/">Ver productos</ButtonLink>}>Tu carrito está vacío. Agregá productos para empezar.</EmptyState>;
  }
  if (lines.length === 0) {
    return <EmptyState title="El carrito está vacío" action={<ButtonLink href="/checkout/confirmacion/">Ver mi pedido</ButtonLink>}>Ya confirmaste tu pedido de demostración.</EmptyState>;
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
    useAdmin.getState().syncShopOrder(order); // aparece en el panel demo de este navegador
    // El cupón aplicado suma un uso: el premio de la ruleta (un uso) queda como utilizado y no se puede volver a aplicar.
    if (couponCheck?.ok) useAdmin.getState().redeemCoupon(couponCheck.coupon.code);
    clearCart();
    router.push("/checkout/confirmacion/");
  };
  // Lo que ahorra este carrito pagando por transferencia o QR (se muestra en el paso Pago).
  const transferSavings = quoteCart(lines, { coupon: couponCheck?.ok ? couponCheck.coupon : null, paymentMethod: "BANK_TRANSFER", fulfillment: checkout.fulfillment }).transferDiscount;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-x-12">
      <div className="flex flex-col gap-5 lg:col-start-1 lg:row-start-1">
        <StepIndicator steps={STEPS} current={step} />
      </div>
      <CheckoutTicket quote={quote} couponCheck={couponCheck} isRegistered={isRegistered}
        className="lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start" />
      <section aria-labelledby="checkout-step" className="flex min-w-0 flex-col gap-5 lg:col-start-1 lg:row-start-2">
        <h2 id="checkout-step" ref={heading} tabIndex={-1} className="font-display text-3xl leading-none focus:outline-none sm:text-4xl">
          <span aria-hidden="true" className="mr-2 font-mono text-base text-muted">{String(step + 1).padStart(2, "0")}/03</span>{STEPS[step]}
        </h2>
        <div key={step} className="animate-fade-up">
          {step === 0 && <DetailsStep onNext={() => setStep(1)} freeShipping={missingForFreeShipping(quote.subtotal) === 0} />}
          {step === 1 && <PaymentStep onNext={() => setStep(2)} onBack={() => setStep(0)} transferSavings={transferSavings} />}
          {step === 2 && <ConfirmStep onBack={() => setStep(1)} onConfirm={confirm} onEdit={setStep} total={quote.total} />}
        </div>
      </section>
    </div>
  );
}
