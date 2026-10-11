"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Gift, Heart, PartyPopper, Sparkles, TicketPercent, UserRound } from "lucide-react";
import { Logo } from "@/components/atoms/Logo";
import { Sheet } from "@/components/motion/Sheet";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { categoryHref, visibleCategories } from "@/demo/engine/catalog";
import { useDemoVersion } from "@/stores/admin";
import { useUi } from "@/stores/ui";

const LINKS = [
  { href: "/crear/", label: "Crear el tuyo", icon: Sparkles },
  { href: "/club/", label: "Club Volta", icon: Gift },
  { href: "/favoritos/", label: "Favoritos", icon: Heart },
  { href: "/cupones/", label: "Mis cupones", icon: TicketPercent },
  { href: "/regalo/", label: "Tengo un regalo", icon: PartyPopper },
  { href: "/cuenta/", label: "Mi cuenta", icon: UserRound },
];

/** Menú móvil a pantalla completa con entrada escalonada. */
export function MobileMenu() {
  useDemoVersion();
  const { menuOpen, setMenu } = useUi();
  const close = () => setMenu(false);
  return (
    <Sheet open={menuOpen} onClose={close} title="Menú" side="left" className="max-w-none sm:max-w-sm">
      <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-6">
        <Logo />
        <p className="eyebrow mt-10 text-muted">Tienda</p>
        <ul className="mt-3 flex flex-col">
          {visibleCategories().map((c, i) => (
            <motion.li key={c.slug} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.035 }}>
              <Link href={categoryHref(c.slug)} onClick={close} className="font-display flex items-center justify-between border-b border-line py-3 text-[1.65rem] leading-tight">
                {c.name}<ArrowUpRight size={20} aria-hidden="true" className="text-muted" />
              </Link>
            </motion.li>
          ))}
        </ul>
        <ul className="mt-8 grid gap-2">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}><Link href={href} onClick={close} className="flex min-h-12 items-center gap-3 rounded-2xl bg-surface px-4 font-bold"><Icon size={18} aria-hidden="true" className="text-primary" />{label}</Link></li>
          ))}
        </ul>
        <ThemeToggle withLabel className="mt-6 min-h-12 w-full rounded-2xl bg-surface px-4 font-bold text-ink" />
        <Link href="/preguntas/" onClick={close} className="mt-6 text-sm font-semibold text-muted underline underline-offset-4">Ayuda y preguntas frecuentes</Link>
      </div>
    </Sheet>
  );
}
