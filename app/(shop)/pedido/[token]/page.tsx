import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { DEMO_DELIVERED_TOKEN, DEMO_TRACKING_TOKEN } from "@/demo/fixtures/commerce";
import { TrackingView } from "@/features/order/TrackingView";

export const dynamicParams = false;

/**
 * Solo existen los tokens fijos de la demo: el del último pedido (o el de ejemplo) y el del pedido entregado de la
 * cuenta demo. En producción el token es de alta entropía y se valida en el servidor.
 */
export function generateStaticParams() {
  return [{ token: DEMO_TRACKING_TOKEN }, { token: DEMO_DELIVERED_TOKEN }];
}

export const metadata: Metadata = { title: "Seguimiento" };

export default async function TrackingPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <PageHeader title="Seguimiento de tu pedido" />
      <TrackingView token={token} />
    </>
  );
}
