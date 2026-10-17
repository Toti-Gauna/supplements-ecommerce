import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Se remonta en cada navegación. Con View Transitions (Chrome, Safari 18+) la página vieja se desvanece y la nueva
 * sube en fundido (ver app/motion.css); el header y la barra inferior quedan quietos. Sin soporte, entra por CSS.
 */
export default function ShopTemplate({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      <div className="page-enter">{children}</div>
    </PageTransition>
  );
}
