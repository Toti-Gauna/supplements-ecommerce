/**
 * Movimiento de la bolsa (solo transform y opacity). Cada golpe alterna la clase del balanceo (r/l), así la
 * animación vuelve a empezar. Con "reducir movimiento" no hay recorridos: los cambios son fundidos cortos.
 */
export const BAG_CSS = `
.bk-bag, .bk-hint { transform-box: view-box; transform-origin: 150px 0px; }
.bk-hint { animation: bk-hint 2.8s ease-in-out 1.2s 3; }
@keyframes bk-hint { 0%, 64%, 100% { transform: rotate(0); } 72% { transform: rotate(-2.4deg); } 82% { transform: rotate(2deg); } 91% { transform: rotate(-1deg); } }
.bk-swing-r, .bk-swing-l { animation: bk-swing-r 1100ms cubic-bezier(.25,.8,.35,1) both; }
.bk-swing-l { animation-name: bk-swing-l; }
@keyframes bk-swing-r { 0% { transform: rotate(0); } 14% { transform: rotate(6.5deg); } 40% { transform: rotate(-4deg); } 64% { transform: rotate(2deg); } 84% { transform: rotate(-.8deg); } 100% { transform: rotate(0); } }
@keyframes bk-swing-l { 0% { transform: rotate(0); } 14% { transform: rotate(-6.5deg); } 40% { transform: rotate(4deg); } 64% { transform: rotate(-2deg); } 84% { transform: rotate(.8deg); } 100% { transform: rotate(0); } }
.bk-shadow { transform-box: fill-box; transform-origin: 50% 50%; }
.bk-shadow.bk-swing-r { animation-name: bk-shadow-r; }
.bk-shadow.bk-swing-l { animation-name: bk-shadow-l; }
@keyframes bk-shadow-r { 14% { transform: translateX(26px) scaleX(.86); } 40% { transform: translateX(-16px) scaleX(.92); } 64% { transform: translateX(8px); } 100% { transform: none; } }
@keyframes bk-shadow-l { 14% { transform: translateX(-26px) scaleX(.86); } 40% { transform: translateX(16px) scaleX(.92); } 64% { transform: translateX(-8px); } 100% { transform: none; } }
.bk-glow { transform-box: fill-box; transform-origin: 50% 50%; transition: transform 600ms cubic-bezier(.16,1,.3,1), opacity 600ms; }
.bk-dent { transform-box: fill-box; transform-origin: 50% 50%; animation: bk-dent 520ms cubic-bezier(.16,1,.3,1) both; }
@keyframes bk-dent { 0% { opacity: 0; transform: scale(.5); } 18% { opacity: 1; transform: scale(1.05); } 100% { opacity: 0; transform: scale(1.15); } }
.bk-seam, .bk-seam-in { transform-box: view-box; }
.bk-seam { transition: transform 380ms cubic-bezier(.34,1.56,.64,1); }
.bk-seam-in { animation: bk-seam-in 420ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes bk-seam-in { from { opacity: .4; transform: scaleX(0); } to { opacity: 1; transform: none; } }
.bk-arc { animation: bk-arc 420ms steps(3, end) both; }
@keyframes bk-arc { 0% { opacity: 1; } 60% { opacity: .35; } 100% { opacity: 0; } }
.bk-panel { transform-box: view-box; transform-origin: 150px 226px; animation: bk-panel 720ms cubic-bezier(.45,0,.7,.6) both; }
@keyframes bk-panel { 0% { opacity: 1; transform: none; } 20% { opacity: 1; transform: translateY(-4px) scale(1.05) rotate(-2deg); } 100% { opacity: 0; transform: translate(14px, 96px) rotate(18deg) scale(.82); } }
.bk-cavity { animation: bk-fade 380ms ease-out both; }
.bk-halo { transform-box: fill-box; transform-origin: 50% 50%; animation: bk-halo 900ms cubic-bezier(.16,1,.3,1) 60ms both; }
@keyframes bk-halo { 0% { opacity: 0; transform: scale(.2); } 40% { opacity: 1; } 100% { opacity: .85; transform: none; } }
.bk-rays { transform-box: view-box; transform-origin: 150px 160px; animation: bk-rays 1300ms cubic-bezier(.16,1,.3,1) 100ms both; }
@keyframes bk-rays { 0% { opacity: 0; transform: scale(.3) rotate(-12deg); } 100% { opacity: 1; transform: none; } }
.bk-flash { transform-box: fill-box; transform-origin: 50% 50%; animation: bk-flash 520ms ease-out 60ms both; }
@keyframes bk-flash { 0% { opacity: 0; transform: scale(.3); } 25% { opacity: .95; } 100% { opacity: 0; transform: scale(4.2); } }
.bk-tub { transform-box: view-box; transform-origin: 150px 214px; animation: bk-tub 900ms cubic-bezier(.34,1.45,.64,1) 160ms both; }
@keyframes bk-tub { 0% { opacity: 0; transform: translateY(26px) scale(.45); } 30% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.bk-twinkle { transform-box: fill-box; transform-origin: 50% 50%; animation: bk-twinkle 700ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes bk-twinkle { 0% { opacity: 0; transform: scale(0) rotate(-90deg); } 60% { opacity: 1; transform: scale(1.4) rotate(10deg); } 100% { opacity: .95; transform: none; } }
@keyframes bk-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bk-fade-out { from { opacity: 1; } to { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .bk-hint, .bk-bag, .bk-shadow, .bk-halo, .bk-rays, .bk-tub, .bk-twinkle { animation: none !important; }
  .bk-glow, .bk-seam { transition: opacity 250ms; }
  .bk-seam-in, .bk-reveal { animation: bk-fade 260ms ease-out both; }
  .bk-panel { animation: bk-fade-out 260ms ease-out both; }
  .bk-flash, .bk-arc, .bk-dent { display: none; }
}
`;
