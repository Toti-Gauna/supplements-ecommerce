"use client";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { DEMO_CLUB_USER } from "@/demo/fixtures/club";
import { useAccount } from "@/stores/account";

/** "Crear la cuenta demo": el login simulado de la demo (sin contraseña ni datos reales), desde el Club. */
export function DemoAccountButton({ variant = "light", size = "md", className }: { variant?: "light" | "primary" | "dark"; size?: "sm" | "md" | "lg"; className?: string }) {
  const login = useAccount((s) => s.login);
  return (
    <Button variant={variant} size={size} className={className} onClick={() => login(DEMO_CLUB_USER)}>
      <UserPlus size={17} aria-hidden="true" />Crear la cuenta demo
    </Button>
  );
}
