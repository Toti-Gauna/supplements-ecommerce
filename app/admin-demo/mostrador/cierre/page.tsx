import type { Metadata } from "next";
import { DayClose } from "@/features/admin/counter/DayClose";

export const metadata: Metadata = { title: "Cierre del día" };

export default function AdminDayClosePage() {
  return <DayClose />;
}
