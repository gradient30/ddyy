import React, { useState, useCallback } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playStarCollect, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

// ===================== LEVEL DATA =====================

interface HiddenPart {
  id: string;
  emoji: string;
  name: string;
  x: number; // percentage
  y: number;
  found: boolean;
}

interface TreasureLevel {
  id: number;
  scene: string;
  sceneEmoji: string;
  parts: Omit<HiddenPart, 'found'>[];
  bgClass: string;
}

const LEVELS: TreasureLevel[] = [
  {
    id: 1, scene: '小区停车场', sceneEmoji: '🏘️',
    bgClass: 'from-primary/10 to-accent/10',
    parts: [
      { id: 'bolt1', emoji: '🔩', name: '螺栓', x: 15, y: 30 },
      { id: 'gear1', emoji: '⚙️', name: '齿轮', x: 75, y: 60 },
      { id: 'spring1', emoji: '🌀', name: '弹簧', x: 45, y: 80 },
    ],
  },
  {
    id: 2, scene: '商场地下室', sceneEmoji: '🏬',
    bgClass: 'from-purple-fun/10 to-primary/10',
    parts: [
      { id: 'motor1', emoji: '🔌', name: '电线', x: 80, y: 25 },
      { id: 'panel1', emoji: '🎛️', name: '控制板', x: 20, y: 70 },
      { id: 'led1', emoji: '💡', name: 'LED灯', x: 55, y: 40 },
    ],
  },
  {
    id: 3, scene: '学校门口', sceneEmoji: '🏫',
    bgClass: 'from-golden/10 to-grass/10',
    parts: [
      { id: 'arm1', emoji: '📏', name: '杆臂', x: 30, y: 20 },
      { id: 'sensor1', emoji: '📡', name: '感应器', x: 70, y: 75 },
      { id: 'battery1', emoji: '🔋', name: '电池', x: 10, y: 55 },
    ],
  },
  {
    id: 4, scene: '公园入口', sceneEmoji: '🌳',
    bgClass: 'from-grass/10 to-golden/10',
    parts: [
      { id: 'solar1', emoji: '☀️', name: '太阳能板', x: 85, y: 15 },
      { id: 'hinge1', emoji: '🔗', name: '铰链', x: 40, y: 65 },
      { id: 'paint1', emoji: '🎨', name: '油漆桶', x: 60, y: 85 },
    ],
  },
  {
    id: 5, scene: '高速收费站', sceneEmoji: '🛣️',
    bgClass: 'from-coral/10 to-primary/10',
    parts: [
      { id: 'cam1', emoji: '📷', name: '摄像头', x: 25, y: 15 },
      { id: 'chip1', emoji: '🪫', name: '芯片', x: 65, y: 50 },
      { id: 'sign1', emoji: '🪧', name: '标志牌', x: 45, y: 30 },
      { id: 'wire1', emoji: '🧵', name: '线缆', x: 80, y: 80 },
    ],
  },
];

// Scene decorations
const SCENE_ITEMS: Record<number, { emoji: string; x: number; y: number; size: string }[]> = {
  1: [
    { emoji: '🚗', x: 20, y: 50, size: 'text-3xl' }, { emoji: '🚙', x: 60, y: 45, size: 'text-2xl' },
    { emoji: '🏠', x: 10, y: 10, size: 'text-2xl' }, { emoji: '🌳', x: 90, y: 15, size: 'text-3xl' },
    { emoji: '🚧', x: 50, y: 55, size: 'text-3xl' },
  ],
  2: [
    { emoji: '🚘', x: 30, y: 40, size: 'text-3xl' }, { emoji: '🅿️', x: 85, y: 50, size: 'text-2xl' },
    { emoji: '💡', x: 50, y: 10, size: 'text-xl' }, { emoji: '🚧', x: 45, y: 60, size: 'text-3xl' },
  ],
  3: [
    { emoji: '🏫', x: 50, y: 8, size: 'text-4xl' }, { emoji: '🚸', x: 15, y: 45, size: 'text-2xl' },
    { emoji: '🚧', x: 55, y: 50, size: 'text-3xl' }, { emoji: '🌺', x: 85, y: 40, size: 'text-xl' },
  ],
  4: [
    { emoji: '🌳', x: 15, y: 15, size: 'text-4xl' }, { emoji: '🌸', x: 75, y: 30, size: 'text-xl' },
    { emoji: '🚧', x: 50, y: 45, size: 'text-3xl' }, { emoji: '🦆', x: 30, y: 80, size: 'text-2xl' },
  ],
  5: [
    { emoji: '🛣️', x: 50, y: 90, size: 'text-2xl' }, { emoji: '🚧', x: 40, y: 40, size: 'text-4xl' },
    { emoji: '🚛', x: 15, y: 65, size: 'text-3xl' }, { emoji: '🏗️', x: 80, y: 20, size: 'text-2xl' },
  ],
};

// ===================== SCENE COMPONENT =====================

const TreasureScene: React.FC<{ level: TreasureLevel; onComplete: () => void }> = ({ level, onComplete }) => {
  const [parts, setParts] = useState<HiddenPart[]>(level.parts.map(p => ({ ...p, found: false })));
  const [lastFound, setLastFound] = useState<string | null>(null);
  const total = parts.length;
  const found = parts.filter(p => p.found).length;

  const handleFind = (id: string) => {
    const part = parts.find(p => p.id === id);
    if (!part || part.found) return;
    playStarCollect();
    vibrate(80);
    setLastFound(part.name);
    setParts(prev => prev.map(p => p.id === id ? { ...p, found: true } : p));
    speak(`找到了${part.name}！`);

    if (found + 1 === total) {
      setTimeout(() => {
        playSuccess();
        speak('太棒了！零件全部找到，可以拼道闸了！');
        onComplete();
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-bold text-foreground">{level.sceneEmoji} {level.scene} — 找到 {found}/{total} 个零件</p>

      <div className={`relative w-full h-64 rounded-3xl bg-gradient-to-br ${level.bgClass} overflow-hidden border-2 border-border`}>
        {/* Scene decorations */}
        {(SCENE_ITEMS[level.id] || []).map((item, i) => (
          <div key={i} className={`absolute ${item.size} opacity-60 select-none`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}>
            {item.emoji}
          </div>
        ))}

        {/* Hidden parts */}
        {parts.map(part => (
          <button key={part.id}
            onClick={() => handleFind(part.id)}
            disabled={part.found}
            className={`absolute w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              part.found
                ? 'bg-accent/40 scale-110 animate-pop-in'
                : 'bg-card/30 hover:bg-card/60 active:scale-125 animate-float'
            }`}
            style={{
              left: `${part.x}%`, top: `${part.y}%`, transform: 'translate(-50%, -50%)',
              animationDelay: `${Math.random() * 2}s`,
            }}>
            <span className={`text-lg ${part.found ? '' : 'opacity-40 hover:opacity-100'}`}>{part.emoji}</span>
          </button>
        ))}
      </div>

      {/* Found parts tray */}
      <div className="flex gap-2 flex-wrap justify-center">
        {parts.map(part => (
          <div key={part.id} className={`px-3 py-1 rounded-xl text-sm font-bold ${
            part.found ? 'bg-accent/20 text-foreground' : 'bg-muted text-muted-foreground/40'
          }`}>
            {part.found ? part.emoji : '❓'} {part.name}
          </div>
        ))}
      </div>

      {lastFound && found < total && (
        <p className="text-sm animate-pop-in text-foreground">✨ 找到了 {lastFound}！继续找！</p>
      )}
    </div>
  );
};

// ===================== MAIN TREASURE PAGE =====================

const TreasurePage: React.FC = () => {
  const { addStars, addBadge } = useGame();
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const handleComplete = useCallback((levelId: number) => {
    setCompleted(prev => { const n = new Set(prev); n.add(levelId); return n; });
    addStars(3);
    if (completed.size + 1 === LEVELS.length) {
      addBadge('寻宝大师');
      speak('恭喜！获得寻宝大师徽章！');
    }
    setTimeout(() => setActiveLevel(null), 2000);
  }, [addStars, addBadge, completed.size]);

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-orange-warm/15 via-background to-golden/10 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {activeLevel === null ? (
            <>
              <div className="text-center mb-6">
                <XiaoZhaZha mood="excited" size={80} />
                <h1 className="text-3xl font-black text-foreground mt-2">🗺️ 寻宝乐园</h1>
                <p className="text-muted-foreground">找零件，拼道闸！</p>
                <p className="text-sm text-muted-foreground/70">已完成 {completed.size}/{LEVELS.length}</p>
              </div>
              <div className="grid gap-3">
                {LEVELS.map(level => (
                  <button key={level.id}
                    onClick={() => { playClick(); setActiveLevel(level.id); }}
                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-[0.97] ${
                      completed.has(level.id) ? 'bg-accent/20 border-2 border-accent' : 'bg-card border-2 border-border hover:border-primary/30'
                    }`}>
                    <span className="text-4xl">{level.sceneEmoji}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-foreground">第{level.id}关：{level.scene}</p>
                      <p className="text-sm text-muted-foreground">找到 {level.parts.length} 个隐藏零件</p>
                    </div>
                    <span className="text-lg">{completed.has(level.id) ? '⭐' : '🔍'}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { playClick(); setActiveLevel(null); }}
                className="touch-target rounded-2xl bg-card hover:bg-muted px-4 py-2 font-bold text-foreground mb-4 active:scale-95 transition-all">
                ← 返回关卡
              </button>
              <div className="bg-card rounded-3xl shadow-lg p-5">
                <TreasureScene
                  level={LEVELS.find(l => l.id === activeLevel)!}
                  onComplete={() => handleComplete(activeLevel)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default TreasurePage;
