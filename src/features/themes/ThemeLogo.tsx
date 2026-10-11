"use client";
import { Logo } from "@/components/atoms/Logo";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { skinOf } from "./skins";
import { useCurrentTheme } from "./useCurrentTheme";

/** Logo de la tienda con el sombrero de la temática vigente (bruja, Papá Noel, duende…). */
export function ThemeLogo() {
  const { theme } = useCurrentTheme();
  return <Logo topper={theme ? <Decor key={theme.id} kind={skinOf(theme.id).topper} className="h-full w-full" /> : undefined} />;
}
