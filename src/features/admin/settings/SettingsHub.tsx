"use client";
import { CreditCard, Landmark, MessageCircle, Truck } from "lucide-react";
import { formatARS } from "@/lib/money";
import { useAdmin } from "@/stores/admin";
import { AdminPageHeader } from "../AdminPageHeader";
import { HubCard, HubGrid } from "../marketing/HubCard";

export const SETTINGS_SECTION = { href: "/admin-demo/ajustes/", label: "Ajustes" };

/**
 * Ajustes (8.3.29): una tarjeta por tarea, cada una con su página. Sin el bloque de Marca: la identidad de Volta y las
 * temáticas siguen igual.
 */
export function SettingsHub() {
  const settings = useAdmin((s) => s.data.settings);
  const zones = useAdmin((s) => s.data.zones);
  const active = zones.filter((z) => z.active !== false).length;
  const methods = settings.enabledMethods.length;
  return (
    <>
      <AdminPageHeader title="Ajustes">Contacto, medios de pago, datos de cobro de muestra y envíos. Cada parte se edita en su página y, al guardar, se ve en la tienda de este navegador sin deploy.</AdminPageHeader>
      <HubGrid label="Partes de los ajustes">
        <HubCard href="/admin-demo/ajustes/contacto/" icon={MessageCircle} title="Contacto y WhatsApp" description="El número del botón de WhatsApp de la tienda." meta={settings.whatsappNumber ? `+${settings.whatsappNumber}` : "Sin número: el botón abre WhatsApp para elegir contacto"} action="Editar el contacto" />
        <HubCard href="/admin-demo/ajustes/pagos/" icon={CreditCard} title="Medios de pago" description="Qué medios se ofrecen en el checkout, el descuento por transferencia o QR y la reserva sin comprobante." meta={`${methods} ${methods === 1 ? "activo" : "activos"} · ${settings.transferDiscountPct}% por transferencia o QR · reserva ${settings.pendingTransferHours} h`} action="Editar los medios de pago" />
        <HubCard href="/admin-demo/ajustes/cobro/" icon={Landmark} title="Datos de cobro" description="Alias, CBU/CVU, titular y QR de muestra para transferencias. Solo datos ficticios." meta={`Alias ${settings.transferAlias}`} action="Editar los datos de cobro" />
        <HubCard href="/admin-demo/ajustes/envios/" icon={Truck} title="Envíos y retiro" description="Envío gratis desde un monto y cada forma de entrega: precio, plazo y códigos postales." meta={`Envío gratis desde ${formatARS(settings.freeShippingFrom)} · ${active} de ${zones.length} formas activas`} action="Editar los envíos" />
      </HubGrid>
    </>
  );
}
