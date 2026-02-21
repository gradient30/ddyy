import React, { useState, useEffect } from 'react';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';

const exercises = [
  { emoji: '👀', name: '转转眼睛', desc: '眼睛画大圆圈，顺时针转5圈' },
  { emoji: '😌', name: '闭眼休息', desc: '轻轻闭上眼睛，深呼吸10秒' },
  { emoji: '🌳', name: '远眺绿色', desc: '看看窗外远处的树和天空' },
  { emoji: '😊', name: '眨眨眼', desc: '快速眨眼10次，让眼睛湿润' },
];

const RestMode: React.FC = () => {
  const { restSeconds } = useGame();
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const mins = Math.floor(restSeconds / 60);
  const secs = restSeconds % 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setExerciseIdx(prev => (prev + 1) % exercises.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const ex = exercises[exerciseIdx];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[hsl(220,40%,15%)] to-[hsl(240,30%,10%)] flex flex-col items-center justify-center text-primary-foreground p-6">
      {/* 月亮和星星 */}
      <div className="absolute top-8 right-8 text-5xl animate-float">🌙</div>
      <div className="absolute top-16 left-12 text-2xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute top-24 right-24 text-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}>⭐</div>

      {/* 小闸闸 */}
      <XiaoZhaZha mood="sleeping" size={120} className="mb-6" />

      <h1 className="text-3xl md:text-4xl font-black mb-2">🏠 休息小屋</h1>
      <p className="text-lg text-primary-foreground/70 mb-6">让眼睛休息一下吧！</p>

      {/* 倒计时 */}
      <div className="text-6xl font-black mb-8 tabular-nums">
        {mins}:{secs.toString().padStart(2, '0')}
      </div>

      {/* 眼保健操 */}
      <div className="bg-card/10 backdrop-blur rounded-3xl p-8 max-w-sm w-full text-center animate-pop-in" key={exerciseIdx}>
        <div className="text-6xl mb-4">{ex.emoji}</div>
        <h2 className="text-2xl font-bold mb-2">{ex.name}</h2>
        <p className="text-lg text-primary-foreground/80">{ex.desc}</p>
      </div>

      <p className="mt-8 text-sm text-primary-foreground/50">休息结束后会自动回到游戏哦 💤</p>
    </div>
  );
};

export default RestMode;
