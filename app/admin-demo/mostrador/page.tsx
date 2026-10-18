import type { Metadata } from "next";
import { CounterSell } from "@/features/admin/counter/CounterSell";

export const metadata: Metadata = { title: "Mostrador" };

export default function AdminCounterPage() {
  return <CounterSell />;
}
