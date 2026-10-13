import "@fontsource-variable/big-shoulders-display";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/archivo/wdth-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource/caveat/600.css";
import "./globals.css";
import "./splash.css";
import "./seasons.css";
import "./motion.css";
import "./shop-shell.css";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { brand, brandCss } from "@/config/brand";
import { site } from "@/config/site";
import { SITE_URL, withBase } from "@/lib/base-path";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { ClientShell } from "@/components/organisms/ClientShell";
import { Splash, splashScript } from "@/components/organisms/Splash";
import { GlobalArtDefs } from "@/components/illustrations/supplements/GlobalDefs";
import { themeScript } from "@/components/atoms/ThemeToggle";
import { seasonAccentCss } from "@/features/themes/palettes";
import { seasonScript } from "@/features/themes/seasonScript";
import { sessionScript } from "@/features/shell/session";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s · ${brand.name}` },
  description: site.description,
  robots: site.indexable ? undefined : { index: false, follow: false },
  // Favicon con el símbolo y los colores de la marca, generado en build (app/brand-icon.svg/route.ts).
  icons: { icon: [{ url: withBase("/brand-icon.svg"), type: "image/svg+xml" }] },
  openGraph: {
    type: "website", locale: "es_AR", siteName: brand.name, title: site.title, description: site.description,
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: `${brand.name}, tienda online (demo)` }],
  },
};

// viewport-fit=cover: las barras fijas llegan al borde real de la pantalla (iOS) y los rellenos usan safe-area.
export const viewport: Viewport = {
  themeColor: brand.colors.background, width: "device-width", initialScale: 1, viewportFit: "cover" };

/** Datos estructurados solo con campos confirmados (nombre, ciudad, Instagram). */
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brand.name,
  address: { "@type": "PostalAddress", addressLocality: brand.city, addressCountry: "AR" },
  sameAs: brand.instagram ? [`https://instagram.com/${brand.instagram}`] : [],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" data-theme={brand.defaultMode} suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss() }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: seasonScript }} />
        <script dangerouslySetInnerHTML={{ __html: sessionScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <style dangerouslySetInnerHTML={{ __html: seasonAccentCss() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      </head>
      <body className="min-h-dvh pt-[env(safe-area-inset-top)] antialiased">
        <GlobalArtDefs />
        <Splash />
        {/* Tapa la zona de la barra de estado del celular: el contenido no se ve por detrás al hacer scroll. */}
        <div aria-hidden="true" data-safe-area-cover className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[env(safe-area-inset-top)] bg-bg" />
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
          Saltar al contenido
        </a>
        <MotionRoot>
          {children}
          <ClientShell />
        </MotionRoot>
      </body>
    </html>
  );
}
