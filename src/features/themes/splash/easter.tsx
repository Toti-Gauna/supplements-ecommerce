"use client";
import { motion } from "motion/react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { Burst, EASE, useAt } from "./kit";

/** Pascuas: un huevo gigante tiembla, se rompe en dos y salen orejitas de conejo entre chispas pastel. */
export function EasterScene() {
  const at = useAt();
  return (
    <>
      <div className="absolute bottom-[7%] left-1/2 h-[26vmin] w-[22vmin] -translate-x-1/2">
        <motion.span className="absolute inset-x-[10%] bottom-[30%] h-[60%]" initial={{ y: "60%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: at(2.5), ease: EASE }}>
          <Decor kind="bunny-ears" className="h-full w-full" />
        </motion.span>
        {[0, 1].map((half) => (
          <motion.span key={half} className="absolute inset-0 overflow-hidden" style={{ clipPath: half ? "polygon(0 0,100% 0,100% 48%,80% 56%,60% 46%,40% 56%,20% 46%,0 54%)" : "polygon(0 54%,20% 46%,40% 56%,60% 46%,80% 56%,100% 48%,100% 100%,0 100%)" }}
            animate={{ rotate: [0, -6, 6, -8, 8, 0, half ? -28 : 0], y: [0, 0, 0, 0, 0, 0, half ? "-40%" : "8%"], x: [0, 0, 0, 0, 0, 0, half ? "-30%" : 0], opacity: [1, 1, 1, 1, 1, 1, half ? 0 : 1] }}
            transition={{ duration: 2.8, times: [0, 0.2, 0.35, 0.5, 0.65, 0.78, 1], ease: "easeInOut" }}>
            <Decor kind="easter-egg" className="h-full w-full" />
          </motion.span>
        ))}
      </div>
      <Burst x="50%" y="80%" delay={2.4} colors={["#f7b6c8", "#ffe28a", "#b9e3f5", "#cdb3f5"]} count={24} radius={30} size={1.1} />
      {[["10%", "60%", 0.4], ["82%", "56%", 0.7], ["22%", "26%", 1], ["74%", "20%", 1.2]].map(([left, top, d], i) => (
        <motion.span key={i} className="absolute h-[10vmin] w-[8vmin]" style={{ left: left as string, top: top as string }} initial={{ scale: 0 }}
          animate={{ scale: 1, y: [0, -14, 0] }} transition={{ scale: { duration: 0.6, delay: at(d as number) }, y: { duration: 1.6, repeat: Infinity, delay: at(d as number) } }}>
          <Decor kind="easter-egg" className="h-full w-full" />
        </motion.span>
      ))}
    </>
  );
}
