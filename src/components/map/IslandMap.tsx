import React from 'react';
import { useNavigate } from 'react-router-dom';
import { playClick } from '@/lib/sound';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';

interface IslandData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  path: string;
  x: number;
  y: number;
  unlocked: boolean;
  desc: string;
}

const islands: IslandData[] = [
  { id: 'welcome', name: '欢迎岛', emoji: '🎪', color: 'from-sky to-sky/70', path: '/welcome', x: 50, y: 15, unlocked: true, desc: '认识小闸闸' },
  { id: 'world', name: '世界巡游', emoji: '🌍', color: 'from-grass to-grass/70', path: '/world-tour', x: 20, y: 30, unlocked: true, desc: '环游15国' },
  { id: 'lab', name: '探秘实验室', emoji: '🔬', color: 'from-purple-fun to-purple-fun/70', path: '/lab', x: 80, y: 28, unlocked: true, desc: 'STEM科学' },
  { id: 'factory', name: '建造工厂', emoji: '🏗️', color: 'from-orange-warm to-orange-warm/70', path: '/factory', x: 15, y: 52, unlocked: true, desc: '组装道闸' },
  { id: 'traffic', name: '交通英雄城', emoji: '🚦', color: 'from-coral to-coral/70', path: '/traffic', x: 50, y: 45, unlocked: true, desc: '安全闯关' },
  { id: 'language', name: '语言魔法屋', emoji: '📚', color: 'from-golden to-golden/70', path: '/language', x: 82, y: 50, unlocked: true, desc: '认字学词' },
  { id: 'coloring', name: '涂色工厂', emoji: '🎨', color: 'from-coral to-golden/70', path: '/coloring', x: 25, y: 72, unlocked: true, desc: '涂色创作' },
  { id: 'music', name: '音乐律动', emoji: '🎵', color: 'from-purple-fun to-sky/70', path: '/music', x: 50, y: 72, unlocked: true, desc: '节奏游戏' },
  { id: 'story', name: '故事王国', emoji: '📖', color: 'from-grass to-golden/70', path: '/story', x: 75, y: 72, unlocked: true, desc: '互动绘本' },
  { id: 'treasure', name: '寻宝乐园', emoji: '🗺️', color: 'from-orange-warm to-coral/70', path: '/treasure', x: 50, y: 90, unlocked: true, desc: '找零件拼图' },
];

const IslandButton: React.FC<{ island: IslandData; onClick: () => void }> = ({ island, onClick }) => (
  <button
    onClick={onClick}
    className={`touch-target absolute animate-pop-in flex flex-col items-center gap-1 p-3 md:p-4 lg:p-5 rounded-3xl bg-gradient-to-br ${island.color} shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-card/50 hover:border-card`}
    style={{
      left: `${island.x}%`,
      top: `${island.y}%`,
      transform: 'translate(-50%, -50%)',
      animationDelay: `${islands.indexOf(island) * 0.08}s`,
    }}
    aria-label={island.name}
  >
    <span className="text-3xl md:text-5xl">{island.emoji}</span>
    <span className="text-xs md:text-base font-bold text-card whitespace-nowrap drop-shadow-sm">{island.name}</span>
  </button>
);

const IslandMap: React.FC = () => {
  const navigate = useNavigate();

  const handleIsland = (island: IslandData) => {
    playClick();
    navigate(island.path);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky/30 via-background to-grass/20 pt-16 pb-8 px-4 flex flex-col">
      {/* 标题 */}
      <div className="text-center mb-2 md:mb-4">
        <h1 className="text-3xl md:text-5xl font-black text-foreground">🚧 道闸游乐园 🎡</h1>
        <p className="text-sm md:text-lg text-muted-foreground mt-1">点击小岛开始探险吧！</p>
      </div>

      {/* 地图区域 */}
      <div className="relative w-full max-w-2xl md:max-w-4xl mx-auto flex-1" style={{ minHeight: '450px' }}>
        {/* 背景装饰 */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* 连接线 */}
          <path d="M50,15 L20,30 M50,15 L80,28 M20,30 L15,52 M80,28 L82,50 M15,52 L50,45 M82,50 L50,45 M50,45 L25,72 M50,45 L50,72 M50,45 L75,72 M50,72 L50,90"
            stroke="hsl(var(--border))" strokeWidth="0.3" strokeDasharray="1,1" fill="none" opacity="0.5" />
        </svg>

        {/* 云朵装饰 */}
        <div className="absolute text-4xl animate-float" style={{ left: '5%', top: '5%' }}>☁️</div>
        <div className="absolute text-3xl animate-float" style={{ left: '85%', top: '10%', animationDelay: '1s' }}>☁️</div>
        <div className="absolute text-2xl animate-float" style={{ left: '60%', top: '3%', animationDelay: '2s' }}>☁️</div>

        {/* 岛屿按钮 */}
        {islands.map(island => (
          <IslandButton key={island.id} island={island} onClick={() => handleIsland(island)} />
        ))}

        {/* 小闸闸在中央 */}
        <div className="absolute animate-glow-pulse" style={{ left: '50%', top: '55%', transform: 'translate(-50%, -50%)' }}>
          <XiaoZhaZha mood="happy" size={80} />
        </div>
      </div>

      {/* 底部快捷 */}
      <div className="flex justify-center gap-4 md:gap-6 mt-4">
        <button onClick={() => { playClick(); navigate('/collection'); }} className="touch-target rounded-2xl bg-golden/20 hover:bg-golden/30 px-4 md:px-6 py-2 md:py-3 text-lg md:text-xl font-bold transition-all active:scale-95">
          🏆 收藏馆
        </button>
        <button onClick={() => { playClick(); navigate('/parent'); }} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-4 md:px-6 py-2 md:py-3 text-lg md:text-xl font-bold transition-all active:scale-95">
          🔑 家长区
        </button>
      </div>
    </div>
  );
};

export default IslandMap;
