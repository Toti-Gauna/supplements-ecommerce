import type { Metadata } from "next";
import { DeliveryCalendar } from "@/features/admin/calendar/DeliveryCalendar";

export const metadata: Metadata = { title: "Calendario de entregas" };

export default function AdminCalendarPage() {
  return <DeliveryCalendar />;
}
