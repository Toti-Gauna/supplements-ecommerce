"use client";
import { useRouter } from "next/navigation";
import { resetDemo } from "@/stores/hydration";
import { useToasts } from "@/stores/toast";

export function ResetDemoButton({ className }: { className?: string }) {
  const router = useRouter();
  const push = useToasts((s) => s.push);
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (!window.confirm("¿Reiniciar la demo? Se vacía el carrito, la cuenta demo y el pedido de demostración de este navegador.")) return;
        resetDemo();
        push({ tone: "info", title: "Demo reiniciada", description: "Todo vuelve al estado inicial." });
        router.push("/");
      }}
    >
      Reiniciar demo
    </button>
  );
}
