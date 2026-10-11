"use client";
import { GalleryHorizontal, MessageCircleQuestion, Type } from "lucide-react";
import { useAdmin } from "@/stores/admin";
import { HubCard, HubGrid } from "../marketing/HubCard";
import { MARKETING, SubpageHeader } from "../marketing/SubpageHeader";

export const CONTENT_SECTION = { href: "/admin-demo/contenido/", label: "Contenido" };

/** Contenido (8.3.28): una tarjeta por parte; cada una abre su propia página y solo edita lo suyo. */
export function ContentHub() {
  const { slides, homeCta, faqs } = useAdmin((s) => s.data.content);
  const visible = slides.filter((s) => s.active !== false).length;
  return (
    <>
      <SubpageHeader trail={[MARKETING]} back={MARKETING} title="Contenido"
        intro="Lo que se lee en el inicio y en la ayuda de la tienda. Cada parte se edita por separado y, al guardar, se ve en la tienda de este navegador sin deploy." />
      <HubGrid label="Partes del contenido">
        <HubCard href="/admin-demo/contenido/carrusel/" icon={GalleryHorizontal} title="Carrusel" description="Las diapositivas grandes del inicio: imagen, título, bajada y botón." meta={`${slides.length} ${slides.length === 1 ? "diapositiva" : "diapositivas"} · ${visible} ${visible === 1 ? "visible" : "visibles"}`} action="Editar el carrusel" />
        <HubCard href="/admin-demo/contenido/textos/" icon={Type} title="Textos de inicio" description="El bloque para crear un producto propio: título y texto." meta={`“${homeCta.title}”`} action="Editar los textos" />
        <HubCard href="/admin-demo/contenido/preguntas/" icon={MessageCircleQuestion} title="Preguntas frecuentes" description="Las preguntas y respuestas de la página de ayuda." meta={`${faqs.length} ${faqs.length === 1 ? "pregunta" : "preguntas"}`} action="Editar las preguntas" />
      </HubGrid>
    </>
  );
}
