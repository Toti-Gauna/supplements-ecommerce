"use client";
import { useRouter } from "next/navigation";
import { ArrowRight, Boxes, ClipboardList, CornerDownLeft, Disc3, FileSpreadsheet, GalleryHorizontal, Inbox, Landmark, MessageCircleQuestion, Plus, Store, Truck, UserRound } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet } from "@/components/motion/Sheet";
import { customerRows } from "@/demo/admin/customers";
import { matchesQuery } from "@/demo/admin/table";
import { STATUS_LABEL } from "@/demo/engine/orders";
import { cn } from "@/lib/cn";
import { useAdmin } from "@/stores/admin";
import { profileHref } from "./customers/Reminders";
import { ADMIN_NAV } from "./nav";

interface Item { id: string; group: string; label: string; hint?: string; icon: ReactNode; href: string; search: string }

const icon = (I: typeof Boxes) => <I size={17} aria-hidden="true" />;

/** Buscador global del panel (⌘K / Ctrl+K): secciones, acciones, pedidos, productos y clientes. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const orders = useAdmin((s) => s.orders);
  const users = useAdmin((s) => s.users);
  const products = useAdmin((s) => s.data.products);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const all: Item[] = [
    ...ADMIN_NAV.map((n) => ({ id: n.href, group: "Ir a", label: n.label, icon: <n.icon size={17} aria-hidden="true" />, href: n.href, search: `${n.label} ${n.group}` })),
    { id: "new-product", group: "Acciones", label: "Nuevo producto", icon: icon(Plus), href: "/admin-demo/productos/editar/?nuevo=1", search: "crear producto nuevo alta" },
    { id: "import", group: "Acciones", label: "Importar categorías y stock desde Excel", icon: icon(FileSpreadsheet), href: "/admin-demo/importar/", search: "importar excel csv planilla subir" },
    { id: "sheet", group: "Acciones", label: "Productos y stock en formato Excel", icon: icon(FileSpreadsheet), href: "/admin-demo/productos/?formato=excel", search: "planilla excel grilla stock editar precios" },
    { id: "wheel", group: "Acciones", label: "Configuración de la ruleta", icon: icon(Disc3), href: "/admin-demo/cupones/ruleta/", search: "ruleta premios pesos gajos cupones" },
    { id: "outbox", group: "Acciones", label: "Bandeja de salida de emails", icon: icon(Inbox), href: "/admin-demo/emails/enviados/", search: "emails enviados bandeja salida" },
    { id: "slides", group: "Acciones", label: "Carrusel del inicio", icon: icon(GalleryHorizontal), href: "/admin-demo/contenido/carrusel/", search: "carrusel diapositivas portada inicio banner imagen" },
    { id: "faqs", group: "Acciones", label: "Preguntas frecuentes", icon: icon(MessageCircleQuestion), href: "/admin-demo/contenido/preguntas/", search: "preguntas frecuentes ayuda faq" },
    { id: "collection", group: "Acciones", label: "Datos de cobro de muestra", icon: icon(Landmark), href: "/admin-demo/ajustes/cobro/", search: "alias cbu cvu titular qr transferencia cobro ajustes" },
    { id: "shipping", group: "Acciones", label: "Envíos y retiro", icon: icon(Truck), href: "/admin-demo/ajustes/envios/", search: "envio gratis zonas cadete retiro codigos postales ajustes" },
    { id: "shop", group: "Acciones", label: "Ver la tienda", icon: icon(Store), href: "/", search: "tienda sitio web" },
    ...orders.map((o) => ({ id: o.code, group: "Pedidos", label: `${o.code} · ${o.customer.name}`, hint: STATUS_LABEL[o.status], icon: icon(ClipboardList), href: `/admin-demo/pedidos/detalle/?codigo=${o.code}`, search: `${o.code} ${o.customer.name} ${o.customer.email}` })),
    ...products.map((p) => ({ id: p.slug, group: "Productos", label: p.name, hint: p.active === false ? "Pausado" : undefined, icon: icon(Boxes), href: `/admin-demo/productos/editar/?id=${p.slug}`, search: `${p.name} ${p.tags.join(" ")}` })),
    ...customerRows(users, orders).map((c) => ({ id: c.key, group: "Clientes", label: c.name, hint: c.email, icon: icon(UserRound), href: profileHref(c.email), search: `${c.name} ${c.email}` })),
  ];
  const results = (q.trim() ? all.filter((i) => matchesQuery(q, i.search, i.label)) : all.filter((i) => i.group !== "Productos" && i.group !== "Clientes" && i.group !== "Pedidos")).slice(0, 12);
  const current = Math.min(active, Math.max(0, results.length - 1));
  const go = (item?: Item) => {
    if (!item) return;
    onClose();
    setQ("");
    router.push(item.href);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((current + 1) % Math.max(1, results.length)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActive((current - 1 + results.length) % Math.max(1, results.length)); }
    if (e.key === "Enter") { e.preventDefault(); go(results[current]); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Buscar en el panel" side="top" className="bg-surface">
      <div className="flex flex-col">
        <div className="border-b border-line p-4 pr-16">
          <label htmlFor="admin-cmd" className="sr-only">Buscar pedidos, productos, clientes o secciones</label>
          <input id="admin-cmd" data-autofocus value={q} onChange={(e) => { setQ(e.target.value); setActive(0); }} onKeyDown={onKey} role="combobox"
            aria-expanded="true" aria-controls="admin-cmd-list" aria-activedescendant={results[current] ? `cmd-${results[current]!.id}` : undefined}
            placeholder="Buscar pedidos, productos, clientes o ir a…" className="h-12 w-full bg-transparent text-lg font-semibold placeholder:text-muted/60 focus:outline-none" />
        </div>
        <ul id="admin-cmd-list" role="listbox" aria-label="Resultados" className="max-h-[60dvh] overflow-y-auto p-2">
          {results.length === 0 && <li className="p-6 text-center text-sm text-muted">Sin resultados para “{q}”.</li>}
          {results.map((item, i) => (
            <li key={`${item.group}-${item.id}`} id={`cmd-${item.id}`} role="option" aria-selected={i === current}>
              {(i === 0 || results[i - 1]!.group !== item.group) && <p className="px-3 pb-1 pt-3 text-[11px] font-extrabold uppercase tracking-[0.16em] text-muted">{item.group}</p>}
              <button type="button" tabIndex={-1} onClick={() => go(item)} onMouseEnter={() => setActive(i)}
                className={cn("flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left text-[15px] font-semibold", i === current ? "bg-accent text-ink" : "text-ink/85")}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-bg text-primary">{item.icon}</span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.hint && <span className="hidden shrink-0 text-xs text-muted sm:inline">{item.hint}</span>}
                {i === current ? <CornerDownLeft size={15} aria-hidden="true" className="text-muted" /> : <ArrowRight size={15} aria-hidden="true" className="text-muted/50" />}
              </button>
            </li>
          ))}
        </ul>
        <p className="border-t border-line px-5 py-3 text-xs text-muted">↑ ↓ para moverte · Enter para abrir · Esc para cerrar</p>
      </div>
    </Sheet>
  );
}
