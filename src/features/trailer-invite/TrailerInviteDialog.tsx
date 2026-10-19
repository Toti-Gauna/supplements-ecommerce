"use client";
import { Play } from "lucide-react";
import { Button, ButtonLink } from "@/components/atoms/Button";
import { Sheet } from "@/components/motion/Sheet";
import { EclipseMark } from "@/trailer/eclipse/EclipseMark";
import { primeTrailerAudio } from "@/trailer/engine/audio-prime";
import { TRAILER_INVITE_HREF } from "./trailer-invite";

interface Props { open: boolean; onAccept: () => void; onDecline: () => void }

/**
 * "Tenemos algo para ti…": banda de noche con el eclipse de Eclipse, el título y las dos salidas. El foco arranca en
 * "Ver trailer"; Escape, la X o tocar afuera es "No por ahora".
 */
export function TrailerInviteDialog({ open, onAccept, onDecline }: Props) {
  return (
    <Sheet open={open} onClose={onDecline} title="Invitación al trailer" labelledBy="trailer-invite-title" side="center" className="w-[min(94vw,30rem)] overflow-x-hidden">
      <div data-trailer-invite className="relative isolate flex h-44 items-center justify-center overflow-hidden bg-night sm:h-48">
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(50%_70%_at_50%_50%,rgb(245_185_66/0.18),transparent_70%)]" />
        <div aria-hidden="true" className="scale-[0.32]"><EclipseMark size={380} /></div>
      </div>
      <div className="flex flex-col gap-5 p-5 sm:p-7">
        <div>
          <p className="eyebrow text-volt-ink">Trailer · avance</p>
          <h2 id="trailer-invite-title" className="font-display mt-1.5 text-[clamp(1.9rem,8vw,2.5rem)] leading-[1.02]">Tenemos algo para ti…</h2>
          <p className="mt-2.5 text-muted">Estamos armando el trailer de tu tienda. Mirá cómo viene: la apertura, el cierre y los precios. Con el botón de abajo lo pausás y lo recorrés.</p>
        </div>
        <div className="flex flex-col gap-2.5 sm:flex-row-reverse">
          <ButtonLink href={TRAILER_INVITE_HREF} data-autofocus onClick={() => { primeTrailerAudio(); onAccept(); }} size="lg" className="w-full sm:flex-1">
            <Play size={18} aria-hidden="true" />Ver trailer
          </ButtonLink>
          <Button variant="secondary" size="lg" onClick={onDecline} className="w-full sm:w-auto">No por ahora</Button>
        </div>
      </div>
    </Sheet>
  );
}
