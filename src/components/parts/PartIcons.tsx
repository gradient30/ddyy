import React from 'react';

type IconProps = { size?: number; className?: string };

function Svg({ size = 64, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width={size}
      height={size}
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

const SquareBase = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="48" width="64" height="22" rx="6" fill="#5B6570" />
    <rect x="14" y="42" width="52" height="12" rx="4" fill="#7A8490" />
    <circle cx="22" cy="62" r="3" fill="#D8DEE4" />
    <circle cx="40" cy="62" r="3" fill="#D8DEE4" />
    <circle cx="58" cy="62" r="3" fill="#D8DEE4" />
  </Svg>
);

const RoundBase = (p: IconProps) => (
  <Svg {...p}>
    <ellipse cx="40" cy="58" rx="30" ry="14" fill="#5B6570" />
    <ellipse cx="40" cy="52" rx="24" ry="10" fill="#7A8490" />
    <circle cx="40" cy="52" r="4" fill="#D8DEE4" />
  </Svg>
);

const SquarePillar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="26" y="8" width="28" height="58" rx="5" fill="#6B7580" />
    <rect x="30" y="12" width="20" height="10" rx="3" fill="#EEF2F5" />
    <rect x="22" y="62" width="36" height="10" rx="3" fill="#4E575F" />
  </Svg>
);

const RoundPillar = (p: IconProps) => (
  <Svg {...p}>
    <rect x="28" y="10" width="24" height="54" rx="12" fill="#6B7580" />
    <ellipse cx="40" cy="14" rx="12" ry="6" fill="#8A949E" />
    <rect x="22" y="62" width="36" height="10" rx="5" fill="#4E575F" />
  </Svg>
);

const Motor = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="40" cy="42" r="22" fill="#3AA0C7" />
    <circle cx="40" cy="42" r="13" fill="#E8F6FB" />
    <circle cx="40" cy="42" r="5" fill="#2A6F86" />
    {[0, 60, 120, 180, 240, 300].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return <circle key={deg} cx={40 + Math.cos(r) * 16} cy={42 + Math.sin(r) * 16} r="3" fill="#F4D35E" />;
    })}
    <rect x="34" y="10" width="12" height="10" rx="2" fill="#2A6F86" />
  </Svg>
);

const SolarMotor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="10" y="12" width="60" height="28" rx="4" fill="#1E4A7A" />
    {[18, 30, 42, 54].map((x) => (
      <line key={x} x1={x} y1="14" x2={x} y2="38" stroke="#49C2E8" strokeWidth="2" />
    ))}
    <circle cx="40" cy="56" r="14" fill="#3AA0C7" />
    <circle cx="40" cy="56" r="6" fill="#F4D35E" />
    <line x1="40" y1="40" x2="40" y2="42" stroke="#2A6F86" strokeWidth="3" />
  </Svg>
);

const StraightArm = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="34" width="64" height="14" rx="7" fill="#E25B4C" />
    {[18, 30, 42, 54].map((x) => (
      <rect key={x} x={x} y="34" width="7" height="14" fill="#FFF8EE" />
    ))}
    <circle cx="68" cy="41" r="6" fill="#F4D35E" />
    <circle cx="12" cy="41" r="5" fill="#4E575F" />
  </Svg>
);

const FoldingArm = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="42" width="36" height="12" rx="6" fill="#E25B4C" />
    <rect x="40" y="18" width="30" height="12" rx="6" fill="#E25B4C" transform="rotate(-28 40 24)" />
    <circle cx="42" cy="48" r="5" fill="#4E575F" />
    <circle cx="12" cy="48" r="5" fill="#4E575F" />
  </Svg>
);

const FenceArm = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="28" width="64" height="6" rx="2" fill="#5B6570" />
    <rect x="8" y="50" width="64" height="6" rx="2" fill="#5B6570" />
    {[14, 26, 38, 50, 62].map((x) => (
      <rect key={x} x={x} y="28" width="6" height="28" rx="2" fill="#7A8490" />
    ))}
  </Svg>
);

const IrSensor = (p: IconProps) => (
  <Svg {...p}>
    <rect x="18" y="22" width="44" height="36" rx="8" fill="#5B4B8A" />
    <circle cx="40" cy="40" r="11" fill="#F28B82" />
    <circle cx="40" cy="40" r="5" fill="#FFF3C4" />
    <path d="M16 28 C8 40 8 48 16 56" fill="none" stroke="#E25B4C" strokeWidth="3" />
    <path d="M64 28 C72 40 72 48 64 56" fill="none" stroke="#E25B4C" strokeWidth="3" />
  </Svg>
);

const MagnetSensor = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 18 h14 v28 a12 12 0 0 1-14 0z" fill="#E25B4C" />
    <path d="M44 18 h14 v28 a12 12 0 0 1-14 0z" fill="#3AA0C7" />
    <rect x="22" y="14" width="14" height="10" fill="#F4D35E" />
    <rect x="44" y="14" width="14" height="10" fill="#F4D35E" />
  </Svg>
);

const Camera = (p: IconProps) => (
  <Svg {...p}>
    <rect x="12" y="24" width="56" height="36" rx="8" fill="#3D4450" />
    <circle cx="40" cy="42" r="12" fill="#49C2E8" />
    <circle cx="40" cy="42" r="6" fill="#1A2230" />
    <rect x="30" y="16" width="20" height="10" rx="3" fill="#2A313C" />
    <circle cx="58" cy="32" r="3" fill="#E25B4C" />
  </Svg>
);

const TrafficLight = (p: IconProps) => (
  <Svg {...p}>
    <rect x="28" y="8" width="24" height="64" rx="8" fill="#3D4450" />
    <circle cx="40" cy="22" r="7" fill="#E25B4C" />
    <circle cx="40" cy="40" r="7" fill="#F4D35E" />
    <circle cx="40" cy="58" r="7" fill="#4CAF7A" />
  </Svg>
);

const LedStrip = (p: IconProps) => (
  <Svg {...p}>
    <rect x="8" y="30" width="64" height="20" rx="8" fill="#2A313C" />
    {['#E25B4C', '#F4D35E', '#4CAF7A', '#49C2E8', '#B388FF'].map((c, i) => (
      <circle key={c} cx={18 + i * 12} cy="40" r="5" fill={c} />
    ))}
  </Svg>
);

const ButtonPanel = (p: IconProps) => (
  <Svg {...p}>
    <rect x="14" y="12" width="52" height="56" rx="8" fill="#4E575F" />
    <rect x="20" y="18" width="40" height="18" rx="4" fill="#49C2E8" />
    <circle cx="28" cy="52" r="7" fill="#4CAF7A" />
    <circle cx="52" cy="52" r="7" fill="#E25B4C" />
  </Svg>
);

const CardReader = (p: IconProps) => (
  <Svg {...p}>
    <rect x="16" y="14" width="48" height="52" rx="8" fill="#4E575F" />
    <rect x="24" y="22" width="32" height="20" rx="3" fill="#1A2230" />
    <rect x="22" y="48" width="36" height="10" rx="2" fill="#F4D35E" />
    <rect x="50" y="28" width="18" height="12" rx="2" fill="#49C2E8" transform="rotate(-18 59 34)" />
  </Svg>
);

const Remote = (p: IconProps) => (
  <Svg {...p}>
    <rect x="26" y="8" width="28" height="64" rx="10" fill="#5B6570" />
    <circle cx="40" cy="24" r="7" fill="#E25B4C" />
    <circle cx="40" cy="42" r="6" fill="#4CAF7A" />
    <rect x="32" y="54" width="16" height="8" rx="3" fill="#F4D35E" />
  </Svg>
);

const PaintRed = (p: IconProps) => (
  <Svg {...p}>
    <rect x="22" y="18" width="36" height="48" rx="6" fill="#E25B4C" />
    <rect x="22" y="30" width="36" height="12" fill="#FFF8EE" />
    <ellipse cx="40" cy="18" rx="14" ry="6" fill="#C4473B" />
  </Svg>
);

const PaintBlue = (p: IconProps) => (
  <Svg {...p}>
    <rect x="22" y="18" width="36" height="48" rx="6" fill="#3AA0C7" />
    <rect x="22" y="30" width="36" height="12" fill="#F4D35E" />
    <ellipse cx="40" cy="18" rx="14" ry="6" fill="#2A7A98" />
  </Svg>
);

const PaintRainbow = (p: IconProps) => (
  <Svg {...p}>
    {['#E25B4C', '#F4A259', '#F4D35E', '#4CAF7A', '#49C2E8', '#B388FF'].map((c, i) => (
      <rect key={c} x="18" y={12 + i * 10} width="44" height="10" fill={c} />
    ))}
  </Svg>
);

const Reflector = (p: IconProps) => (
  <Svg {...p}>
    <rect x="14" y="28" width="52" height="24" rx="6" fill="#F4D35E" />
    <path d="M22 40 L32 32 L42 40 L52 32 L62 40" fill="none" stroke="#FFF8EE" strokeWidth="3" />
  </Svg>
);

const MascotSticker = (p: IconProps) => (
  <Svg {...p}>
    <rect x="20" y="16" width="40" height="48" rx="12" fill="#49C2E8" />
    <circle cx="32" cy="34" r="5" fill="#1A2230" />
    <circle cx="48" cy="34" r="5" fill="#1A2230" />
    <path d="M30 48 Q40 56 50 48" fill="none" stroke="#1A2230" strokeWidth="3" />
    <rect x="16" y="8" width="48" height="10" rx="5" fill="#E25B4C" />
  </Svg>
);

const SmileSticker = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="40" cy="40" r="26" fill="#F4D35E" />
    <circle cx="30" cy="34" r="4" fill="#3D4450" />
    <circle cx="50" cy="34" r="4" fill="#3D4450" />
    <path d="M28 48 Q40 58 52 48" fill="none" stroke="#3D4450" strokeWidth="3" />
  </Svg>
);

const Bolt = (p: IconProps) => (
  <Svg {...p}>
    <polygon points="40,10 58,20 58,40 40,50 22,40 22,20" fill="#8A949E" />
    <circle cx="40" cy="30" r="8" fill="#D8DEE4" />
    <rect x="36" y="46" width="8" height="24" rx="2" fill="#6B7580" />
  </Svg>
);

const Gear = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="40" cy="40" r="22" fill="#F4A259" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
      const r = (deg * Math.PI) / 180;
      return <rect key={deg} x={40 + Math.cos(r) * 24 - 5} y={40 + Math.sin(r) * 24 - 5} width="10" height="10" rx="2" fill="#F4A259" />;
    })}
    <circle cx="40" cy="40" r="8" fill="#FFF8EE" />
  </Svg>
);

const Spring = (p: IconProps) => (
  <Svg {...p}>
    <path d="M24 16 C40 16 40 28 24 28 C40 28 40 40 24 40 C40 40 40 52 24 52 C40 52 40 64 24 64" fill="none" stroke="#49C2E8" strokeWidth="6" strokeLinecap="round" />
    <path d="M40 16 C56 16 56 28 40 28 C56 28 56 40 40 40 C56 40 56 52 40 52 C56 52 56 64 40 64" fill="none" stroke="#3AA0C7" strokeWidth="6" strokeLinecap="round" />
  </Svg>
);

const Wire = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 28 C28 12 36 52 52 28 C60 16 68 40 70 52" fill="none" stroke="#E25B4C" strokeWidth="6" strokeLinecap="round" />
    <rect x="6" y="22" width="12" height="14" rx="3" fill="#F4D35E" />
    <rect x="62" y="46" width="12" height="14" rx="3" fill="#F4D35E" />
  </Svg>
);

const Board = (p: IconProps) => (
  <Svg {...p}>
    <rect x="10" y="16" width="60" height="48" rx="6" fill="#4CAF7A" />
    <rect x="16" y="22" width="20" height="12" rx="2" fill="#1A2230" />
    <circle cx="50" cy="28" r="5" fill="#F4D35E" />
    <circle cx="62" cy="28" r="4" fill="#E25B4C" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={16 + i * 10} y="44" width="6" height="12" rx="1" fill="#D8DEE4" />
    ))}
  </Svg>
);

const Led = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="40" cy="34" r="16" fill="#F4D35E" />
    <rect x="34" y="48" width="12" height="16" rx="2" fill="#8A949E" />
    <line x1="30" y1="64" x2="24" y2="72" stroke="#8A949E" strokeWidth="3" />
    <line x1="50" y1="64" x2="56" y2="72" stroke="#8A949E" strokeWidth="3" />
  </Svg>
);

const Battery = (p: IconProps) => (
  <Svg {...p}>
    <rect x="16" y="22" width="44" height="36" rx="6" fill="#4CAF7A" />
    <rect x="60" y="32" width="8" height="16" rx="2" fill="#8A949E" />
    <rect x="22" y="30" width="10" height="20" fill="#FFF8EE" />
    <rect x="36" y="30" width="10" height="20" fill="#FFF8EE" />
  </Svg>
);

const SolarPanel = (p: IconProps) => (
  <Svg {...p}>
    <rect x="10" y="20" width="60" height="40" rx="4" fill="#1E4A7A" />
    <line x1="10" y1="40" x2="70" y2="40" stroke="#49C2E8" strokeWidth="2" />
    <line x1="30" y1="20" x2="30" y2="60" stroke="#49C2E8" strokeWidth="2" />
    <line x1="50" y1="20" x2="50" y2="60" stroke="#49C2E8" strokeWidth="2" />
    <circle cx="16" cy="14" r="8" fill="#F4D35E" />
  </Svg>
);

const Hinge = (p: IconProps) => (
  <Svg {...p}>
    <rect x="12" y="28" width="24" height="24" rx="4" fill="#8A949E" />
    <rect x="44" y="28" width="24" height="24" rx="4" fill="#8A949E" />
    <circle cx="40" cy="40" r="8" fill="#4E575F" />
    <circle cx="40" cy="40" r="3" fill="#F4D35E" />
  </Svg>
);

const PaintBucket = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 28 h36 l-6 36 h-24z" fill="#E25B4C" />
    <rect x="20" y="22" width="40" height="10" rx="4" fill="#8A949E" />
    <path d="M28 22 Q40 8 52 22" fill="none" stroke="#8A949E" strokeWidth="4" />
    <circle cx="58" cy="58" r="6" fill="#F4D35E" />
  </Svg>
);

const Chip = (p: IconProps) => (
  <Svg {...p}>
    <rect x="22" y="22" width="36" height="36" rx="6" fill="#3D4450" />
    <rect x="28" y="28" width="24" height="24" rx="3" fill="#49C2E8" />
    {[0, 1, 2, 3].map((i) => (
      <React.Fragment key={i}>
        <rect x={26 + i * 8} y="12" width="4" height="10" fill="#8A949E" />
        <rect x={26 + i * 8} y="58" width="4" height="10" fill="#8A949E" />
      </React.Fragment>
    ))}
  </Svg>
);

const Sign = (p: IconProps) => (
  <Svg {...p}>
    <rect x="16" y="12" width="48" height="32" rx="6" fill="#E25B4C" />
    <text x="40" y="34" textAnchor="middle" fontSize="16" fontWeight="800" fill="white">停</text>
    <rect x="36" y="44" width="8" height="24" fill="#8A949E" />
  </Svg>
);

const Cable = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 20 C20 50 36 16 44 48 C50 68 64 36 68 56" fill="none" stroke="#7A4E2D" strokeWidth="7" strokeLinecap="round" />
    <circle cx="16" cy="20" r="5" fill="#F4D35E" />
    <circle cx="68" cy="56" r="5" fill="#F4D35E" />
  </Svg>
);

const Generic = (p: IconProps) => (
  <Svg {...p}>
    <rect x="16" y="16" width="48" height="48" rx="10" fill="#8A949E" />
    <circle cx="40" cy="40" r="10" fill="#FFF8EE" />
  </Svg>
);

const ICONS: Record<string, React.FC<IconProps>> = {
  base: SquareBase,
  base1: SquareBase,
  base2: RoundBase,
  pillar: SquarePillar,
  pillar1: SquarePillar,
  pillar2: RoundPillar,
  motor: Motor,
  motor1: Motor,
  motor2: SolarMotor,
  arm: StraightArm,
  arm1: StraightArm,
  arm2: FoldingArm,
  arm3: FenceArm,
  sensor: IrSensor,
  sensor1: IrSensor,
  sensor2: MagnetSensor,
  sensor3: Camera,
  light: TrafficLight,
  light1: TrafficLight,
  light2: LedStrip,
  panel: ButtonPanel,
  panel1: ButtonPanel,
  panel2: CardReader,
  panel3: Remote,
  paint: PaintRed,
  paint1: PaintRed,
  paint2: PaintBlue,
  paint3: PaintRainbow,
  sticker1: Reflector,
  sticker2: MascotSticker,
  sticker3: SmileSticker,
  bolt: Bolt,
  bolt1: Bolt,
  gear: Gear,
  gear1: Gear,
  spring: Spring,
  spring1: Spring,
  wire: Wire,
  motor_wire: Wire,
  board: Board,
  led: Led,
  led1: Led,
  battery: Battery,
  battery1: Battery,
  solar: SolarPanel,
  solar1: SolarPanel,
  hinge: Hinge,
  hinge1: Hinge,
  bucket: PaintBucket,
  cam: Camera,
  cam1: Camera,
  chip: Chip,
  chip1: Chip,
  sign: Sign,
  sign1: Sign,
  cable: Cable,
  wire1: Cable,
};

export const PART_ICON_IDS = Object.keys(ICONS);

export function PartIcon({ id, size = 64, className }: { id: string; size?: number; className?: string }) {
  const Comp = ICONS[id] ?? Generic;
  return <Comp size={size} className={className} />;
}
