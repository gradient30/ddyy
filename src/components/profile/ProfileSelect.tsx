import React from 'react';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';
import { speak } from '@/lib/speech';

const ProfileSelect: React.FC = () => {
  const { state, selectProfile } = useGame();

  const handleSelect = (id: number) => {
    playClick();
    selectProfile(id);
    speak('欢迎回来！让我们一起玩吧！', 'zh-CN', 0.8);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky/20 via-background to-golden/10 p-4 md:p-8">
      {/* 标题 */}
      <div className="animate-pop-in mb-4 md:mb-6">
        <XiaoZhaZha mood="waving" size={140} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-foreground mb-2 animate-pop-in" style={{ animationDelay: '0.1s' }}>
        🚧 道闸乐园
      </h1>
      <p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-10 animate-pop-in" style={{ animationDelay: '0.2s' }}>
        Barrier Buddies Adventure
      </p>

      {/* 选择提示 */}
      <p className="text-xl md:text-2xl font-bold text-foreground mb-6 md:mb-8 animate-pop-in" style={{ animationDelay: '0.3s' }}>
        选择你的档案 👇
      </p>

      {/* 3个孩子档案 */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {state.profiles.map((profile, i) => (
          <button
            key={profile.id}
            onClick={() => handleSelect(profile.id)}
            className="touch-target animate-pop-in flex flex-col items-center gap-3 md:gap-4 p-6 md:p-8 rounded-3xl bg-card border-4 border-primary/30 hover:border-primary hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[140px] md:min-w-[180px]"
            style={{ animationDelay: `${0.4 + i * 0.1}s` }}
          >
            <span className="text-6xl md:text-7xl">{profile.avatar}</span>
            <span className="text-xl md:text-2xl font-bold text-card-foreground">{profile.name}</span>
            <span className="text-sm md:text-base text-muted-foreground flex items-center gap-1">
              ⭐ {profile.stars}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileSelect;
