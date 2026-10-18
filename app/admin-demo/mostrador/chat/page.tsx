import type { Metadata } from "next";
import { ChatOrder } from "@/features/admin/counter/ChatOrder";

export const metadata: Metadata = { title: "Pedido por chat" };

export default function AdminChatOrderPage() {
  return <ChatOrder />;
}
