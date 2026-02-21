import React from 'react';

// Detailed barrier anatomy SVG with labeled callout lines
export const AnatomyDiagram: React.FC = React.memo(() => (
  <svg viewBox="0 0 220 180" className="w-full h-full">
    {/* Ground */}
    <rect x="0" y="155" width="220" height="25" rx="3" fill="hsl(142,25%,75%)" />
    {/* Base */}
    <rect x="50" y="130" width="50" height="25" rx="5" fill="hsl(220,15%,45%)" stroke="hsl(220,15%,30%)" strokeWidth="1.5" />
    <text x="140" y="148" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">底座 Base</text>
    <line x1="100" y1="142" x2="138" y2="145" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Pillar */}
    <rect x="62" y="55" width="26" height="78" rx="4" fill="hsl(220,15%,50%)" stroke="hsl(220,15%,35%)" strokeWidth="1.5" />
    <text x="10" y="95" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">立柱 Pillar</text>
    <line x1="40" y1="93" x2="62" y2="93" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Motor housing */}
    <rect x="55" y="72" width="40" height="30" rx="6" fill="hsl(195,60%,55%)" stroke="hsl(195,60%,40%)" strokeWidth="1.5" />
    <circle cx="75" cy="87" r="8" fill="hsl(195,80%,60%)" opacity="0.6" />
    <text x="140" y="92" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">电机 Motor</text>
    <line x1="95" y1="87" x2="138" y2="90" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Arm */}
    <rect x="88" y="58" width="100" height="10" rx="5" fill="hsl(0,65%,55%)" stroke="hsl(0,65%,40%)" strokeWidth="1.5" />
    {[100, 118, 136, 154, 172].map(x => <rect key={x} x={x} y="58" width="5" height="10" rx="1" fill="white" opacity="0.4" />)}
    <circle cx="185" cy="63" r="6" fill="hsl(48,90%,55%)" stroke="hsl(48,90%,40%)" strokeWidth="1" />
    <text x="160" y="50" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">杆臂 Arm</text>
    <line x1="160" y1="52" x2="155" y2="58" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Motor pivot */}
    <circle cx="88" cy="63" r="6" fill="hsl(220,20%,40%)" stroke="hsl(220,20%,30%)" strokeWidth="1.5" />
    {/* Sensor */}
    <circle cx="65" cy="115" r="5" fill="hsl(270,50%,55%)" stroke="hsl(270,50%,40%)" strokeWidth="1" />
    <text x="10" y="118" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">传感器</text>
    <line x1="38" y1="116" x2="60" y2="115" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
    {/* Signal light */}
    <circle cx="75" cy="50" r="6" fill="hsl(142,60%,50%)" stroke="hsl(142,60%,35%)" strokeWidth="1" />
    <circle cx="75" cy="50" r="3" fill="white" opacity="0.5" />
    <text x="110" y="35" fontSize="7" fill="hsl(var(--muted-foreground))" fontWeight="bold">信号灯 Light</text>
    <line x1="110" y1="37" x2="81" y2="48" stroke="hsl(var(--muted-foreground))" strokeWidth="0.8" strokeDasharray="3,2" />
  </svg>
));

// Lever experiment with fulcrum, distance markers, force arrows
export const LeverDiagram: React.FC<{ weightPos: number; tilt: number }> = React.memo(({ weightPos, tilt }) => (
  <svg viewBox="0 0 250 100" className="w-full mb-2">
    {/* Fulcrum triangle */}
    <polygon points="125,85 115,100 135,100" fill="hsl(220,15%,40%)" stroke="hsl(220,15%,30%)" strokeWidth="1.5" />
    <text x="125" y="98" fontSize="6" fill="white" textAnchor="middle">▲</text>
    {/* Lever bar */}
    <g style={{ transformOrigin: '125px 85px', transform: `rotate(${tilt}deg)`, transition: 'transform 0.3s' }}>
      <rect x="25" y="80" width="200" height="6" rx="3" fill="hsl(195,50%,50%)" stroke="hsl(195,50%,35%)" strokeWidth="1" />
      {/* Distance markers */}
      {[50, 75, 100, 150, 175, 200].map(x => (
        <React.Fragment key={x}>
          <line x1={x} y1="80" x2={x} y2="76" stroke="hsl(220,15%,40%)" strokeWidth="1" />
          <text x={x} y="74" fontSize="5" fill="hsl(var(--muted-foreground))" textAnchor="middle">{Math.abs(x - 125)}cm</text>
        </React.Fragment>
      ))}
    </g>
    {/* Force arrow at weight position */}
    <g style={{ transform: `translateX(${(weightPos / 100) * 200 + 25}px)` }}>
      <line x1="0" y1="60" x2="0" y2="75" stroke="hsl(0,70%,55%)" strokeWidth="2" markerEnd="url(#arrowRed)" />
      <text x="0" y="55" fontSize="6" fill="hsl(0,70%,55%)" textAnchor="middle" fontWeight="bold">F↓</text>
    </g>
    <defs>
      <marker id="arrowRed" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="hsl(0,70%,55%)" />
      </marker>
    </defs>
  </svg>
));

// Motor/Solar with sun rays and wire connections
export const SolarMotorDiagram: React.FC<{ charged: number; spinning: boolean }> = React.memo(({ charged, spinning }) => (
  <svg viewBox="0 0 250 100" className="w-full mb-2">
    {/* Sun with rays */}
    <circle cx="40" cy="35" r="16" fill="hsl(48,95%,60%)" />
    {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
      const rad = (angle * Math.PI) / 180;
      return (
        <line key={angle}
          x1={40 + Math.cos(rad) * 20} y1={35 + Math.sin(rad) * 20}
          x2={40 + Math.cos(rad) * 28} y2={35 + Math.sin(rad) * 28}
          stroke="hsl(48,95%,60%)" strokeWidth="2" strokeLinecap="round"
          opacity={charged > 30 ? 1 : 0.3} />
      );
    })}
    {/* Solar panel */}
    <rect x="80" y="20" width="40" height="30" rx="2" fill="hsl(220,50%,30%)" stroke="hsl(220,50%,20%)" strokeWidth="1" />
    {[0, 1, 2].map(i => (
      <React.Fragment key={i}>
        <line x1={92 + i * 12} y1="20" x2={92 + i * 12} y2="50" stroke="hsl(195,60%,40%)" strokeWidth="0.5" />
      </React.Fragment>
    ))}
    <line x1="80" y1="35" x2="120" y2="35" stroke="hsl(195,60%,40%)" strokeWidth="0.5" />
    {/* Wire from panel to battery */}
    <path d="M120,35 Q135,35 135,50 Q135,65 150,65" fill="none" stroke="hsl(0,60%,50%)" strokeWidth="1.5" strokeDasharray={charged > 0 ? '4,2' : 'none'} />
    {/* Battery */}
    <rect x="150" y="50" width="25" height="30" rx="3" fill="hsl(220,15%,85%)" stroke="hsl(220,15%,50%)" strokeWidth="1.5" />
    <rect x="155" y="55" width="15" height={`${charged * 0.2}px`} fill="hsl(142,60%,50%)" style={{ transition: 'height 0.3s' }} />
    {/* Wire from battery to motor */}
    <path d="M175,65 Q190,65 190,50 Q190,35 205,35" fill="none" stroke="hsl(0,60%,50%)" strokeWidth="1.5" strokeDasharray={charged >= 100 ? '4,2' : 'none'} />
    {/* Motor */}
    <circle cx="220" cy="35" r="15" fill="hsl(220,15%,55%)" stroke="hsl(220,15%,40%)" strokeWidth="1.5" />
    <circle cx="220" cy="35" r="6" fill="hsl(195,60%,55%)" className={spinning ? 'animate-spin' : ''} style={{ transformOrigin: '220px 35px' }} />
    {/* Labels */}
    <text x="40" y="65" fontSize="6" textAnchor="middle" fill="hsl(var(--muted-foreground))">太阳</text>
    <text x="100" y="60" fontSize="6" textAnchor="middle" fill="hsl(var(--muted-foreground))">太阳能板</text>
    <text x="162" y="88" fontSize="6" textAnchor="middle" fill="hsl(var(--muted-foreground))">电池</text>
    <text x="220" y="60" fontSize="6" textAnchor="middle" fill="hsl(var(--muted-foreground))">电机</text>
  </svg>
));

// Sensor with car approaching and infrared beam
export const SensorDiagram: React.FC<{ blocking: boolean; barrierUp: boolean }> = React.memo(({ blocking, barrierUp }) => (
  <svg viewBox="0 0 220 140" className="w-full h-full">
    {/* Road */}
    <rect x="0" y="100" width="220" height="40" fill="hsl(220,10%,40%)" />
    <line x1="0" y1="120" x2="220" y2="120" stroke="hsl(48,80%,60%)" strokeWidth="1.5" strokeDasharray="8,6" />
    {/* Barrier pillar */}
    <rect x="25" y="50" width="20" height="50" rx="3" fill="hsl(220,15%,45%)" />
    {/* Barrier arm */}
    <g style={{ transformOrigin: '35px 52px', transition: 'transform 0.7s', transform: barrierUp ? 'rotate(-85deg)' : 'rotate(0deg)' }}>
      <rect x="35" y="48" width="90" height="7" rx="3" fill="hsl(0,65%,55%)" />
      {[50, 65, 80, 95, 110].map(x => <rect key={x} x={x} y="48" width="4" height="7" fill="white" opacity="0.5" />)}
    </g>
    {/* Infrared sensor emitters */}
    <circle cx="18" cy="95" r="4" fill="hsl(270,50%,55%)" stroke="hsl(270,50%,40%)" strokeWidth="1" />
    <circle cx="200" cy="95" r="4" fill="hsl(270,50%,55%)" stroke="hsl(270,50%,40%)" strokeWidth="1" />
    {/* Infrared beam */}
    <line x1="22" y1="95" x2="196" y2="95"
      stroke={blocking ? 'hsl(0,80%,55%)' : 'hsl(0,60%,55%)'}
      strokeWidth={blocking ? '2.5' : '1.5'}
      strokeDasharray={blocking ? 'none' : '5,5'}
      opacity={blocking ? 1 : 0.4} />
    {/* Car approaching */}
    {blocking && (
      <g className="animate-pop-in">
        <rect x="90" y="80" width="35" height="18" rx="5" fill="hsl(220,60%,55%)" />
        <rect x="95" y="75" width="20" height="10" rx="3" fill="hsl(195,60%,70%)" />
        <circle cx="97" cy="98" r="4" fill="hsl(220,10%,30%)" />
        <circle cx="118" cy="98" r="4" fill="hsl(220,10%,30%)" />
      </g>
    )}
    {/* Labels */}
    <text x="18" y="112" fontSize="7" textAnchor="middle" fill="hsl(var(--muted-foreground))">👁️发射</text>
    <text x="200" y="112" fontSize="7" textAnchor="middle" fill="hsl(var(--muted-foreground))">👁️接收</text>
    <text x="110" y="90" fontSize="6" textAnchor="middle" fill={blocking ? 'hsl(0,80%,55%)' : 'hsl(var(--muted-foreground))'} fontWeight="bold">
      {blocking ? '⚠️ 光线被挡' : '红外光线'}
    </text>
  </svg>
));

AnatomyDiagram.displayName = 'AnatomyDiagram';
LeverDiagram.displayName = 'LeverDiagram';
SolarMotorDiagram.displayName = 'SolarMotorDiagram';
SensorDiagram.displayName = 'SensorDiagram';
