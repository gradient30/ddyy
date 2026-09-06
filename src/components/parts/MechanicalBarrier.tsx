import React from 'react';

export type BarrierSlots = Record<string, string | undefined>;

export function armKind(id?: string): 'straight' | 'folding' | 'fence' | null {
  if (!id) return null;
  if (id === 'arm2' || id === 'folding') return 'folding';
  if (id === 'arm3' || id === 'fence') return 'fence';
  return 'straight';
}

export function paintColors(id?: string): { fill: string; stripe: string } {
  if (id === 'paint2') return { fill: '#2F6FED', stripe: '#F4D35E' };
  if (id === 'paint3') return { fill: 'url(#mbRainbow)', stripe: '#FFF8EE' };
  return { fill: '#D63B32', stripe: '#FFF6E8' };
}

interface MechanicalBarrierProps {
  slots: BarrierSlots;
  running?: boolean;
  className?: string;
}

/** 侧视真实道闸：混凝土底座、机柜、齿轮箱轴、杆臂绕轴转动 */
export function MechanicalBarrier({ slots, running = false, className }: MechanicalBarrierProps) {
  const kind = armKind(slots.arm);
  const paint = paintColors(slots.paint);
  const lift = running ? -82 : 0;
  const fold = running && kind === 'folding' ? 76 : 0;
  const shaft = { x: 118, y: 96 };

  return (
    <svg viewBox="0 0 420 220" className={className ?? 'w-full h-full'} role="img" aria-label="道闸装配预览">
      <defs>
        <linearGradient id="mbRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E25B4C" />
          <stop offset="35%" stopColor="#F4D35E" />
          <stop offset="65%" stopColor="#4CAF7A" />
          <stop offset="100%" stopColor="#3AA0C7" />
        </linearGradient>
        <linearGradient id="mbAsphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6A727A" />
          <stop offset="100%" stopColor="#4A525A" />
        </linearGradient>
        <linearGradient id="mbCabinet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8A929A" />
          <stop offset="100%" stopColor="#5C646C" />
        </linearGradient>
      </defs>

      <rect x="0" y="178" width="420" height="42" fill="url(#mbAsphalt)" />
      <rect x="0" y="174" width="420" height="6" fill="#C9B089" />
      {[40, 90, 140, 190, 240, 290, 340].map(x => (
        <rect key={x} x={x} y="196" width="28" height="4" rx="1" fill="#E8D27A" opacity="0.85" />
      ))}

      {slots.base && (
        <g className="animate-pop-in">
          {slots.base === 'base2' ? (
            <ellipse cx="92" cy="176" rx="54" ry="16" fill="#6B7280" />
          ) : (
            <path d="M38 168 h108 l8 16 h-124 z" fill="#7A828C" />
          )}
          <rect x="42" y="168" width="100" height="10" rx="2" fill="#9AA3AD" />
          {[52, 78, 104, 128].map(x => (
            <g key={x}>
              <circle cx={x} cy="176" r="4.5" fill="#3D4450" />
              <polygon points={`${x - 2.2},176 ${x},173.6 ${x + 2.2},176 ${x},178.4`} fill="#D8DEE4" />
            </g>
          ))}
        </g>
      )}

      {slots.pillar && (
        <g className="animate-pop-in">
          {slots.pillar === 'pillar2' ? (
            <rect x="64" y="58" width="56" height="112" rx="18" fill="url(#mbCabinet)" />
          ) : (
            <rect x="60" y="54" width="64" height="116" rx="6" fill="url(#mbCabinet)" />
          )}
          <rect x="68" y="70" width="48" height="88" rx="3" fill="#4E575F" opacity="0.35" />
          <rect x="70" y="74" width="18" height="28" rx="2" fill="#2B3138" />
          <circle cx="105" cy="128" r="3" fill="#C5CDD4" />
          <rect x="72" y="150" width="10" height="6" rx="1" fill="#3AA0C7" />
          <rect x="86" y="150" width="10" height="6" rx="1" fill="#E25B4C" />
        </g>
      )}

      {slots.motor && (
        <g className="animate-pop-in" style={running ? { transformOrigin: `${shaft.x}px ${shaft.y}px` } : undefined}>
          {slots.motor === 'motor2' && (
            <g>
              <rect x="58" y="36" width="68" height="22" rx="2" fill="#163A62" />
              {[66, 78, 90, 102, 114].map(x => (
                <line key={x} x1={x} y1="38" x2={x} y2="56" stroke="#49C2E8" strokeWidth="2" />
              ))}
            </g>
          )}
          <circle cx={shaft.x} cy={shaft.y} r="22" fill="#2E8AAB" />
          <circle cx={shaft.x} cy={shaft.y} r="14" fill="#1F5F78" />
          {[0, 45, 90, 135].map(deg => (
            <rect
              key={deg}
              x={shaft.x - 2}
              y={shaft.y - 20}
              width="4"
              height="8"
              rx="1"
              fill="#F4D35E"
              transform={`rotate(${deg + (running ? 25 : 0)} ${shaft.x} ${shaft.y})`}
            />
          ))}
          <circle cx={shaft.x} cy={shaft.y} r="6" fill="#D8DEE4" />
          <circle cx={shaft.x} cy={shaft.y} r="2.5" fill="#3D4450" />
        </g>
      )}

      {kind && (
        <g
          style={{
            transformOrigin: `${shaft.x}px ${shaft.y}px`,
            transform: `rotate(${lift}deg)`,
            transition: 'transform 1.7s cubic-bezier(0.45,0.05,0.55,0.95)',
          }}
        >
          {kind === 'fence' ? (
            <g>
              <rect x={shaft.x} y={shaft.y - 6} width="248" height="7" rx="2" fill="#4E575F" />
              <rect x={shaft.x} y={shaft.y + 16} width="248" height="7" rx="2" fill="#4E575F" />
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <rect key={i} x={shaft.x + 16 + i * 26} y={shaft.y - 6} width="7" height="29" rx="1" fill="#6B7580" />
              ))}
            </g>
          ) : kind === 'folding' ? (
            <g>
              <rect x={shaft.x} y={shaft.y - 7} width="112" height="14" rx="6" fill={paint.fill} />
              <rect x={shaft.x + 16} y={shaft.y - 7} width="10" height="14" fill={paint.stripe} />
              <rect x={shaft.x + 48} y={shaft.y - 7} width="10" height="14" fill={paint.stripe} />
              <circle cx={shaft.x + 110} cy={shaft.y} r="7" fill="#3D4450" />
              <g
                style={{
                  transformOrigin: `${shaft.x + 110}px ${shaft.y}px`,
                  transform: `rotate(${fold}deg)`,
                  transition: 'transform 1.7s cubic-bezier(0.45,0.05,0.55,0.95)',
                }}
              >
                <rect x={shaft.x + 110} y={shaft.y - 6} width="96" height="12" rx="6" fill={paint.fill} />
                <rect x={shaft.x + 132} y={shaft.y - 6} width="8" height="12" fill={paint.stripe} />
                <rect x={shaft.x + 164} y={shaft.y - 6} width="8" height="12" fill={paint.stripe} />
                <circle cx={shaft.x + 204} cy={shaft.y} r="6" fill="#F4D35E" />
              </g>
            </g>
          ) : (
            <g>
              <rect x={shaft.x - 18} y={shaft.y - 5} width="22" height="10" rx="2" fill="#4E575F" />
              <rect x={shaft.x} y={shaft.y - 8} width="248" height="16" rx="7" fill={paint.fill} />
              {[18, 46, 74, 102, 130, 158, 186, 214].map(x => (
                <rect key={x} x={shaft.x + x} y={shaft.y - 8} width="12" height="16" fill={paint.stripe} />
              ))}
              <circle cx={shaft.x + 244} cy={shaft.y} r="8" fill="#F4D35E" />
              <rect x={shaft.x + 236} y={shaft.y - 3} width="16" height="6" rx="2" fill="#3D4450" />
            </g>
          )}
          {slots.deco === 'sticker1' && <rect x={shaft.x + 70} y={shaft.y - 22} width="26" height="10" rx="2" fill="#F4D35E" />}
          {slots.deco === 'sticker2' && <rect x={shaft.x + 90} y={shaft.y - 26} width="18" height="14" rx="4" fill="#49C2E8" />}
          {slots.deco === 'sticker3' && <circle cx={shaft.x + 100} cy={shaft.y - 20} r="8" fill="#F4D35E" />}
        </g>
      )}

      {slots.sensor && (
        <g className="animate-pop-in">
          {slots.sensor === 'sensor2' ? (
            <>
              <rect x="168" y="186" width="86" height="8" rx="3" fill="#2A3138" />
              <path d="M188 178 h10 v12 a8 8 0 0 1-10 0z" fill="#E25B4C" />
              <path d="M224 178 h10 v12 a8 8 0 0 1-10 0z" fill="#3AA0C7" />
            </>
          ) : slots.sensor === 'sensor3' ? (
            <>
              <rect x="108" y="48" width="26" height="16" rx="3" fill="#2B3138" />
              <circle cx="121" cy="56" r="5" fill="#49C2E8" />
            </>
          ) : (
            <>
              <circle cx="70" cy="118" r="7" fill="#E25B4C" className={running ? 'animate-glow-pulse' : ''} />
              <circle cx="70" cy="118" r="3" fill="#FFF3C4" />
            </>
          )}
        </g>
      )}

      {slots.light && (
        <g className="animate-pop-in">
          {slots.light === 'light2' ? (
            ['#E25B4C', '#F4D35E', '#4CAF7A'].map((c, i) => (
              <circle key={c} cx={74 + i * 14} cy="46" r="6" fill={c} />
            ))
          ) : (
            <>
              <rect x="82" y="28" width="18" height="28" rx="4" fill="#2B3138" />
              <circle cx="91" cy="38" r="6" fill={running ? '#1B8A4A' : '#D63B32'} />
              <circle cx="91" cy="50" r="5" fill={running ? '#D63B32' : '#4CAF7A'} opacity="0.35" />
            </>
          )}
        </g>
      )}

      {slots.panel && (
        <g className="animate-pop-in">
          {slots.panel === 'panel2' ? (
            <rect x="128" y="128" width="28" height="20" rx="3" fill="#2B3138" />
          ) : slots.panel === 'panel3' ? (
            <rect x="132" y="120" width="14" height="30" rx="5" fill="#5B6570" />
          ) : (
            <>
              <rect x="126" y="124" width="32" height="26" rx="3" fill="#2B3138" />
              <circle cx="136" cy="137" r="4" fill="#4CAF7A" />
              <circle cx="148" cy="137" r="4" fill="#E25B4C" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}
