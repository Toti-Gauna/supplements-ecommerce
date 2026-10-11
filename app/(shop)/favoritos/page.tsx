import type { Metadata } from "next";
import { PageHeader } from "@/components/templates/PageHeader";
import { FavoritesView } from "@/features/favorites/FavoritesView";

export const metadata: Metadata = { title: "Favoritos", description: "Los productos que guardaste con el corazón, listos para volver a verlos." };

export default function FavoritesPage() {
  return (
    <>
      <PageHeader title="Favoritos">Lo que guardaste con el corazón. En la demo se guarda solo en este navegador.</PageHeader>
      <FavoritesView />
    </>
  );
}
