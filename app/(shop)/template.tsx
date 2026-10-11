import { ViewTransition, type ReactNode } from "react";

/**
 * Se remonta en cada navegación. Con View Transitions (Chrome, Safari 18+) la página vieja se desvanece y la nueva
 * sube en fundido (ver app/motion.css); el header y la barra inferior quedan quietos. Sin soporte, entra por CSS.
 */
export default function ShopTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className="page-enter">{children}</div>
    </ViewTransition>
  );
}
