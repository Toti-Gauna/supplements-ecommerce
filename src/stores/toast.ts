"use client";
import { create } from "zustand";
import { playSound } from "@/lib/sound";

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "info" | "error";
  /** Un link (`href`) o un botón (`onClick`, por ejemplo "Empezar una comparación de Creatinas"). */
  action?: { label: string; href: string } | { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: number) => void;
}

let seq = 0;
export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    if (toast.tone === "error") playSound("error");
    const id = ++seq;
    // El mismo aviso no se apila: si ya está a la vista, se reemplaza (con su tiempo de nuevo).
    const same = (t: Toast) => t.title === toast.title && t.description === toast.description;
    set((s) => ({ toasts: [...s.toasts.filter((t) => !same(t)).slice(-2), { ...toast, id }] }));
    // Con una acción, un poco más de tiempo para llegar a tocarla.
    setTimeout(() => get().dismiss(id), toast.action ? 8000 : 5000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
