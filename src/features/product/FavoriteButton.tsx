"use client";
import { Heart } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/cn";
import { useFavorites } from "@/stores/favorites";
import { useHydrated } from "@/stores/hydration";
import { useToasts } from "@/stores/toast";

/** Corazón de favoritos (se guardan en este navegador; se ven en la pantalla Favoritos). */
export function FavoriteButton({ slug, name, className }: { slug: string; name: string; className?: string }) {
  const hydrated = useHydrated();
  const on = useFavorites((s) => hydrated && s.slugs.includes(slug));
  const toggle = useFavorites((s) => s.toggle);
  const toast = useToasts((s) => s.push);
  // Destello de corazoncitos solo al guardar con un toque (no al cargar la página con el favorito ya guardado).
  const [burst, setBurst] = useState(0);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? `Quitar ${name} de favoritos` : `Guardar ${name} en favoritos`}
      onClick={() => { const added = toggle(slug); if (added) setBurst((b) => b + 1); toast({ tone: "success", title: added ? "Guardado en favoritos" : "Quitado de favoritos", description: name, ...(added && { action: { label: "Ver favoritos", href: "/favoritos/" } }) }); }}
      className={cn("relative grid shrink-0 place-items-center rounded-full border transition-colors", on ? "border-clay/30 bg-[#fbe9e3] text-clay" : "border-ink/15 bg-surface text-ink hover:border-ink/30", className)}>
      <motion.span key={String(on)} initial={{ scale: on ? 0.6 : 1 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }}>
        <Heart size={20} aria-hidden="true" fill={on ? "currentColor" : "none"} />
      </motion.span>
      {burst > 0 && on && (
        <span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
          {Array.from({ length: 7 }, (_, i) => {
            const a = (i / 7) * Math.PI * 2 - Math.PI / 2;
            return <motion.span key={i} className="absolute h-1.5 w-1.5 rounded-full bg-clay" initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(a) * 22, y: Math.sin(a) * 22, opacity: 0, scale: 0.4 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />;
          })}
        </span>
      )}
    </button>
  );
}
