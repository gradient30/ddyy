import React from 'react';

interface Props {
  mood?: 'happy' | 'excited' | 'thinking' | 'sleeping' | 'waving';
  size?: number;
  className?: string;
}

const XiaoZhaZha: React.FC<Props> = ({ mood = 'happy', size = 120, className = '' }) => {
  const eyeVariants = {
    happy: { left: '◕', right: '◕' },
    excited: { left: '★', right: '★' },
    thinking: { left: '◑', right: '◐' },
    sleeping: { left: '—', right: '—' },
    waving: { left: '◕', right: '◕' },
  };

  const mouthVariants = {
    happy: 'M 35,70 Q 50,82 65,70',
    excited: 'M 32,68 Q 50,88 68,68',
    thinking: 'M 40,72 Q 50,72 60,72',
    sleeping: 'M 38,72 Q 50,78 62,72',
    waving: 'M 35,70 Q 50,85 65,70',
  };

  const animClass = mood === 'waving' ? 'animate-wiggle' :
    mood === 'excited' ? 'animate-bounce-gentle' :
    mood === 'sleeping' ? '' : 'animate-float';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${animClass} ${className}`}
      aria-label="小闸闸吉祥物"
    >
      {/* 道闸杆 - 从身体顶部伸出 */}
      <g style={{ transformOrigin: '50px 25px' }}>
        <rect x="48" y="5" width="4" height="22" rx="2" fill="hsl(var(--coral-red))" />
        <rect x="52" y="6" width="20" height="3" rx="1.5" fill="hsl(var(--coral-red))" />
        <circle cx="72" cy="7.5" r="3" fill="hsl(var(--golden))" />
      </g>

      {/* 身体 - 圆润方形 */}
      <rect x="20" y="25" width="60" height="55" rx="18" fill="hsl(var(--sky-blue))" />
      <rect x="25" y="30" width="50" height="45" rx="14" fill="hsl(195 100% 60%)" opacity="0.5" />

      {/* 眼睛 */}
      <text x="36" y="52" fontSize="14" textAnchor="middle" fill="hsl(var(--foreground))">
        {eyeVariants[mood].left}
      </text>
      <text x="64" y="52" fontSize="14" textAnchor="middle" fill="hsl(var(--foreground))">
        {eyeVariants[mood].right}
      </text>

      {/* 腮红 */}
      <circle cx="28" cy="58" r="6" fill="hsl(var(--coral-red))" opacity="0.3" />
      <circle cx="72" cy="58" r="6" fill="hsl(var(--coral-red))" opacity="0.3" />

      {/* 嘴巴 */}
      <path d={mouthVariants[mood]} stroke="hsl(var(--foreground))" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* 小脚 */}
      <ellipse cx="35" cy="82" rx="10" ry="6" fill="hsl(var(--sky-blue))" />
      <ellipse cx="65" cy="82" rx="10" ry="6" fill="hsl(var(--sky-blue))" />

      {/* 底座 */}
      <rect x="15" y="85" width="70" height="10" rx="5" fill="hsl(var(--muted))" />
      <rect x="18" y="87" width="64" height="6" rx="3" fill="hsl(var(--border))" />

      {/* 挥手 */}
      {mood === 'waving' && (
        <g className="animate-wiggle" style={{ transformOrigin: '85px 45px' }}>
          <ellipse cx="85" cy="45" rx="7" ry="5" fill="hsl(var(--sky-blue))" />
        </g>
      )}
    </svg>
  );
};

export default XiaoZhaZha;
