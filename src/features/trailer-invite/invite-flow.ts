/**
 * Orden de los avisos de la tienda en cada carga de página (pedido de Ignacio, 19/10/2026): primero "Ver trailer"; si dice que no, o
 * cuando vuelve de ver el trailer, la invitación al quiz. Vive en memoria: recargar la página vuelve a empezar (no queda guardado).
 */
export type InvitePhase = "trailer" | "watching" | "quiz" | "done";

let phase: InvitePhase = "trailer";
const listeners = new Set<() => void>();

export const invitePhase = (): InvitePhase => phase;
export function setInvitePhase(next: InvitePhase): void {
  phase = next;
  listeners.forEach((l) => l());
}
export function subscribeInvites(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
