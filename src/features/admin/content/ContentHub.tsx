"use client";
import { MessageCircleQuestion, Star, Type } from "lucide-react";
import { useAdmin } from "@/stores/admin";
import { HubCard, HubGrid } from "../marketing/HubCard";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";

export const CONTENT_SECTION = { href: "/admin-demo/contenido/", label: "Contenido" };

/** Contenido (8.3.28): una tarjeta por parte; cada una abre su propia página y solo edita lo suyo. */
export function ContentHub() {
  const { hero, homeCta, faqs } = useAdmin((s) => s.data.content);
  const visible = hero.filter((h) => h.active !== false).length;
  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Contenido"
        intro="Lo que se lee en el inicio y en la ayuda de la tienda. Cada parte se edita por separado y, al guardar, se ve en la tienda de este navegador sin deploy." />
      <HubGrid label="Partes del contenido">
        <HubCard href="/admin-demo/contenido/carrusel/" icon={Star} title="Carrusel del inicio" description="Imágenes propias o envases en el rack, destacados y titulares." meta={`${hero.length} ${hero.length === 1 ? "destacado" : "destacados"} · ${visible} ${visible === 1 ? "visible" : "visibles"}`} action="Editar el carrusel" />
        <HubCard href="/admin-demo/contenido/textos/" icon={Type} title="Textos de inicio" description="El bloque “Armá tu stack” del inicio: título y texto." meta={`“${homeCta.title}”`} action="Editar los textos" />
        <HubCard href="/admin-demo/contenido/preguntas/" icon={MessageCircleQuestion} title="Preguntas frecuentes" description="Las preguntas y respuestas de la página de ayuda." meta={`${faqs.length} ${faqs.length === 1 ? "pregunta" : "preguntas"}`} action="Editar las preguntas" />
      </HubGrid>
    </>
  );
}
