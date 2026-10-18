"use client";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSplashSettled } from "../shell/useSplashSettled";
import { rememberTrailerInvite, shouldInviteToTrailer, trailerInviteSeen } from "./trailer-invite";

const none = () => function Unavailable() { return null; };
const TrailerInviteDialog = dynamic(() => import("./TrailerInviteDialog").then((m) => m.TrailerInviteDialog, none), { ssr: false });

/**
 * Invitación al trailer en la tienda (va en el layout, antes que la del quiz): apenas se retira la pantalla de carga
 * ofrece ver el avance del trailer. Elija lo que elija, no vuelve a salir en esta sesión.
 */
export function TrailerInvite() {
  const path = usePathname();
  const splashGone = useSplashSettled();
  const [state, setState] = useState<"waiting" | "open" | "closed">("waiting");
  if (state === "waiting" && splashGone && shouldInviteToTrailer({ path, seen: trailerInviteSeen() })) setState("open");
  const close = (choice: "ver" | "no") => {
    rememberTrailerInvite(choice);
    setState("closed");
  };
  if (state === "waiting") return null;
  return <TrailerInviteDialog open={state === "open"} onAccept={() => close("ver")} onDecline={() => close("no")} />;
}
