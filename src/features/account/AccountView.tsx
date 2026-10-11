"use client";
import { ListSkeleton } from "@/components/atoms/Skeleton";
import { useAccount } from "@/stores/account";
import { useHydrated } from "@/stores/hydration";
import { AccountDashboard } from "./AccountDashboard";
import { AuthPanel } from "./AuthPanel";

/** Mi cuenta: ingreso o registro de demostración y, con la sesión abierta, el panel por tarjetas. */
export function AccountView() {
  const hydrated = useHydrated();
  const user = useAccount((s) => s.user);
  if (!hydrated) return <ListSkeleton rows={4} label="Cargando tu cuenta" />;
  return user ? <AccountDashboard user={user} /> : <AuthPanel />;
}
