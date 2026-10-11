import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { TrackingView } from "@/features/order/TrackingView";

export const dynamicParams = false;

/** Solo existe el token fijo de demo. En producción el token es de alta entropía y se valida en el servidor. */
export function generateStaticParams() {
  return [{ token: DEMO_TRACKING_TOKEN }];
}

export const metadata: Metadata = { title: "Seguimiento (demo)" };

export default function TrackingPage() {
  return (
    <>
      <PageHeader title="Seguimiento de tu pedido" />
      <TrackingView />
    </>
  );
}
