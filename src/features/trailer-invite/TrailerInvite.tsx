"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { useSplashSettled } from "../shell/useSplashSettled";
import { invitePhase, setInvitePhase, subscribeInvites } from "./invite-flow";
import { shouldInviteToTrailer, trailerInviteOff } from "./trailer-invite";

const none = () => function Unavailable() { return null; };
const TrailerInviteDialog = dynamic(() => import("./TrailerInviteDialog").then((m) => m.TrailerInviteDialog, none), { ssr: false });
const serverPhase = () => "done" as const;

/**
 * Invitación al trailer en la tienda (va en el layout, antes que la del quiz): en cada carga de la página, apenas se retira la pantalla
 * de carga, ofrece ver el trailer. "No por ahora" pasa enseguida a la invitación al quiz; "Ver trailer" la deja para cuando vuelva.
 */
export function TrailerInvite() {
  const path = usePathname();
  const splashGone = useSplashSettled();
  const phase = useSyncExternalStore(subscribeInvites, invitePhase, serverPhase);
  const [state, setState] = useState<"waiting" | "open" | "closed">("waiting");
  if (state === "waiting" && phase === "trailer" && splashGone && shouldInviteToTrailer({ path, seen: trailerInviteOff() })) setState("open");
  const close = (next: "watching" | "quiz") => {
    setInvitePhase(next);
    setState("closed");
  };
  if (state === "waiting") return null;
  return <TrailerInviteDialog open={state === "open"} onAccept={() => close("watching")} onDecline={() => close("quiz")} />;
}
