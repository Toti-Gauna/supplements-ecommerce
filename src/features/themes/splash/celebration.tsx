"use client";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { Decor } from "@/components/illustrations/seasonal/Decor";
import { EASE, Firework, Layer, Letters, rand, useAt } from "./kit";

const GOLD = ["#f3dca6", "#ffe9a8", "#d2ad69"];

/** Año Nuevo: cuenta regresiva 3·2·1, después fuegos artificiales en cadena y lluvia de papelitos dorados. */
export function NewYearScene() {
  const at = useAt();
  const now = new Date();
  const year = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();
  return (
    <>
      <div className="absolute inset-0 grid place-items-center">
        {["3", "2", "1"].map((n, i) => (
          <motion.span key={n} className="font-display absolute text-[34vmin] leading-none text-[#f3dca6] [text-shadow:0_0_60px_rgb(243_220_166/0.6)]"
            initial={{ opacity: 0, scale: 1.6 }} animate={{ opacity: [0, 1, 1, 0], scale: [1.6, 1, 0.95, 0.6] }} transition={{ duration: 0.6, delay: at(0.05 + i * 0.52), times: [0, 0.2, 0.7, 1] }}>{n}</motion.span>
        ))}
      </div>
      <Firework x="20%" y="22%" delay={1.7} colors={GOLD} />
      <Firework x="78%" y="18%" delay={2} colors={["#ff7aa8", "#ffd1e0", "#f3dca6"]} />
      <Firework x="50%" y="12%" delay={2.35} colors={["#8fd3ff", "#e3f4ff", "#f3dca6"]} />
      <Firework x="30%" y="34%" delay={2.8} colors={GOLD} />
      <Firework x="70%" y="38%" delay={3.1} colors={["#c7b3ff", "#f3dca6"]} />
      <Layer>
        {Array.from({ length: 40 }, (_, i) => (
          <motion.span key={i} className="absolute h-[1.4vmin] w-[0.7vmin] rounded-[1px]" style={{ left: `${rand(i) * 100}%`, background: GOLD[i % 3] }}
            initial={{ top: "-5%", rotate: 0, opacity: 0 }} animate={{ top: "105%", rotate: rand(i + 4) * 720, opacity: [0, 1, 1] }}
            transition={{ duration: 2.4 + rand(i + 2) * 1.6, delay: at(1.8 + rand(i + 8) * 1.4), ease: "linear" }} />
        ))}
      </Layer>
      <Letters text={`¡Feliz ${year}!`} delay={2.1} className="font-display absolute bottom-[12%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[7vmin] text-[#f3dca6] [text-shadow:0_0_30px_rgb(243_220_166/0.5)]" />
    </>
  );
}

/** Black Friday: escenario negro, dos reflectores que barren, marco dorado que se dibuja y etiqueta que se balancea. */
export function BlackFridayScene() {
  const at = useAt();
  return (
    <>
      {[-1, 1].map((side) => (
        <motion.span key={side} className="absolute top-[-10%] h-[130%] w-[42vmin] origin-top" style={{ [side < 0 ? "left" : "right"]: "8%", background: "linear-gradient(180deg, rgb(255 236 190 / 0.32), transparent 75%)", clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)", filter: "blur(4px)" }}
          initial={{ rotate: side * 25, opacity: 0 }} animate={{ rotate: [side * 25, side * -12, side * 10], opacity: 1 }} transition={{ duration: 4, ease: "easeInOut" }} />
      ))}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-[9%] h-[82%] w-[82%]">
        <motion.rect x="1" y="1" width="98" height="98" rx="2" fill="none" stroke="#d2ad69" strokeWidth="0.35" vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: at(0.3), ease: EASE }} />
      </svg>
      <motion.span className="absolute right-[14%] top-0 block w-[16vmin] origin-top" initial={{ y: "-40vmin" }} animate={{ y: 0, rotate: [0, 14, -10, 6, -3, 0] }} transition={{ y: { duration: 0.8, delay: at(0.6), ease: EASE }, rotate: { duration: 3, delay: at(1.2) } }}>
        <span className="mx-auto block h-[14vmin] w-px bg-[#d2ad69]" />
        <Decor kind="price-tag" className="h-[16vmin] w-[16vmin] -rotate-45" />
      </motion.span>
      <Letters text="BLACK FRIDAY" delay={1.2} className="absolute bottom-[14%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[6vmin] font-extrabold tracking-[0.3em] text-[#f3dca6] [text-shadow:0_0_24px_rgb(210_173_105/0.7),0_2px_0_#9a7434]" />
      <Layer>
        {Array.from({ length: 22 }, (_, i) => (
          <motion.span key={i} className="absolute h-[0.6vmin] w-[0.6vmin] rotate-45 bg-[#f3dca6]" style={{ left: `${rand(i) * 100}%`, top: `${rand(i + 30) * 100}%` }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, delay: at(rand(i + 5) * 2) }} />
        ))}
      </Layer>
    </>
  );
}

/** Hot Sale: llamas que suben desde abajo, brasas y el descuento que se cuenta hasta su valor. */
export function HotSaleScene({ discount }: { discount: number }) {
  const at = useAt();
  const v = useMotionValue(0);
  const label = useTransform(v, (n) => `${Math.round(n)}% OFF`);
  useEffect(() => { const c = animate(v, discount, { duration: 1.8, delay: at(1.2), ease: "easeOut" }); return () => c.stop(); }, [v, discount, at]);
  return (
    <>
      <motion.div className="absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(70%_80%_at_50%_100%,rgb(255_120_40/0.55),transparent_70%)]" animate={{ opacity: [0.6, 1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
      <div className="absolute inset-x-0 bottom-[-4%] flex items-end justify-center gap-[1vmin]">
        {[0.7, 1, 1.4, 1.1, 1.6, 1.2, 0.9, 1.3, 0.75].map((s, i) => (
          <motion.span key={i} className="block origin-bottom" style={{ width: `calc(${s} * min(12vmin, 10.5vh))`, height: `calc(${s} * min(16vmin, 14vh))` }}
            initial={{ scaleY: 0 }} animate={{ scaleY: [0, 1.1, 0.92, 1.05, 0.95] }} transition={{ duration: 2.6, delay: at(0.2 + i * 0.08), ease: "easeOut" }}>
            <Decor kind="flame" className="h-full w-full" />
          </motion.span>
        ))}
      </div>
      <motion.span className="font-display absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[9vmin] leading-none text-[#ffd34d] [text-shadow:0_0_30px_rgb(255_120_40/0.8)]" style={{ top: "calc(50% + var(--brand-h) / 2 + 4vh)" }}
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: [0.6, 1.1, 1] }} transition={{ duration: 0.8, delay: at(1.1) }}>{label}</motion.span>
    </>
  );
}
