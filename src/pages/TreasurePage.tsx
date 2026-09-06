import React, { useState, useCallback } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playStarCollect, playError, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';
import { ParkingTreasureScene, MallBasementScene, SchoolGateScene, ParkEntranceScene, HighwayTollScene } from '@/components/scenes/TreasureScenes';

// ===================== LEVEL DATA =====================

interface HiddenPart {
  id: string;
  emoji: string;
  name: string;
  x: number;
  y: number;
  found: boolean;
}

interface AssemblySlot {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface TreasureLevel {
  id: number;
  scene: string;
  sceneEmoji: string;
  parts: Omit<HiddenPart, 'found'>[];
  bgClass: string;
  assemblySlots: AssemblySlot[];
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
    assemblySlots: [
      { id: 'bolt1', label: '固定底座', x: 20, y: 80 },
      { id: 'gear1', label: '电机里面', x: 50, y: 50 },
      { id: 'spring1', label: '杆臂连接', x: 80, y: 30 },
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
    assemblySlots: [
      { id: 'motor1', label: '连接电机', x: 30, y: 60 },
      { id: 'panel1', label: '底座内部', x: 50, y: 80 },
      { id: 'led1', label: '杆臂顶端', x: 75, y: 25 },
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
    assemblySlots: [
      { id: 'arm1', label: '电机上方', x: 65, y: 25 },
      { id: 'sensor1', label: '底座前方', x: 25, y: 75 },
      { id: 'battery1', label: '底座内部', x: 45, y: 65 },
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
    assemblySlots: [
      { id: 'solar1', label: '顶部', x: 50, y: 15 },
      { id: 'hinge1', label: '杆臂连接处', x: 55, y: 45 },
      { id: 'paint1', label: '外壳涂装', x: 35, y: 70 },
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
    assemblySlots: [
      { id: 'cam1', label: '柱子顶部', x: 30, y: 15 },
      { id: 'chip1', label: '控制板上', x: 50, y: 60 },
      { id: 'sign1', label: '杆臂中间', x: 70, y: 30 },
      { id: 'wire1', label: '连接各处', x: 40, y: 80 },
    ],
  },
];

const SCENE_COMPONENTS: Record<number, React.FC> = {
  1: ParkingTreasureScene,
  2: MallBasementScene,
  3: SchoolGateScene,
  4: ParkEntranceScene,
  5: HighwayTollScene,
};

// ===================== ASSEMBLY MINI-GAME =====================

const AssemblyGame: React.FC<{
  level: TreasureLevel;
  onComplete: () => void;
}> = ({ level, onComplete }) => {
  const partsList = level.parts;
  const slots = level.assemblySlots;
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, boolean>>({});
  const [wrongSlot, setWrongSlot] = useState<string | null>(null);

  const placedCount = Object.keys(placed).length;
  const allPlaced = placedCount === partsList.length;

  const handleSelectPart = (partId: string) => {
    if (placed[partId]) return;
    playClick();
    vibrate(20);
    setSelectedPart(partId);
  };

  const handleDropOnSlot = (slotId: string) => {
    if (!selectedPart) {
      speak('先选一个零件！');
      return;
    }
    playClick();

    if (selectedPart === slotId) {
      // Correct placement
      playSuccess();
      vibrate(80);
      setPlaced(prev => ({ ...prev, [selectedPart]: true }));
      const part = partsList.find(p => p.id === selectedPart);
      speak(`${part?.name}放对了！`);
      setSelectedPart(null);

      if (placedCount + 1 === partsList.length) {
        setTimeout(() => {
          playSuccess();
          speak('太棒了！道闸组装完成！你是小小工程师！');
          onComplete();
        }, 1000);
      }
    } else {
      // Wrong placement
      playError();
      vibrate(50);
      setWrongSlot(slotId);
      speak('这个位置不对，再想想！');
      setTimeout(() => setWrongSlot(null), 800);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm font-bold text-foreground">🔧 把零件装到正确的位置！({placedCount}/{partsList.length})</p>

      {/* Assembly diagram */}
      <div className={`relative w-full h-48 rounded-2xl bg-gradient-to-br ${level.bgClass} overflow-hidden border-2 border-border`}>
        {/* Simple barrier outline */}
        <div className="absolute left-[35%] bottom-[15%] w-8 h-20 bg-foreground/20 rounded-t-lg" />
        <div className="absolute left-[43%] bottom-[55%] w-[45%] h-3 bg-foreground/15 rounded-full" />

        {/* Assembly slots */}
        {slots.map(slot => {
          const isPlaced = placed[slot.id];
          const isWrong = wrongSlot === slot.id;
          const part = partsList.find(p => p.id === slot.id);
          return (
            <button key={slot.id}
              onClick={() => handleDropOnSlot(slot.id)}
              disabled={isPlaced}
              className={`absolute w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all text-xs font-bold ${
                isPlaced ? 'bg-accent/40 scale-110 animate-pop-in' :
                isWrong ? 'bg-destructive/30 ring-2 ring-destructive animate-shake' :
                selectedPart ? 'bg-card/80 hover:bg-primary/20 ring-2 ring-dashed ring-primary/40 cursor-pointer' :
                'bg-card/60 border border-dashed border-muted-foreground/30'
              }`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}>
              {isPlaced ? <span className="text-lg">{part?.emoji}</span> : <span className="text-muted-foreground">{slot.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Parts tray */}
      <div className="flex gap-3 flex-wrap justify-center">
        {partsList.map(part => (
          <button key={part.id}
            onClick={() => handleSelectPart(part.id)}
            disabled={placed[part.id]}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              placed[part.id] ? 'bg-accent/20 text-muted-foreground line-through' :
              selectedPart === part.id ? 'bg-primary/20 ring-2 ring-primary scale-105' :
              'bg-card border border-border hover:border-primary/30'
            }`}>
            {part.emoji} {part.name}
          </button>
        ))}
      </div>

      {selectedPart && !allPlaced && (
        <p className="text-xs text-muted-foreground animate-pop-in">
          👆 已选择 {partsList.find(p => p.id === selectedPart)?.emoji}，点击图上正确位置放置！
        </p>
      )}

      {allPlaced && (
        <div className="text-center animate-pop-in">
          <p className="text-xl font-bold text-foreground">🎉 组装完成！</p>
        </div>
      )}
    </div>
  );
};

// ===================== SCENE COMPONENT =====================

const TreasureScene: React.FC<{ level: TreasureLevel; onComplete: () => void }> = ({ level, onComplete }) => {
  const [parts, setParts] = useState<HiddenPart[]>(level.parts.map(p => ({ ...p, found: false })));
  const [lastFound, setLastFound] = useState<string | null>(null);
  const [phase, setPhase] = useState<'find' | 'assemble'>('find');
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
        speak('零件全部找到！现在来组装道闸吧！');
        setPhase('assemble');
      }, 1000);
    }
  };

  if (phase === 'assemble') {
    return <AssemblyGame level={level} onComplete={onComplete} />;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-bold text-foreground">{level.sceneEmoji} {level.scene} — 找到 {found}/{total} 个零件</p>

      <div className={`relative w-full h-64 rounded-3xl overflow-hidden border-2 border-border`}>
        {/* SVG Scene Background */}
        {(() => {
          const SceneComp = SCENE_COMPONENTS[level.id];
          return SceneComp ? <SceneComp /> : null;
        })()}

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
  const { addStars, addBadge, addKnowledge, completeStation, currentProfile } = useGame();
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  const maxLevels = currentProfile?.ageBand === 'sprout' ? 2 : currentProfile?.ageBand === 'builder' ? 5 : 4;
  const visibleLevels = LEVELS.filter(l => l.id <= maxLevels);

  const handleComplete = useCallback((levelId: number) => {
    setCompleted(prev => { const n = new Set(prev); n.add(levelId); return n; });
    addStars(4);
    addKnowledge('observe-find');
    if (completed.size + 1 >= maxLevels) {
      addBadge('observer');
      completeStation('observe');
      speak('你的眼睛越来越亮啦');
    }
    setTimeout(() => setActiveLevel(null), 2000);
  }, [addStars, addBadge, addKnowledge, completeStation, completed.size, maxLevels]);

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-orange-warm/15 via-background to-golden/10 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {activeLevel === null ? (
            <>
              <div className="text-center mb-6">
                <XiaoZhaZha mood="excited" size={80} />
                <h1 className="text-3xl font-black text-foreground mt-2">观察花园</h1>
                <p className="text-muted-foreground">先找到，再放到对的位置。</p>
                <p className="text-sm text-muted-foreground/70">已完成 {completed.size}/{maxLevels}</p>
              </div>
              <div className="grid gap-3">
                {visibleLevels.map(level => (
                  <button key={level.id}
                    onClick={() => { playClick(); setActiveLevel(level.id); }}
                    className={`flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-[0.97] ${
                      completed.has(level.id) ? 'bg-accent/20 border-2 border-accent' : 'bg-card border-2 border-border hover:border-primary/30'
                    }`}>
                    <span className="text-4xl">{level.sceneEmoji}</span>
                    <div className="text-left flex-1">
                      <p className="font-bold text-foreground">第{level.id}关：{level.scene}</p>
                      <p className="text-sm text-muted-foreground">找到 {level.parts.length} 个零件 + 组装道闸</p>
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
