import React, { useState, useCallback } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { PartIcon } from '@/components/parts/PartIcons';
import { PartTile } from '@/components/parts/PartTile';
import { useGame } from '@/contexts/GameContext';
import { MechanicalBarrier } from '@/components/parts/MechanicalBarrier';
import { playClick, playError, playPlacePart, playStarCollect, playSuccess, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';
import { ParkingTreasureScene, MallBasementScene, SchoolGateScene, ParkEntranceScene, HighwayTollScene } from '@/components/scenes/TreasureScenes';

// ===================== LEVEL DATA =====================

interface HiddenPart {
  id: string;
  icon: string;
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
      { id: 'bolt1', icon: 'bolt', emoji: '🔩', name: '螺栓', x: 15, y: 30 },
      { id: 'gear1', icon: 'gear', emoji: '⚙️', name: '齿轮', x: 75, y: 60 },
      { id: 'spring1', icon: 'spring', emoji: '🌀', name: '弹簧', x: 45, y: 80 },
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
      { id: 'motor1', icon: 'wire', emoji: '🔌', name: '电线', x: 80, y: 25 },
      { id: 'panel1', icon: 'board', emoji: '🎛️', name: '控制板', x: 20, y: 70 },
      { id: 'led1', icon: 'led', emoji: '💡', name: 'LED灯', x: 55, y: 40 },
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
      { id: 'arm1', icon: 'arm1', emoji: '📏', name: '杆臂', x: 30, y: 20 },
      { id: 'sensor1', icon: 'sensor1', emoji: '📡', name: '感应器', x: 70, y: 75 },
      { id: 'battery1', icon: 'battery', emoji: '🔋', name: '电池', x: 10, y: 55 },
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
      { id: 'solar1', icon: 'solar', emoji: '☀️', name: '太阳能板', x: 85, y: 15 },
      { id: 'hinge1', icon: 'hinge', emoji: '🔗', name: '铰链', x: 40, y: 65 },
      { id: 'paint1', icon: 'bucket', emoji: '🎨', name: '油漆桶', x: 60, y: 85 },
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
      { id: 'cam1', icon: 'cam', emoji: '📷', name: '摄像头', x: 25, y: 15 },
      { id: 'chip1', icon: 'chip', emoji: '🪫', name: '芯片', x: 65, y: 50 },
      { id: 'sign1', icon: 'sign', emoji: '🪧', name: '标志牌', x: 45, y: 30 },
      { id: 'wire1', icon: 'cable', emoji: '🧵', name: '线缆', x: 80, y: 80 },
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
      playPlacePart();
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

      <div className={`relative w-full min-h-[260px] h-[48dvh] rounded-2xl bg-[#5C646C] overflow-hidden border-2 border-border`}>
        <MechanicalBarrier
          slots={{ base: 'base1', pillar: 'pillar1', motor: 'motor1', arm: 'arm1' }}
          className="absolute inset-0 w-full h-full"
        />

        {slots.map(slot => {
          const isPlaced = placed[slot.id];
          const isWrong = wrongSlot === slot.id;
          const part = partsList.find(p => p.id === slot.id);
          return (
            <button key={slot.id}
              onClick={() => handleDropOnSlot(slot.id)}
              disabled={isPlaced}
              className={`absolute part-hotspot flex-col gap-0.5 px-1 transition-all text-[11px] font-extrabold ${
                isPlaced ? 'bg-accent/40 scale-110 animate-pop-in' :
                isWrong ? 'bg-destructive/30 ring-2 ring-destructive' :
                selectedPart ? 'bg-card/90 hover:bg-primary/20 ring-2 ring-dashed ring-primary/50 cursor-pointer' :
                'bg-card/80 border-2 border-dashed border-muted-foreground/40'
              }`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%, -50%)' }}>
              {isPlaced && part
                ? <PartIcon id={part.icon} size={40} />
                : <span className="text-muted-foreground text-center leading-tight px-1">{slot.label}</span>}
            </button>
          );
        })}
      </div>

      {/* Parts tray */}
      <div className="flex gap-3 flex-wrap justify-center">
        {partsList.map(part => (
          <PartTile
            key={part.id}
            id={part.icon}
            name={part.name}
            placed={placed[part.id]}
            selected={selectedPart === part.id}
            onClick={() => handleSelectPart(part.id)}
          />
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

      <div className={`relative w-full min-h-[240px] h-[42dvh] rounded-3xl overflow-hidden border-2 border-border`}>
        {/* SVG Scene Background */}
        {(() => {
          const SceneComp = SCENE_COMPONENTS[level.id];
          return SceneComp ? <SceneComp /> : null;
        })()}

        {parts.map(part => (
          <button key={part.id}
            onClick={() => handleFind(part.id)}
            disabled={part.found}
            className={`absolute part-hotspot rounded-2xl transition-all shadow-md ${
              part.found
                ? 'bg-accent/50 scale-110 animate-pop-in'
                : 'bg-card/85 hover:bg-card active:scale-110 animate-float ring-2 ring-primary/30'
            }`}
            style={{
              left: `${part.x}%`, top: `${part.y}%`, transform: 'translate(-50%, -50%)',
              animationDelay: `${Math.random() * 2}s`,
            }}>
            <PartIcon id={part.icon} size={44} className={part.found ? '' : 'opacity-90'} />
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap justify-center">
        {parts.map(part => (
          <div key={part.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold ${
            part.found ? 'bg-accent/20 text-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {part.found ? <PartIcon id={part.icon} size={28} /> : <span>❓</span>} {part.name}
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
    <div className="app-stage paper-page">
      <GlobalNav />
      <div className="app-stage-body px-3 md:px-5 pb-3">
        <div className="h-full w-full flex flex-col">
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
              <div className="flex-1 min-h-0 bg-card rounded-3xl shadow-lg p-3 md:p-5 overflow-auto">
                <TreasureScene
                  level={LEVELS.find(l => l.id === activeLevel)!}
                  onComplete={() => handleComplete(activeLevel)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreasurePage;
