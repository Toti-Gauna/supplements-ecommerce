/**
 * Movimiento del escenario de apertura (solo transform, opacity y filter). La cámara se mueve con una transición;
 * cada gesto reinicia el "kick" con `key`; la cámara lenta suma bandas de cine y una viñeta. El regalo sale con halo,
 * rayos, fogonazo y destellos, una sola vez. Con "reducir movimiento" todo es un fundido corto.
 */
export const STAGE_CSS = `
.op-camera { transform-origin: 50% 50%; transition: transform 640ms cubic-bezier(.16,1,.3,1), transform-origin 640ms cubic-bezier(.16,1,.3,1); will-change: transform; }
.op-stage.is-slowmo .op-camera { transition-duration: 900ms; transition-timing-function: cubic-bezier(.45,0,.2,1); }
.op-stage.is-open .op-camera { transition-duration: 1200ms; }
.op-bars::before, .op-bars::after { content: ""; position: absolute; left: 0; right: 0; height: 9%; background: #000; transform: scaleY(0); transition: transform 420ms cubic-bezier(.16,1,.3,1); }
.op-bars::before { top: 0; transform-origin: top; } .op-bars::after { bottom: 0; transform-origin: bottom; }
.op-stage.is-slowmo .op-bars::before, .op-stage.is-slowmo .op-bars::after { transform: scaleY(1); }
.op-tint { opacity: 0; transition: opacity 500ms ease-out; background: radial-gradient(closest-side, transparent 55%, rgb(0 0 0 / .55)); }
.op-stage.is-slowmo .op-tint { opacity: 1; }
.op-kick { transform-box: fill-box; transform-origin: 50% 50%; animation: op-kick 420ms cubic-bezier(.2,.9,.3,1) both; }
.op-stage.is-slowmo .op-kick { animation-duration: 1260ms; }
@keyframes op-kick { 0% { transform: scale(1); } 22% { transform: scale(1.06, .94); } 55% { transform: scale(.98, 1.03); } 100% { transform: none; } }
.op-ring { transform-box: fill-box; transform-origin: 50% 50%; animation: op-ring 560ms cubic-bezier(.16,1,.3,1) both; }
.op-stage.is-slowmo .op-ring { animation-duration: 1500ms; }
@keyframes op-ring { 0% { opacity: .9; transform: scale(.2); } 100% { opacity: 0; transform: scale(1.6); } }
.op-ease { transition: transform 520ms cubic-bezier(.34,1.4,.64,1), opacity 420ms ease-out; transform-box: view-box; }
.op-fade { transition: opacity 600ms ease-out; }
.op-halo { transform-box: fill-box; transform-origin: 50% 50%; animation: op-halo 900ms cubic-bezier(.16,1,.3,1) 60ms both; }
@keyframes op-halo { 0% { opacity: 0; transform: scale(.2); } 40% { opacity: 1; } 100% { opacity: .9; transform: none; } }
.op-rays { transform-box: fill-box; transform-origin: 50% 50%; animation: op-rays 1300ms cubic-bezier(.16,1,.3,1) 100ms both; }
@keyframes op-rays { 0% { opacity: 0; transform: scale(.3) rotate(-12deg); } 100% { opacity: 1; transform: none; } }
.op-flash { transform-box: fill-box; transform-origin: 50% 50%; animation: op-flash 560ms ease-out 40ms both; }
@keyframes op-flash { 0% { opacity: 0; transform: scale(.3); } 25% { opacity: .95; } 100% { opacity: 0; transform: scale(4.4); } }
.op-tub { transform-box: fill-box; transform-origin: 50% 100%; animation: op-tub 900ms cubic-bezier(.34,1.45,.64,1) 160ms both; }
@keyframes op-tub { 0% { opacity: 0; transform: translateY(40px) scale(.45); } 30% { opacity: 1; } 100% { opacity: 1; transform: none; } }
.op-twinkle { transform-box: fill-box; transform-origin: 50% 50%; animation: op-twinkle 700ms cubic-bezier(.34,1.56,.64,1) both; }
@keyframes op-twinkle { 0% { opacity: 0; transform: scale(0) rotate(-90deg); } 60% { opacity: 1; transform: scale(1.4) rotate(10deg); } 100% { opacity: .95; transform: none; } }
.op-slam { transform-box: fill-box; transform-origin: 50% 100%; animation: op-slam 520ms cubic-bezier(.55,0,.6,1) both; }
@keyframes op-slam { 0% { transform: translateY(-150px) scale(.92, 1.06); } 55% { transform: translateY(0) scale(1.12, .82); } 75% { transform: scale(.97, 1.04); } 100% { transform: none; } }
.op-throw { transform-box: fill-box; transform-origin: 50% 50%; animation: op-throw 460ms cubic-bezier(.3,.6,.4,1) both; }
@keyframes op-throw { 0% { transform: translate(var(--fx), var(--fy)) scale(var(--fs, 2.2)); opacity: 1; } 85% { opacity: 1; } 100% { transform: none; opacity: 0; } }
.op-jab { transform-box: view-box; animation: op-jab 360ms cubic-bezier(.2,.9,.3,1) both; }
@keyframes op-jab { 0% { transform: none; } 35% { transform: translate(var(--jx), var(--jy)) scale(.55); } 100% { transform: none; } }
.op-stage.is-slowmo .op-slam, .op-stage.is-slowmo .op-throw, .op-stage.is-slowmo .op-jab { animation-duration: 1400ms; }
@keyframes op-in { from { opacity: 0; } to { opacity: 1; } }
.op-in { animation: op-in 420ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .op-camera, .op-ease { transition: none !important; }
  .op-kick, .op-slam, .op-jab { animation: none !important; }
  .op-throw { display: none; }
  .op-ring, .op-flash { display: none; }
  .op-halo, .op-rays, .op-tub, .op-twinkle, .op-in { animation: op-in 260ms ease-out both !important; }
  .op-bars::before, .op-bars::after, .op-tint { display: none; }
}
`;
