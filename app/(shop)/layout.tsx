import { Suspense, type ReactNode } from "react";
import { Footer } from "@/components/organisms/Footer";
import { Header } from "@/components/organisms/Header";
import { LazyOverlays } from "@/components/organisms/LazyOverlays";
import { ShopBottomNav } from "@/components/organisms/ShopBottomNav";
import { WheelStage } from "@/features/club/WheelStage";
import { CompareTray } from "@/features/compare/CompareTray";
import { OwnerBar } from "@/features/owner/OwnerBar";
import { QuizInvite } from "@/features/quiz/QuizInvite";
import { ShopTicker } from "@/features/shell/ShopTicker";
import { ThemeStage } from "@/features/themes/ThemeStage";
import { VitrinaHost } from "@/features/themes/vitrina/VitrinaHost";

/**
 * Estructura de la tienda (R1): cinta de avisos ocultable, header de una línea, contenido, pie como ficha técnica del
 * local y, en el celular, el dock. Sin flotantes (salvo la bandeja chica del comparador, solo si hay algo elegido): "Probar temáticas" y WhatsApp viven en la cinta, el menú y el pie.
 * La primera visita (después de la pantalla de carga) invita al quiz una sola vez (L4). Debajo del header, la franja del
 * modo dueño (R4c), que solo aparece si se llegó desde el panel o con `?dueno=1`.
 */
export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeStage />
      <ShopTicker />
      <Header />
      <Suspense fallback={null}><OwnerBar /></Suspense>
      <main id="contenido" className="mx-auto w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 sm:pt-10">{children}</main>
      <Footer />
      <ShopBottomNav />
      <CompareTray />
      <WheelStage />
      <LazyOverlays />
      <QuizInvite />
      <VitrinaHost />
    </>
  );
}
