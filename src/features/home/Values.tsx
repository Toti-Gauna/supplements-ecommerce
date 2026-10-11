import { FlaskConical, ShieldCheck, Truck, Zap } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

const VALUES = [
  { icon: ShieldCheck, title: "Originales, con lote", text: "Compramos a la marca o a su distribuidor oficial. Lote y vencimiento en cada ficha." },
  { icon: FlaskConical, title: "Info clara", text: "Tabla nutricional, precio por servicio y cómo tomarlo, sin promesas mágicas." },
  { icon: Zap, title: "Llega hoy", text: "Cadete en el día en Mar del Plata y envíos a todo el país." },
  { icon: Truck, title: "Pagás como prefieras", text: "Mercado Pago, transferencia o QR, con descuento." },
];

export function Values() {
  return (
    <ul className="grid gap-px overflow-hidden rounded-[2rem] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
      {VALUES.map(({ icon: Icon, title, text }, i) => (
        <Reveal as="li" key={title} delay={i * 0.06} className="flex flex-col gap-3 bg-bg p-6">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-night text-volt ring-1 ring-volt/25"><Icon size={20} aria-hidden="true" /></span>
          <p className="text-lg font-extrabold">{title}</p>
          <p className="text-sm text-muted">{text}</p>
        </Reveal>
      ))}
    </ul>
  );
}
