"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSplashSettled } from "../shell/useSplashSettled";
import { inviteSeen, rememberInvite, shouldInviteToQuiz, type QuizInviteChoice } from "./quiz-invite";

// El modal (con sus dibujos) se descarga solo si hay que mostrarlo: quien ya lo vio no lo paga en cada carga.
// Si el archivo no llega (red cortada), no aparece y la tienda sigue igual.
const none = () => function Unavailable() { return null; };
const QuizInviteDialog = dynamic(() => import("./QuizInviteDialog").then((m) => m.QuizInviteDialog, none), { ssr: false });

/**
 * Invitación al quiz en la tienda (va en el layout): la primera vez que alguien entra a una página de la tienda, apenas
 * se retira la pantalla de carga, le ofrece hacer el quiz. Elija lo que elija (o cierre con Escape), no vuelve a salir.
 */
export function QuizInvite() {
  const path = usePathname();
  const splashGone = useSplashSettled();
  const [state, setState] = useState<"waiting" | "open" | "closed">("waiting");
  // Se decide recién en el cliente y con la tienda a la vista (en el HTML estático `splashGone` es false).
  if (state === "waiting" && splashGone && shouldInviteToQuiz({ path, seen: inviteSeen() })) setState("open");
  const close = (choice: QuizInviteChoice) => {
    rememberInvite(choice);
    setState("closed");
  };
  if (state === "waiting") return null;
  return <QuizInviteDialog open={state === "open"} onAccept={() => close("quiz")} onDecline={() => close("no")} />;
}
