"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOVED, movedTarget } from "./menu";

/**
 * Ruta anterior de una pantalla que se mudó (tabla `MOVED` de `menu.ts`). Lleva al lugar nuevo sin perder los parámetros
 * que traía el enlace: redirige al instante con el router y deja el enlace a la vista como respaldo (la exportación
 * estática no tiene redirecciones del servidor). No usa `<meta refresh>`: React lo deja en el <head> al navegar y
 * recargaría la pantalla a la que el usuario ya fue.
 */
export function ModuleMoved({ from }: { from: string }) {
  const router = useRouter();
  const moved = MOVED[from]!;
  const [href, setHref] = useState(moved.to);
  useEffect(() => {
    const target = movedTarget(from, window.location.search) ?? moved.to;
    setHref(target);
    router.replace(target);
  }, [router, from, moved.to]);
  return (
    <p role="status" className="rounded-sm bg-surface p-5 text-sm shadow-[var(--shadow-card)]">
      Esta sección ahora está en <Link href={href} className="font-bold text-primary underline">{moved.label}</Link>. Te llevamos…
    </p>
  );
}
