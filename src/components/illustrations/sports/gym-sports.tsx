import type { Pt } from "../figure";
import { Figure } from "../figure";
import { Faint, Shadow } from "./stage";

/** Guante de boxeo: puño redondo con el pulgar marcado y el puño (muñeca) hacia el codo. */
function Glove({ at, r = 9 }: { at: Pt; r?: number }) {
  const [x, y] = at;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="currentColor" stroke="none" />
      <path d={`M${x - r * 0.9} ${y + r * 0.5}h${-r * 0.6}`} strokeWidth={r * 1.3} />
      <path d={`M${x - r * 0.2} ${y + r * 0.25}q${r * 0.6} ${r * 0.2} ${r * 0.7} ${-r * 0.4}`} strokeWidth="1.3" strokeOpacity=".35" />
    </g>
  );
}

/** Boxeo: jab que impacta la bolsa (que se balancea), guardia alta y las cuerdas del ring con su esquinero. */
export function Boxeo() {
  return (
    <>
      <Faint o={0.2} w={2.2}><path d="M10 72H118M10 94H118M10 116H118" /></Faint>
      <Faint o={0.4} w={5}><path d="M10 58V186" /></Faint>
      <path d="M6 66h8v12H6zM6 88h8v12H6zM6 110h8v12H6z" fill="currentColor" fillOpacity=".4" stroke="none" />
      <Faint o={0.4} w={1.8}><path d="M4 186H156" /></Faint>
      <g transform="rotate(-6 138 0)">
        <path d="M138 0v20" strokeWidth="2.6" strokeDasharray="3 2" strokeLinecap="butt" />
        <path d="M138 20L126 31M138 20L150 31" strokeWidth="1.6" />
        <rect x="122" y="30" width="32" height="96" rx="15" fill="currentColor" fillOpacity=".18" strokeWidth="3" />
        <path d="M123 46h30M123 110h30" strokeWidth="2" strokeOpacity=".6" />
      </g>
      <Faint o={0.4} w={2}><path d="M160 46v18M160 76v26" /></Faint>
      <Shadow cx={64} rx={34} />
      <Figure pose={{
        head: [72, 52], neck: [68, 68], hip: [58, 116], chest: 9.5,
        arm: [[72, 72], [92, 68], [110, 64]], farArm: [[66, 72], [74, 92], [80, 70]],
        leg: [[58, 116], [80, 148], [86, 180], [96, 184]], farLeg: [[58, 116], [48, 150], [36, 176], [44, 184]],
      }} far={<Glove at={[82, 64]} r={8.5} />} near={<Glove at={[115, 63]} />} />
      <Faint o={0.6} w={2}><path d="M114 46l3 6M112 82l3-6M104 50l4 5" /></Faint>
    </>
  );
}

/** Crossfit: swing de pesa rusa en el punto alto, el cajón de saltos y las argollas colgando. */
export function Crossfit() {
  return (
    <>
      <Faint o={0.32} w={1.6}><path d="M24 0V36M46 0V36" /></Faint>
      <Faint o={0.5} w={3}><circle cx="24" cy="42" r="6" /><circle cx="46" cy="42" r="6" /></Faint>
      <path d="M8 148h44v38H8z" fill="currentColor" fillOpacity=".12" strokeOpacity=".5" strokeWidth="2.4" />
      <path d="M8 148l12-10h44l-12 10M52 186l12-10v-38" strokeOpacity=".32" strokeWidth="2.4" />
      <Faint o={0.45} w={4}><path d="M22 162h16" /></Faint>
      <Faint o={0.4} w={1.8}><path d="M4 186H156" /></Faint>
      <Shadow cx={80} rx={28} />
      <Faint o={0.38} w={2} dash="2 6"><path d="M90 154C126 148 154 116 150 86" /></Faint>
      <Figure pose={{
        head: [81, 46], neck: [79, 62], hip: [76, 110],
        arm: [[81, 66], [98, 65], [114, 62]], farArm: [[77, 66], [94, 67], [111, 64]],
        leg: [[76, 110], [84, 146], [82, 180], [92, 184]], farLeg: [[76, 110], [72, 146], [70, 180], [80, 184]],
      }} near={
        <g transform="translate(115 62) rotate(-80) translate(0 7)">
          <path d="M-8 7C-11 -12 11 -12 8 7" strokeWidth="4" />
          <path d="M-9 31A13.5 13.5 0 1 1 9 31Z" fill="currentColor" fillOpacity=".32" strokeWidth="3" />
          <path d="M-7 13a10 10 0 0 0-1.5 9" strokeWidth="1.6" strokeOpacity=".7" />
        </g>
      } />
    </>
  );
}
