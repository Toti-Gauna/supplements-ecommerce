"use client";
import Link from "next/link";
import { ArrowUpRight, Gift, Heart, TicketPercent, UserRound } from "lucide-react";
import { IconBarbell, IconKettlebell, IconShaker } from "@/components/illustrations/GymIcons";
import { Logo } from "@/components/atoms/Logo";
import { Sheet } from "@/components/motion/Sheet";
import { SoundToggle } from "@/components/atoms/SoundToggle";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";
import { categoryHref, visibleCategories } from "@/demo/engine/catalog";
import { ThemeTryButton } from "@/features/themes/ThemeTryButton";
import { useDemoVersion } from "@/stores/admin";
import { useUi } from "@/stores/ui";
import { brand } from "@/config/brand";
import { WhatsAppLink } from "./WhatsAppLink";

const LINKS = [
  { href: "/crear/", label: "Armá tu stack", icon: IconBarbell },
  { href: "/club/", label: brand.club, icon: IconKettlebell },
  { href: "/club/juego/", label: "Shaker Rush", icon: IconShaker },
  { href: "/favoritos/", label: "Favoritos", icon: Heart },
  { href: "/cupones/", label: "Mis cupones", icon: TicketPercent },
  { href: "/regalo/", label: "Tengo un regalo", icon: Gift },
  { href: "/cuenta/", label: "Mi cuenta", icon: UserRound },
];
const ROW = "flex min-h-12 w-full items-center gap-3 border-b border-line px-1 text-left font-mono text-[13px] font-bold uppercase tracking-[0.06em] text-ink";
const RAIL = "eyebrow mt-8 flex items-center gap-2 text-muted after:h-px after:flex-1 after:bg-line";

/** Menú del celular: las categorías como un estante numerado, los accesos, y las preferencias y la demo al pie. */
export function MobileMenu() {
  useDemoVersion();
  const { menuOpen, setMenu } = useUi();
  const close = () => setMenu(false);
  return (
    <Sheet open={menuOpen} onClose={close} title="Menú" side="left" className="max-w-none sm:max-w-sm">
      <div className="flex h-full flex-col overflow-y-auto px-5 pb-8 pt-5">
        <Logo />
        <p className={RAIL}>Tienda</p>
        <ol className="mt-1 flex flex-col">
          {visibleCategories().map((c, i) => (
            <li key={c.slug}>
              <Link href={categoryHref(c.slug)} onClick={close} className="group flex items-baseline gap-3 border-b border-line py-2.5">
                <span aria-hidden="true" className="font-mono text-[11px] font-bold text-volt-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display flex-1 text-[1.7rem]">{c.name}</span>
                <ArrowUpRight size={18} aria-hidden="true" className="self-center text-muted group-hover:text-ink" />
              </Link>
            </li>
          ))}
        </ol>
        <p className={RAIL}>Tu cuenta y más</p>
        <ul className="mt-1">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <li key={href}><Link href={href} onClick={close} className={ROW}><Icon size={18} aria-hidden="true" className="text-volt-ink" />{label}</Link></li>
          ))}
        </ul>
        <p className={RAIL}>Preferencias y demo</p>
        <div className="mt-1 flex flex-col">
          <ThemeToggle withLabel className={ROW} />
          <SoundToggle withLabel className={ROW} />
          <ThemeTryButton withIcon className={ROW} />
          <WhatsAppLink className={ROW} />
        </div>
        <Link href="/preguntas/" onClick={close} className="mt-6 text-sm font-semibold text-muted underline underline-offset-4">Ayuda y preguntas frecuentes</Link>
      </div>
    </Sheet>
  );
}
