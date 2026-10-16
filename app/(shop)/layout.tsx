import type { ReactNode } from "react";
import { Footer } from "@/components/organisms/Footer";
import { Header } from "@/components/organisms/Header";
import { LazyOverlays } from "@/components/organisms/LazyOverlays";
import { ShopBottomNav } from "@/components/organisms/ShopBottomNav";
import { WheelStage } from "@/features/club/WheelStage";
import { QuizInvite } from "@/features/quiz/QuizInvite";
import { ShopTicker } from "@/features/shell/ShopTicker";
import { ThemeStage } from "@/features/themes/ThemeStage";

/**
 * Estructura de la tienda (R1): cinta de avisos ocultable, header de una línea, contenido, pie como ficha técnica del
 * local y, en el celular, el dock. Sin flotantes: "Probar temáticas" y WhatsApp viven en la cinta, el menú y el pie.
 * La primera visita (después de la pantalla de carga) invita al quiz una sola vez (L4).
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeStage />
      <ShopTicker />
      <Header />
      <main id="contenido" className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">{children}</main>
      <Footer />
      <ShopBottomNav />
      <WheelStage />
      <LazyOverlays />
      <QuizInvite />
    </>
  );
}
