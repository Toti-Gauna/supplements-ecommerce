"use client";
import dynamic from "next/dynamic";
import { ImmersiveStage } from "@/components/motion/ImmersiveStage";
import { useUi } from "@/stores/ui";

interface PanelProps { open: boolean; checkout: boolean; onClose: () => void }

/** Si el archivo de la ruleta no llega (red cortada), se avisa en el mismo escenario y se puede salir. */
function Unavailable({ open, onClose }: PanelProps) {
  return (
    <ImmersiveStage open={open} onClose={onClose} label="Ruleta de cupones">
      <p className="max-w-xs text-center text-[#cfc6b3]">No pudimos cargar la ruleta. Revisá la conexión y probá de nuevo.</p>
    </ImmersiveStage>
  );
}

// El escenario de la ruleta (disco, cupón temático) se descarga la primera vez que se abre (y se precarga con la
// página quieta, ver LazyOverlays). Mientras baja, la pantalla ya se oscurece.
const WheelStagePanel = dynamic<PanelProps>(() => import("./WheelStagePanel").catch(() => ({ default: Unavailable })), {
  ssr: false,
  loading: () => <div aria-hidden="true" className="fixed inset-0 z-[80] bg-[#07080a]/90" />,
});

/** Ruleta a pantalla completa: liviana en el layout de la tienda; el panel se carga al abrirla. */
export function WheelStage() {
  const { wheelOpen, wheelMode, setWheel } = useUi();
  if (!wheelOpen) return null;
  return <WheelStagePanel open checkout={wheelMode === "checkout"} onClose={() => setWheel(false)} />;
}
