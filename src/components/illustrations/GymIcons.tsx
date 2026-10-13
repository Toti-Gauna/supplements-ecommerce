import type { ReactNode, SVGProps } from "react";

/**
 * Íconos de marca del box (trazo propio, 24 × 24, `currentColor`): disco, barra, pesa rusa, shaker y cronómetro. Van
 * donde la marca habla (estados vacíos, ficha del local, menú); para la interfaz común siguen los de lucide. Mismo
 * contrato que lucide (`size`, `strokeWidth`, `className`) para poder cambiarlos sin tocar el diseño.
 */
export interface GymIconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
  strokeWidth?: number;
}

function Icon({ size = 24, strokeWidth = 2, children, ...rest }: GymIconProps & { children: ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" focusable="false" {...rest}>
      {children}
    </svg>
  );
}

/** Disco olímpico: aro, cara y el buje central. */
export function IconPlate(props: GymIconProps) {
  return <Icon {...props}><circle cx="12" cy="12" r="9.5" /><circle cx="12" cy="12" r="5.5" strokeOpacity=".55" /><circle cx="12" cy="12" r="1.8" /></Icon>;
}

/** Barra cargada: discos a los lados y los collarines. */
export function IconBarbell(props: GymIconProps) {
  return <Icon {...props}><path d="M1.5 12h21" /><path d="M5 7v10M8 5v14M16 5v14M19 7v10" /></Icon>;
}

/** Pesa rusa: manija y cuerpo con base plana. */
export function IconKettlebell(props: GymIconProps) {
  return <Icon {...props}><path d="M8.5 9.5V8a3.5 3.5 0 0 1 7 0v1.5" /><path d="M7 21h10l1.3-2.2A7 7 0 1 0 5.7 18.8z" /></Icon>;
}

/** Shaker: tapa, pico y vaso con marcas de medida. */
export function IconShaker(props: GymIconProps) {
  return <Icon {...props}><path d="M10 2.5h4M8 5.5h8" /><path d="M7.5 8.5h9L15.5 21.5h-7z" /><path d="M10 12.5h3M10 16h2" strokeOpacity=".6" /></Icon>;
}

/** Cronómetro: corona, esfera y la aguja en la cuenta. */
export function IconStopwatch(props: GymIconProps) {
  return <Icon {...props}><path d="M9.5 2h5M12 2v3M18.5 6.5 20 5" /><circle cx="12" cy="13.5" r="8" /><path d="M12 13.5V9" /></Icon>;
}
