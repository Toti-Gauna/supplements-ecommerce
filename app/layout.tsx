import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces/opsz.css";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "@fontsource/caveat/600.css";
import "./globals.css";
import "./splash.css";
import "./seasons.css";
import "./characters.css";
import "./motion.css";
import type { Metadata, Viewport } from "next";
import type { CSSProperties, ReactNode } from "react";
import { brand, brandCssVariables } from "@/config/brand";
import { site } from "@/config/site";
import { SITE_URL } from "@/lib/base-path";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { ClientShell } from "@/components/organisms/ClientShell";
import { Splash, splashScript } from "@/components/organisms/Splash";
import { themeScript } from "@/components/atoms/ThemeToggle";
import { seasonPaletteCss } from "@/features/themes/palettes";
import { seasonScript } from "@/features/themes/seasonScript";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.title, template: `%s · ${brand.name} (demo)` },
  description: site.description,
  robots: site.indexable ? undefined : { index: false, follow: false },
  openGraph: {
    type: "website", locale: "es_AR", siteName: brand.name, title: site.title, description: site.description,
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: `${brand.name}, tienda online (demo)` }],
  },
};

// viewport-fit=cover: las barras fijas llegan al borde real de la pantalla (iOS) y los rellenos usan safe-area.
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: brand.colors.background }, { media: "(prefers-color-scheme: dark)", color: "#121510" }], width: "device-width", initialScale: 1, viewportFit: "cover" };

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
    <html lang="es-AR" suppressHydrationWarning style={brandCssVariables() as CSSProperties}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: seasonScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <style dangerouslySetInnerHTML={{ __html: seasonPaletteCss() }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      </head>
      <body className="min-h-dvh pt-[env(safe-area-inset-top)] antialiased">
        <Splash />
        {/* Tapa la zona de la barra de estado del celular: el contenido no se ve por detrás al hacer scroll. */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[env(safe-area-inset-top)] bg-bg" />
        <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
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
