import { demoData } from "./source";

export function isLocalPostalCode(postalCode: string): boolean {
  const local = demoData().zones.find((z) => z.type === "LOCAL_DELIVERY");
  return Boolean(local?.postalCodes?.includes(postalCode.trim()));
}

export function activeZones() {
  return demoData().zones.filter((z) => z.active !== false);
}
