import type { AdminClaim, AdminUser } from "../admin/types";
import { HOUSE_SHAKER } from "./house";
import { ORDER_PREFIX } from "./house";

/** Perfiles FICTICIOS. Nunca hay contraseñas ni datos de pago. */
export const adminUsers: AdminUser[] = [
  { id: "u-diego", name: "Diego Álvarez", email: "diego.a@ejemplo.com", createdAt: "2026-08-12", orderCodes: [`${ORDER_PREFIX}-000123`, `${ORDER_PREFIX}-000119`], totalSpent: 52300, missionProgress: { "m-dos-productos": 2, "m-primera": 1, "m-gasto": 52300 }, rewards: [{ title: `${HOUSE_SHAKER} de regalo`, expiresAt: "2026-11-29", used: false }], blocked: false },
  { id: "u-julian", name: "Julián Paz", email: "julian.p@ejemplo.com", createdAt: "2026-07-03", orderCodes: [`${ORDER_PREFIX}-000121`, `${ORDER_PREFIX}-000118`], totalSpent: 36900, missionProgress: { "m-dos-productos": 2, "m-primera": 1, "m-gasto": 36900 }, rewards: [{ title: "Envío gratis en la próxima compra", expiresAt: "2026-10-30", used: true }], blocked: false },
  { id: "u-sofia", name: "Sofía Ruiz", email: "sofia.r@ejemplo.com", createdAt: "2026-09-02", orderCodes: [`${ORDER_PREFIX}-000124`, `${ORDER_PREFIX}-000120`], totalSpent: 25000, missionProgress: { "m-dos-productos": 1, "m-primera": 1, "m-gasto": 25000 }, rewards: [], blocked: false },
  { id: "u-vale", name: "Valentina Sosa", email: "vale.s@ejemplo.com", createdAt: "2026-06-18", orderCodes: [`${ORDER_PREFIX}-000122`, `${ORDER_PREFIX}-000116`], totalSpent: 104000, missionProgress: { "m-dos-productos": 2, "m-primera": 1, "m-gasto": 104000 }, rewards: [{ title: "Creatina 300 g de regalo", expiresAt: "2026-12-01", used: false }], blocked: false },
  { id: "u-lucia", name: "Lucía Fernández", email: "lucia.f@ejemplo.com", createdAt: "2026-10-04", orderCodes: [`${ORDER_PREFIX}-000126`], totalSpent: 0, missionProgress: {}, rewards: [], blocked: false },
  { id: "u-spam", name: "Cuenta de prueba", email: "prueba123@ejemplo.com", createdAt: "2026-09-15", orderCodes: [], totalSpent: 0, missionProgress: {}, rewards: [], blocked: true },
];

export const adminClaims: AdminClaim[] = [
  { id: "c1", code: "ARR-0007", type: "WITHDRAWAL", status: "OPEN", orderCode: `${ORDER_PREFIX}-000119`, name: "Diego Álvarez", email: "diego.a@ejemplo.com", message: "Me arrepentí del pre-entreno, todavía no lo abrí.", createdAt: "2026-10-03T20:10:00-03:00" },
  { id: "c2", code: "REC-0003", type: "RETURN", status: "IN_PROGRESS", orderCode: `${ORDER_PREFIX}-000116`, name: "Valentina Sosa", email: "vale.s@ejemplo.com", message: "El pote de whey llegó con el precinto roto.", createdAt: "2026-09-28T09:00:00-03:00" },
  { id: "c3", code: "REC-0004", type: "COMPLAINT", status: "OPEN", name: "Martín Gómez", email: "martin.g@ejemplo.com", message: "No me llegó el email con el link de seguimiento.", createdAt: "2026-10-03T21:30:00-03:00" },
  { id: "c4", code: "ARR-0006", type: "WITHDRAWAL", status: "RESOLVED", orderCode: `${ORDER_PREFIX}-000112`, name: "Rocío Díaz", email: "rocio.d@ejemplo.com", message: "Quiero cancelar la compra.", resolution: "Producto cerrado y con precinto: se aceptó y se coordinó la devolución.", createdAt: "2026-09-18T11:00:00-03:00" },
];
