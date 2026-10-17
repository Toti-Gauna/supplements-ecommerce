import type { Metadata } from "next";
import { RegalarView } from "@/features/gifts/regalar/RegalarView";

export const metadata: Metadata = {
  title: "Regalá energía",
  description: "Regalá un producto, un stack o una gift card con monto. Mandá la tarjeta por WhatsApp: lo abre a golpes o con una combinación.",
};

/** "Regalá energía" (R3b): elegir qué regalar y armar el regalo con la tarjeta en vivo. */
export default function RegalarPage() {
  return <RegalarView />;
}
