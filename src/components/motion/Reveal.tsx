"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "section" | "li";
}

/** Aparece al entrar en pantalla (una vez). Usar debajo del primer pliegue: arriba del todo va CSS. */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: RevealProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </Tag>
  );
}
