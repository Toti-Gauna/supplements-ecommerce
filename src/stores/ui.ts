"use client";
import { create } from "zustand";

/** Estado efímero de la interfaz (no se persiste). */
interface UiState {
  cartOpen: boolean;
  menuOpen: boolean;
  wheelOpen: boolean;
  /** "checkout": la ruleta aparece al ir a pagar y, al terminar, sigue al checkout. */
  wheelMode: "club" | "checkout";
  couponsOpen: boolean;
  searchOpen: boolean;
  lastAdded: string | null;
  openCart: (lastAdded?: string) => void;
  closeCart: () => void;
  setMenu: (open: boolean) => void;
  setWheel: (open: boolean, mode?: "club" | "checkout") => void;
  setCoupons: (open: boolean) => void;
  setSearch: (open: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  cartOpen: false,
  menuOpen: false,
  wheelOpen: false,
  wheelMode: "club",
  couponsOpen: false,
  searchOpen: false,
  lastAdded: null,
  openCart: (lastAdded) => set({ cartOpen: true, menuOpen: false, lastAdded: lastAdded ?? null }),
  closeCart: () => set({ cartOpen: false, lastAdded: null }),
  setMenu: (menuOpen) => set({ menuOpen }),
  setWheel: (wheelOpen, wheelMode = "club") => set({ wheelOpen, wheelMode, menuOpen: false, cartOpen: false }),
  setCoupons: (couponsOpen) => set({ couponsOpen }),
  setSearch: (searchOpen) => set({ searchOpen, menuOpen: false }),
}));
