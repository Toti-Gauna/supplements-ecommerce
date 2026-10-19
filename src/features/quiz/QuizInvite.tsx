"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useSplashSettled } from "../shell/useSplashSettled";
import { invitePhase, setInvitePhase, subscribeInvites } from "../trailer-invite/invite-flow";
import { trailerInviteOff } from "../trailer-invite/trailer-invite";
import { inviteSeen, rememberInvite, shouldInviteToQuiz, type QuizInviteChoice } from "./quiz-invite";

// El modal (con sus dibujos) se descarga solo si hay que mostrarlo: quien ya lo vio no lo paga en cada carga.
// Si el archivo no llega (red cortada), no aparece y la tienda sigue igual.
const none = () => function Unavailable() { return null; };
const QuizInviteDialog = dynamic(() => import("./QuizInviteDialog").then((m) => m.QuizInviteDialog, none), { ssr: false });

const serverPhase = () => "done" as const;

/**
 * Invitación al quiz en la tienda (va en el layout): sale después del aviso del trailer, apenas dice "No por ahora" o cuando vuelve de
 * ver el trailer (ver `invite-flow.ts`). Una vez por carga de la página: elija lo que elija (o cierre con Escape), no vuelve hasta recargar.
 */
export function QuizInvite() {
  const path = usePathname();
  const splashGone = useSplashSettled();
  const phase = useSyncExternalStore(subscribeInvites, invitePhase, serverPhase);
  // La fase con la que se montó: si fue "watching", esta tienda es la vuelta del trailer (aunque el reproductor no haya llegado a marcarla).
  const [entered] = useState(invitePhase);
  const [state, setState] = useState<"waiting" | "open" | "closed">("waiting");
  // Se decide recién en el cliente y con la tienda a la vista (en el HTML estático `splashGone` es false). Nunca dos modales juntos:
  // espera a que el aviso del trailer se responda (o a que vuelva de verlo); si ese aviso está apagado, sale directo.
  const turn = phase === "quiz" || (phase === "watching" && entered === "watching") || (phase === "trailer" && trailerInviteOff());
  if (state === "waiting" && splashGone && turn && shouldInviteToQuiz({ path, seen: inviteSeen() })) setState("open");
  const close = (choice: QuizInviteChoice) => {
    rememberInvite(choice);
    setInvitePhase("done");
    setState("closed");
  };
  if (state === "waiting") return null;
  return <QuizInviteDialog open={state === "open"} onAccept={() => close("quiz")} onDecline={() => close("no")} />;
}
