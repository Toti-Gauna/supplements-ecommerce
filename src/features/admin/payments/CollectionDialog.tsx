"use client";
import { Sheet } from "@/components/motion/Sheet";
import { CollectionEditor } from "./CollectionEditor";

/** "Configurar datos de cobro" desde Pagos (8.3.30): modal centrado con el editor de Ajustes. Cerrar no guarda. */
export function CollectionDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Configurar datos de cobro" side="dialog" className="bg-bg">
      <div className="flex max-h-[94dvh] flex-col gap-4 overflow-y-auto p-6 pt-7 sm:max-h-[90dvh]">
        <div className="pr-12">
          <h2 className="font-display text-3xl">Datos de cobro</h2>
          <p className="mt-1 text-sm text-muted">Lo que ve el comprador para transferir o pagar con QR. Son los mismos datos de Ajustes: cambiarlos acá cambia los dos lugares y el checkout de las compras nuevas, sin aprobar pagos ni tocar pedidos.</p>
        </div>
        <CollectionEditor onDone={onClose} onCancel={onClose} />
      </div>
    </Sheet>
  );
}
