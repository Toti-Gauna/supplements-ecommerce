import { Figure } from "../figure";
import { Basketball, Faint, Mesh, Shadow, SoccerBall, Volleyball } from "./stage";

/** Fútbol: remate de volea con la pelota saliendo hacia el arco (palo, travesaño y red al fondo). */
export function Futbol() {
  return (
    <>
      <Faint o={0.4} w={3.5}><path d="M100 100V30H162" /></Faint>
      <Mesh x={102} y={32} w={60} h={68} step={8} o={0.16} />
      <Faint o={0.3} w={1.6}><path d="M6 186H154M100 100l-10 86" /></Faint>
      <Shadow cx={70} rx={36} />
      <Figure pose={{
        head: [70, 42], neck: [66, 58], hip: [60, 106],
        arm: [[64, 62], [46, 76], [30, 70]], farArm: [[68, 62], [86, 70], [98, 58]],
        leg: [[60, 106], [88, 128], [110, 140], [119, 136]], farLeg: [[60, 106], [62, 144], [60, 180], [70, 184]],
      }} />
      <Faint o={0.55} w={2}><path d="M118 148l4 7M110 150l-1 7M126 144l7 4" /></Faint>
      <Faint o={0.45} w={2.4}><path d="M120 116l-12 3M122 106l-9 1M128 98l-6-3" /></Faint>
      <SoccerBall x={138} y={118} r={11} />
    </>
  );
}

/** Básquet: volcada en el aire, la pelota sobre el aro con su red y el tablero de perfil. */
export function Basquet() {
  return (
    <>
      <Faint o={0.5} w={4.5}><path d="M148 12V76" /></Faint>
      <Faint o={0.32} w={3}><path d="M150 44h12M150 64l12 10" /></Faint>
      <path d="M116 60l5 22M122 61l3 21M128 62v20M134 61l-2 21M140 60l-4 22M117 64l17 18M139 64l-17 18M120 82h16" strokeOpacity=".5" strokeWidth="1.3" />
      <ellipse cx="129" cy="59" rx="16" ry="3.6" strokeWidth="3.2" />
      <path d="M145 59h3" strokeWidth="3.2" />
      <Faint o={0.3} w={1.6}><path d="M6 190H154" /></Faint>
      <Shadow cx={74} rx={22} y={190} o={0.12} />
      <Faint o={0.4} w={2.2}><path d="M44 152l-8 11M56 168l-6 10M34 136l-8 9" /></Faint>
      <Figure pose={{
        head: [88, 60], neck: [84, 74], hip: [72, 118],
        arm: [[88, 77], [100, 56], [112, 42]], farArm: [[82, 78], [70, 96], [62, 108]],
        leg: [[72, 118], [94, 134], [86, 160], [94, 166]], farLeg: [[72, 118], [62, 150], [48, 168], [44, 178]],
      }} />
      <Basketball x={121} y={34} r={11} />
    </>
  );
}

/** Vóley: remate en el aire por encima de la red (faja, malla y antenas), con la pelota recién golpeada. */
export function Voley() {
  return (
    <>
      <Shadow cx={62} rx={20} o={0.12} />
      <Faint o={0.3} w={1.6}><path d="M6 186H154" /></Faint>
      <Faint o={0.5} w={2}><path d="M122 8l7-5M124 19h9M120 30l7 5" /></Faint>
      <Faint o={0.35} w={2.2}><path d="M40 20c6-12 22-18 34-14" /></Faint>
      <Figure pose={{
        head: [64, 42], neck: [64, 58], hip: [58, 104],
        arm: [[68, 60], [84, 40], [100, 28]], farArm: [[62, 60], [72, 80], [84, 88]],
        leg: [[58, 104], [72, 128], [58, 150], [62, 158]], farLeg: [[58, 104], [48, 132], [36, 148], [36, 157]],
      }} />
      <Volleyball x={110} y={20} r={10} />
      <Mesh x={8} y={132} w={144} h={30} step={6} o={0.3} />
      <path d="M8 130H152" strokeWidth="4.5" />
      <path d="M8 163H152" strokeWidth="1.6" strokeOpacity=".55" />
      <Faint o={0.6} w={2.4} dash="4 4"><path d="M8 104V164M152 104V164" /></Faint>
      <Faint o={0.3} w={2.6}><path d="M8 164V186M152 164V186" /></Faint>
    </>
  );
}

/** Rugby: try en palomita, la ovalada apoyando sobre la línea y la hache de los palos detrás. */
export function Rugby() {
  return (
    <>
      <Faint o={0.32} w={4}><path d="M52 4V150M110 4V150M52 70H110" /></Faint>
      <path d="M47 120h10v30H47zM105 120h10v30h-10z" fill="currentColor" fillOpacity=".14" strokeOpacity=".3" strokeWidth="1.5" />
      <Faint o={0.55} w={3}><path d="M4 176H156" /></Faint>
      <Faint o={0.25} w={1.5}><path d="M4 186H156" /></Faint>
      <Shadow cx={86} rx={44} y={180} o={0.14} />
      <Faint o={0.4} w={2.2}><path d="M4 70h14M2 82h10M8 120h12" /></Faint>
      <Figure pose={{
        head: [116, 114], neck: [104, 113], hip: [60, 104],
        arm: [[104, 115], [122, 130], [133, 150]], farArm: [[100, 116], [116, 136], [126, 154]],
        leg: [[60, 104], [38, 96], [18, 88], [10, 82]], farLeg: [[60, 104], [40, 110], [22, 106], [13, 101]],
      }} />
      <g transform="rotate(-18 140 162)">
        <ellipse cx="140" cy="162" rx="14" ry="8.4" fill="currentColor" fillOpacity=".22" strokeWidth="3" />
        <path d="M128 162h24M134 159.5v5M138 159.5v5M142 159.5v5M146 159.5v5" strokeWidth="1.4" />
      </g>
      <Faint o={0.5} w={2}><path d="M122 172l-6-4M156 170l4-5M150 175l7 1" /></Faint>
    </>
  );
}
