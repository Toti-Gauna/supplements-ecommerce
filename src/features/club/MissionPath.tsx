"use client";
import { motion } from "motion/react";
import { Gift } from "lucide-react";
import type { Mission } from "@/demo/types";

/** Cadenas de misiones: el excedente de una pasa a la siguiente (spec 5.6). */
export function MissionPath({ missions }: { missions: Mission[] }) {
  const targets = new Set(missions.map((m) => m.nextMissionId).filter(Boolean));
  const chains = missions.filter((m) => !targets.has(m.id) && m.nextMissionId).map((start) => {
    const chain = [start];
    let next = missions.find((m) => m.id === start.nextMissionId);
    while (next && !chain.includes(next)) { chain.push(next); next = missions.find((m) => m.id === next!.nextMissionId); }
    return chain;
  });
  if (chains.length === 0) return null;
  return (
    <div className="flex flex-col gap-6">
      {chains.map((chain) => (
        <ol key={chain[0]!.id} className="flex flex-col gap-0 sm:flex-row sm:items-center">
          {chain.map((m, i) => (
            <li key={m.id} className="flex flex-col items-stretch sm:flex-1 sm:flex-row sm:items-center">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-1">
                <span className="font-display grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brass text-night">{i + 1}</span>
                <span className="min-w-0"><span className="block font-bold">{m.title}</span><span className="flex items-center gap-1 text-xs text-[#cfc6b3]"><Gift size={12} aria-hidden="true" />{m.reward}</span></span>
              </motion.div>
              {i < chain.length - 1 && (
                <span aria-hidden="true" className="mx-auto h-6 w-px bg-gradient-to-b from-brass to-transparent sm:mx-0 sm:h-px sm:w-10 sm:bg-gradient-to-r" />
              )}
            </li>
          ))}
        </ol>
      ))}
      <p className="text-sm text-[#cfc6b3]">Lo que sobra al completar una misión pasa a la siguiente de la cadena.</p>
    </div>
  );
}
