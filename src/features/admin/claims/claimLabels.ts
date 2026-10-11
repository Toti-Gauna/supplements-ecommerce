import type { ClaimStatus, ClaimType } from "@/demo/admin/types";

export const CLAIM_TYPE: Record<ClaimType, string> = { WITHDRAWAL: "Arrepentimiento", RETURN: "Devolución", COMPLAINT: "Reclamo" };
export const CLAIM_STATUS: Record<ClaimStatus, { label: string; tone: "warning" | "brand" | "success" | "neutral" }> = {
  OPEN: { label: "Abierto", tone: "warning" }, IN_PROGRESS: { label: "En curso", tone: "brand" }, RESOLVED: { label: "Resuelto", tone: "success" }, REJECTED: { label: "Rechazado", tone: "neutral" },
};
export const claimHref = (id: string) => `/admin-demo/reclamos/detalle/?id=${encodeURIComponent(id)}`;
export const isOpenClaim = (s: ClaimStatus) => s === "OPEN" || s === "IN_PROGRESS";
