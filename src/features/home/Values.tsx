import { Hammer, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const VALUES = [
  { icon: Sparkles, title: "Lo ves antes de pagar", text: "Vista previa de tu pieza con tu nombre o tu foto." },
  { icon: Hammer, title: "Hecho a mano en MdP", text: "Impresión 3D, madera y láser, pieza por pieza." },
  { icon: ShieldCheck, title: "Pagás como prefieras", text: "Mercado Pago, transferencia o QR. Con comprobante." },
  { icon: Truck, title: "Llega a tu casa", text: "Cadete en Mar del Plata, envíos al país o retiro." },
];

export function Values() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map(({ icon: Icon, title, text }, i) => (
        <Reveal as="li" key={title} delay={i * 0.06} className="flex flex-col gap-3 bg-bg p-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-primary"><Icon size={20} aria-hidden="true" /></span>
          <p className="text-lg font-extrabold">{title}</p>
          <p className="text-sm text-muted">{text}</p>
        </Reveal>
      ))}
    </ul>
  );
}
