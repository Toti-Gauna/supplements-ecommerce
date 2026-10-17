"use client";
import { useReducedMotion } from "motion/react";
import { ViewTransition, type ReactNode } from "react";

/** Sin movimiento reducido, captura la página; con él, no inicia una transición nativa que un toque pueda abortar. */
export function PageTransition({ children }: { children: ReactNode }) {
  const enabled = useReducedMotion() === false;
  return enabled ? <ViewTransition enter="page-in" exit="page-out" default="none">{children}</ViewTransition> : children;
}
