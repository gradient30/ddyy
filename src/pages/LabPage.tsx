import React, { useState, useCallback } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playBarrierLift, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

// ===================== EXPERIMENT DATA =====================

interface Experiment {
  id: number;
  title: string;
  emoji: string;
  desc: string;
}

const EXPERIMENTS: Experiment[] = [
  { id: 1, title: '道闸长啥样？', emoji: '🔍', desc: '点击各部位，认识道闸的身体' },
  { id: 2, title: '杠杆魔法', emoji: '⚖️', desc: '拖动重物，学习省力原理' },
  { id: 3, title: '电机与太阳能', emoji: '⚡', desc: '让电机转起来，太阳能充电' },
  { id: 4, title: '传感器安全', emoji: '👁️', desc: '红外线就像小眼睛' },
];

// ===================== EXP 1: ANATOMY =====================

const Exp1Anatomy: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [explored, setExplored] = useState<Set<string>>(new Set());

  const parts = [
    { id: 'arm', label: '杆臂', labelEn: 'Arm (Lever)', x: 55, y: 15, desc: '杠杆手臂，用来挡住车辆', emoji: '💪' },
    { id: 'motor', label: '电机', labelEn: 'Motor', x: 35, y: 55, desc: '轮轴心脏，让杆臂上下运动', emoji: '⚙️' },
    { id: 'sensor', label: '传感器', labelEn: 'Sensor', x: 25, y: 75, desc: '小眼睛，感应有没有车', emoji: '👁️' },
    { id: 'base', label: '底座', labelEn: 'Base', x: 40, y: 90, desc: '稳稳站住的大脚', emoji: '🧱' },
    { id: 'light', label: '信号灯', labelEn: 'Signal Light', x: 60, y: 45, desc: '告诉大家可不可以走', emoji: '🚦' },
  ];

  const handleClick = (part: typeof parts[0]) => {
    playClick();
    vibrate(30);
    setSelected(part.id);
    setExplored(prev => {
      const next = new Set(prev);
      next.add(part.id);
      if (next.size === parts.length) {
        setTimeout(() => {
          playSuccess();
          speak('太棒了！你认识了道闸的所有部位！');
          onComplete();
        }, 1500);
      }
      return next;
    });
    speak(`这是${part.label}，${part.desc}`);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">点击道闸的每个部位 ({explored.size}/{parts.length})</p>
      
      {/* SVG Barrier Diagram */}
      <div className="relative w-64 h-56">
        <svg viewBox="0 0 200 180" className="w-full h-full">
          {/* Base */}
          <rect x="60" y="140" width="40" height="30" rx="5" fill="hsl(var(--foreground) / 0.3)" />
          {/* Pillar */}
          <rect x="72" y="60" width="16" height="85" rx="3" fill="hsl(var(--foreground) / 0.4)" />
          {/* Motor housing */}
          <rect x="65" y="80" width="30" height="25" rx="5" fill="hsl(var(--primary) / 0.6)" />
          {/* Arm */}
          <rect x="88" y="62" width="90" height="8" rx="4" fill="hsl(var(--coral-red))" />
          <circle cx="92" cy="66" r="5" fill="hsl(var(--secondary))" />
          {/* Signal light */}
          <circle cx="80" cy="55" r="6" fill="hsl(var(--grass-green))" />
          {/* Sensor */}
          <circle cx="55" cy="130" r="5" fill="hsl(var(--purple-fun))" />
        </svg>

        {/* Clickable hotspots */}
        {parts.map(part => (
          <button key={part.id}
            onClick={() => handleClick(part)}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all text-lg ${
              selected === part.id ? 'bg-primary/30 ring-2 ring-primary scale-125 animate-glow-pulse' :
              explored.has(part.id) ? 'bg-accent/30' : 'bg-card/80 hover:bg-primary/20'
            }`}
            style={{ left: `${part.x}%`, top: `${part.y}%`, transform: 'translate(-50%, -50%)' }}>
            {part.emoji}
          </button>
        ))}
      </div>

      {selected && (
        <div className="bg-primary/10 rounded-2xl p-3 text-center animate-pop-in max-w-xs">
          <p className="font-bold text-foreground">{parts.find(p => p.id === selected)?.label} {parts.find(p => p.id === selected)?.emoji}</p>
          <p className="text-sm text-muted-foreground">{parts.find(p => p.id === selected)?.desc}</p>
          <p className="text-xs text-muted-foreground/60">{parts.find(p => p.id === selected)?.labelEn}</p>
        </div>
      )}
    </div>
  );
};

// ===================== EXP 2: LEVER =====================

const Exp2Lever: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [weightPos, setWeightPos] = useState(30);
  const [done, setDone] = useState(false);

  const tilt = (weightPos - 50) * 0.4; // degrees
  const effortNeeded = Math.max(10, 100 - weightPos);

  const handleDrag = (clientX: number, rect: DOMRect) => {
    if (done) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(10, Math.min(90, x));
    setWeightPos(clamped);
    
    if (clamped > 70 && !done) {
      setDone(true);
      playSuccess();
      vibrate(100);
      speak('发现了！重物离支点越远，越省力！这就是杠杆原理！');
      setTimeout(onComplete, 2500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">拖动重物到杠杆右边，看看会怎样？</p>

      <div className="relative w-full max-w-xs h-32"
        onTouchMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          handleDrag(e.touches[0].clientX, rect);
        }}
        onMouseMove={(e) => {
          if (e.buttons) handleDrag(e.clientX, e.currentTarget.getBoundingClientRect());
        }}>
        {/* Fulcrum */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[20px] border-transparent border-b-foreground/40" />
        {/* Beam */}
        <div className="absolute bottom-[22px] left-[10%] right-[10%] h-3 bg-primary/50 rounded-full origin-center transition-transform duration-300"
          style={{ transform: `rotate(${tilt}deg)` }} />
        {/* Weight */}
        <div className="absolute bottom-8 text-3xl cursor-grab active:cursor-grabbing select-none transition-all duration-100"
          style={{ left: `${weightPos}%`, transform: 'translateX(-50%)' }}>
          🏋️
        </div>
        {/* Effort indicator */}
        <div className="absolute top-2 right-2 text-xs font-bold text-muted-foreground">
          用力: {Math.round(effortNeeded)}%
        </div>
      </div>

      <div className="bg-secondary/20 rounded-2xl p-3 text-center max-w-xs">
        <p className="text-sm font-bold text-foreground">💡 杠杆原理 Lever</p>
        <p className="text-xs text-muted-foreground">
          {done ? '重物离支点越远，抬起来越省力！道闸的杆臂就是杠杆！' : '试试把重物拖到更远的地方...'}
        </p>
      </div>
    </div>
  );
};

// ===================== EXP 3: MOTOR & SOLAR =====================

const Exp3MotorSolar: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [spinning, setSpinning] = useState(false);
  const [charged, setCharged] = useState(0);
  const [done, setDone] = useState(false);

  const handleSunClick = () => {
    if (done) return;
    playClick();
    vibrate(30);
    setCharged(prev => {
      const next = Math.min(prev + 15, 100);
      if (next >= 100 && !done) {
        setDone(true);
        setSpinning(true);
        playSuccess();
        playBarrierLift();
        speak('充满了！太阳能给电机充电，电机转起来，道闸升起来！');
        setTimeout(onComplete, 3000);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">点击太阳给电池充电！☀️</p>

      <div className="flex items-end gap-6">
        {/* Sun */}
        <button onClick={handleSunClick} disabled={done}
          className="text-5xl active:scale-110 transition-transform animate-float">
          ☀️
        </button>

        {/* Battery */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-12 h-20 border-3 border-foreground/30 rounded-lg overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 bg-accent transition-all duration-300 rounded-b"
              style={{ height: `${charged}%` }} />
            <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-foreground">
              {charged}%
            </div>
          </div>
          <span className="text-xs text-muted-foreground">🔋电池</span>
        </div>

        {/* Motor */}
        <div className="flex flex-col items-center gap-1">
          <div className={`text-4xl ${spinning ? 'animate-spin' : ''}`} style={{ animationDuration: '0.5s' }}>⚙️</div>
          <span className="text-xs text-muted-foreground">电机 Motor</span>
        </div>
      </div>

      <div className="w-full max-w-xs h-3 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-accent transition-all duration-300 rounded-full" style={{ width: `${charged}%` }} />
      </div>

      {done && (
        <div className="bg-accent/20 rounded-2xl p-3 text-center animate-pop-in">
          <p className="font-bold text-foreground">⚡ 太阳能 → 电能 → 运动！</p>
          <p className="text-xs text-muted-foreground">Solar energy powers the motor!</p>
        </div>
      )}
    </div>
  );
};

// ===================== EXP 4: SENSOR =====================

const Exp4Sensor: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [blocking, setBlocking] = useState(false);
  const [barrierUp, setBarrierUp] = useState(true);
  const [trialCount, setTrialCount] = useState(0);
  const [done, setDone] = useState(false);

  const handleBlock = () => {
    if (done) return;
    playClick();
    setBlocking(true);
    setBarrierUp(false);
    vibrate(50);
    speak('有东西挡住了！道闸停下来，保护安全！');
  };

  const handleRelease = () => {
    if (done) return;
    playClick();
    setBlocking(false);
    setBarrierUp(true);
    playBarrierLift();
    setTrialCount(prev => {
      const next = prev + 1;
      if (next >= 2 && !done) {
        setDone(true);
        playSuccess();
        speak('太棒了！传感器就像道闸的小眼睛，发现障碍物就会停下来！');
        setTimeout(onComplete, 2500);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">试试挡住红外线，看道闸会怎样？</p>

      <div className="relative w-64 h-40">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          {/* Barrier base & pillar */}
          <rect x="20" y="70" width="30" height="40" rx="5" fill="hsl(var(--foreground) / 0.3)" />
          <rect x="30" y="30" width="10" height="45" rx="3" fill="hsl(var(--foreground) / 0.4)" />
          {/* Arm */}
          <g style={{ transformOrigin: '40px 35px', transition: 'transform 0.7s', transform: barrierUp ? 'rotate(-85deg)' : 'rotate(0deg)' }}>
            <rect x="40" y="31" width="80" height="6" rx="3" fill="hsl(var(--coral-red))" />
          </g>
          {/* Sensor beam */}
          <line x1="15" y1="95" x2="185" y2="95"
            stroke={blocking ? 'hsl(var(--destructive))' : 'hsl(var(--destructive) / 0.3)'}
            strokeWidth="2" strokeDasharray={blocking ? 'none' : '5,5'} />
          {/* Sensor dots */}
          <circle cx="15" cy="95" r="4" fill="hsl(var(--purple-fun))" />
          <circle cx="185" cy="95" r="4" fill="hsl(var(--purple-fun))" />
          {/* Labels */}
          <text x="15" y="115" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle">👁️</text>
          <text x="185" y="115" fontSize="8" fill="hsl(var(--muted-foreground))" textAnchor="middle">👁️</text>
        </svg>
      </div>

      <div className="flex gap-3">
        <button onClick={handleBlock} disabled={blocking || done}
          className={`touch-target rounded-2xl font-bold text-lg px-5 py-3 active:scale-95 transition-all ${
            blocking ? 'bg-destructive/30 text-destructive-foreground' : 'bg-destructive/15 hover:bg-destructive/25 text-foreground'
          }`}>
          🖐️ 挡住
        </button>
        <button onClick={handleRelease} disabled={!blocking || done}
          className="touch-target rounded-2xl bg-accent/15 hover:bg-accent/25 font-bold text-lg px-5 py-3 active:scale-95 transition-all text-foreground">
          👋 放开
        </button>
      </div>

      {done && (
        <div className="bg-purple-fun/20 rounded-2xl p-3 text-center animate-pop-in">
          <p className="font-bold text-foreground">👁️ 传感器 = 道闸的小眼睛</p>
          <p className="text-xs text-muted-foreground">Sensor detects obstacles for safety!</p>
        </div>
      )}
    </div>
  );
};

// ===================== MAIN LAB PAGE =====================

const LabPage: React.FC = () => {
  const { addStars, addBadge } = useGame();
  const [currentExp, setCurrentExp] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const handleComplete = useCallback((expId: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(expId);
      addStars(2);
      if (next.size === 4) {
        addBadge('小小科学家');
        speak('恭喜！获得小小科学家徽章！');
      }
      return next;
    });
    setTimeout(() => setCurrentExp(0), 2500);
  }, [addStars, addBadge]);

  const renderExp = () => {
    switch (currentExp) {
      case 1: return <Exp1Anatomy onComplete={() => handleComplete(1)} />;
      case 2: return <Exp2Lever onComplete={() => handleComplete(2)} />;
      case 3: return <Exp3MotorSolar onComplete={() => handleComplete(3)} />;
      case 4: return <Exp4Sensor onComplete={() => handleComplete(4)} />;
      default: return null;
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-purple-fun/15 via-background to-primary/10 pt-20 pb-8 px-4">
        {currentExp === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <XiaoZhaZha mood="thinking" size={80} />
              <h1 className="text-3xl font-black text-foreground mt-2">🔬 探秘实验室</h1>
              <p className="text-muted-foreground">4个实验，探索道闸的秘密！</p>
              <p className="text-sm text-muted-foreground/70 mt-1">已完成 {completed.size}/4</p>
            </div>
            <div className="grid gap-3">
              {EXPERIMENTS.map(exp => (
                <button key={exp.id}
                  onClick={() => { playClick(); setCurrentExp(exp.id); }}
                  className={`flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-[0.97] ${
                    completed.has(exp.id) ? 'bg-accent/20 border-2 border-accent' : 'bg-card border-2 border-border hover:border-primary/30'
                  }`}>
                  <span className="text-4xl">{exp.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-foreground">{exp.title}</p>
                    <p className="text-sm text-muted-foreground">{exp.desc}</p>
                  </div>
                  <span className="text-lg">{completed.has(exp.id) ? '⭐' : '🔬'}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <button onClick={() => { playClick(); setCurrentExp(0); }}
              className="touch-target rounded-2xl bg-card hover:bg-muted px-4 py-2 font-bold text-foreground mb-4 active:scale-95 transition-all">
              ← 返回实验
            </button>
            <div className="bg-card rounded-3xl shadow-lg p-5">
              <h2 className="text-xl font-black text-center text-foreground mb-1">
                {EXPERIMENTS[currentExp - 1].emoji} {EXPERIMENTS[currentExp - 1].title}
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-4">{EXPERIMENTS[currentExp - 1].desc}</p>
              {renderExp()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default LabPage;
