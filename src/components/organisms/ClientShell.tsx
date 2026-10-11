"use client";
import { useAudioUnlock } from "@/components/atoms/SoundToggle";
import { useRouteScroll } from "@/lib/useRouteScroll";
import { useRehydrateStores } from "@/stores/hydration";
import { Toaster } from "./Toaster";

export function ClientShell() {
  useRehydrateStores();
  useAudioUnlock();
  useRouteScroll();
  return (
    <>
      <Toaster />
    </>
  );
}
