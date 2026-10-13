"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Encastre: el módulo baja unos píxeles y "calza" con un golpe seco la primera vez que entra en pantalla. Solo mueve
 * (nunca esconde): con "reducir movimiento" `MotionRoot` desactiva el desplazamiento y queda quieto.
 */
export function SlotIn({ children, index = 0, className }: { children: ReactNode; index?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ y: -18 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ type: "spring", stiffness: 900, damping: 32, mass: 0.7, delay: index * 0.06 }}
    >
      {children}
    </motion.div>
  );
}
