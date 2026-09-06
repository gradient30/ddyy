import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';
import { speak } from '@/lib/speech';
import { AGE_CONFIGS, type AgeBand } from '@/data/age';

const ProfileSelect: React.FC = () => {
  const { state, selectProfile, updateAgeBand } = useGame();
  const [pendingId, setPendingId] = useState<number | null>(() => {
    const current = state.profiles.find(p => p.id === state.currentProfileId);
    return current && !current.ageChosen ? current.id : null;
  });

  const pending = state.profiles.find(p => p.id === pendingId);

  const handlePickProfile = (id: number) => {
    playClick();
    selectProfile(id);
    const profile = state.profiles.find(p => p.id === id);
    if (profile?.ageChosen) {
      speak('欢迎回来，我们去成长小路吧', 'zh-CN', 0.8);
    } else {
      setPendingId(id);
    }
  };

  const handleAge = (band: AgeBand) => {
    playClick();
    updateAgeBand(band);
    setPendingId(null);
    speak(AGE_CONFIGS[band].tagline, 'zh-CN', 0.8);
  };

  return (
    <div className="app-stage paper-page flex flex-col items-center justify-center p-5">
      <XiaoZhaZha mood="waving" size={120} />
      <h1 className="text-3xl md:text-5xl font-black text-foreground mt-3">道闸成长小路</h1>
      <p className="text-muted-foreground mt-1 mb-8 text-center">给 4–7 岁的观察、数感、语言和安全课</p>

      {!pending ? (
        <>
          <p className="text-xl font-extrabold text-foreground mb-5">谁来玩？</p>
          <div className="flex flex-wrap justify-center gap-4">
            {state.profiles.map((profile, i) => (
              <button
                key={profile.id}
                onClick={() => handlePickProfile(profile.id)}
                className="soft-card min-w-[140px] p-5 flex flex-col items-center gap-2 hover:scale-105 active:scale-95 transition-transform animate-pop-in"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <span className="text-5xl">{profile.avatar}</span>
                <span className="text-xl font-black">{profile.name}</span>
                <span className="text-sm text-muted-foreground">⭐ {profile.stars}</span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="w-full max-w-md">
          <p className="text-center text-xl font-extrabold mb-2">{pending.avatar} {pending.name} 几岁啦？</p>
          <p className="text-center text-sm text-muted-foreground mb-5">选对年龄，题目会刚刚好</p>
          <div className="grid gap-3">
            {(Object.values(AGE_CONFIGS)).map(cfg => (
              <button
                key={cfg.id}
                onClick={() => handleAge(cfg.id)}
                className="soft-card p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
              >
                <p className="text-lg font-black">{cfg.label} · {cfg.years}</p>
                <p className="text-sm text-muted-foreground">{cfg.tagline}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSelect;
