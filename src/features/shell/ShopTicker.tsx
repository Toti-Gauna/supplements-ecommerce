"use client";
import { ResetDemoButton } from "@/components/organisms/ResetDemoButton";
import { Ticker, type TickerItem } from "@/components/organisms/Ticker";
import { DEMO_TODAY } from "@/demo/fixtures/admin-orders";
import { useCadeteDay } from "@/features/delivery/useCadeteDay";
import { ThemeTryButton } from "@/features/themes/ThemeTryButton";
import { TickerSeason } from "@/features/themes/TickerSeason";
import { whenDay } from "@/lib/date";
import { formatARS } from "@/lib/money";
import { useDemoData } from "@/stores/admin";
import { hideTicker } from "./session";

const LINK = "ml-2 inline-flex min-h-6 items-center uppercase underline decoration-volt underline-offset-4 hover:text-volt";

/**
 * Cinta de la tienda: el aviso de demo (con "Reiniciar demo" y "Probar temáticas"), la fecha vigente con su cupón, la promesa del cadete
 * (calendario y cupo del panel, `useCadeteDay`) y las condiciones de compra. Reemplaza al aviso de demo de tres
 * líneas y a la cinta de la temática.
 */
export function ShopTicker() {
  const cadete = useCadeteDay();
  const transferPct = useDemoData((d) => d.settings.transferDiscountPct);
  const freeFrom = useDemoData((d) => d.settings.freeShippingFrom);
  const items: TickerItem[] = [
    { key: "demo", label: "Demo", text: <>No se cobra nada <span aria-hidden="true">·</span> <ResetDemoButton className={LINK} /> <ThemeTryButton className={LINK} /></> },
    { key: "cadete", label: "Cadete", text: `Pedí hoy, llega ${whenDay(cadete, DEMO_TODAY)}` },
    { key: "transfer", label: `−${transferPct} %`, text: "Con transferencia", wide: true },
    { key: "envio", label: "Envío gratis", text: `Desde ${formatARS(freeFrom)}`, wide: true },
  ];
  return <Ticker items={items} season={<TickerSeason />} onHide={hideTicker} />;
}
