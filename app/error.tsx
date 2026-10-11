"use client";
import { Button } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <EmptyState title="Algo salió mal" action={<Button onClick={reset}>Reintentar</Button>}>
      No pudimos mostrar esta parte de la demo. Reintentá o usá “Reiniciar demo” en el pie de la página.
    </EmptyState>
  );
}
