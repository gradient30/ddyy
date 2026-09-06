import React from 'react';

interface Props {
  mood?: 'happy' | 'excited' | 'thinking' | 'sleeping' | 'waving';
  size?: number;
  className?: string;
}

const XiaoZhaZha: React.FC<Props> = ({ mood = 'happy', size = 120, className = '' }) => {
  const mouth = {
    happy: 'M 36,68 Q 50,80 64,68',
    excited: 'M 34,66 Q 50,84 66,66',
    thinking: 'M 40,70 Q 50,70 60,70',
    sleeping: 'M 38,70 Q 50,76 62,70',
    waving: 'M 36,68 Q 50,82 64,68',
  };

  const animClass = mood === 'waving' ? 'animate-wiggle' :
    mood === 'excited' ? 'animate-bounce-gentle' :
    mood === 'sleeping' ? '' : 'animate-float';

  const eyeOpen = mood !== 'sleeping';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`${animClass} ${className}`}
      aria-label="小闸闸"
    >
      <rect x="47" y="8" width="5" height="18" rx="2.5" fill="hsl(var(--coral-red))" />
      <rect x="52" y="9" width="18" height="4" rx="2" fill="hsl(var(--coral-red))" />
      <circle cx="72" cy="11" r="3.5" fill="hsl(var(--golden))" />

      <rect x="18" y="26" width="64" height="56" rx="22" fill="hsl(var(--sky-blue))" />
      <rect x="24" y="32" width="52" height="28" rx="16" fill="hsl(198 50% 72%)" opacity="0.45" />

      {eyeOpen ? (
        <>
          <ellipse cx="38" cy="50" rx="7" ry="8" fill="white" />
          <ellipse cx="62" cy="50" rx="7" ry="8" fill="white" />
          <circle cx="39" cy="51" r="3.4" fill="hsl(var(--foreground))" />
          <circle cx="63" cy="51" r="3.4" fill="hsl(var(--foreground))" />
          <circle cx="40.5" cy="49.5" r="1.1" fill="white" />
          <circle cx="64.5" cy="49.5" r="1.1" fill="white" />
        </>
      ) : (
        <>
          <path d="M 32,50 Q 38,54 44,50" stroke="hsl(var(--foreground))" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M 56,50 Q 62,54 68,50" stroke="hsl(var(--foreground))" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      )}

      <circle cx="28" cy="60" r="5" fill="hsl(var(--coral-red))" opacity="0.28" />
      <circle cx="72" cy="60" r="5" fill="hsl(var(--coral-red))" opacity="0.28" />

      <path d={mouth[mood]} stroke="hsl(var(--foreground))" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      <ellipse cx="36" cy="84" rx="9" ry="5" fill="hsl(var(--sky-blue))" />
      <ellipse cx="64" cy="84" rx="9" ry="5" fill="hsl(var(--sky-blue))" />
      <rect x="16" y="88" width="68" height="8" rx="4" fill="hsl(var(--muted))" />

      {mood === 'waving' && (
        <ellipse cx="86" cy="48" rx="7" ry="5" fill="hsl(var(--sky-blue))" />
      )}
    </svg>
  );
};

export default XiaoZhaZha;
