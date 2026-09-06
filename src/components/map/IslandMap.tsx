import React from 'react';
import { useNavigate } from 'react-router-dom';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';
import { useGame } from '@/contexts/GameContext';
import { getAgeConfig } from '@/data/age';
import {
  DOMAIN_LABEL,
  STATIONS,
  isStationUnlocked,
  recommendedStation,
} from '@/data/curriculum';

const IslandMap: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, state } = useGame();
  const completed = currentProfile?.completedStations ?? [];
  const unlockAll = state.globalSettings.unlockAllStations;
  const age = getAgeConfig(currentProfile?.ageBand);
  const next = recommendedStation(completed);
  const doneCount = STATIONS.filter(s => completed.includes(s.id)).length;

  const handleOpen = (path: string, unlocked: boolean) => {
    if (!unlocked) return;
    playClick();
    navigate(path);
  };

  return (
    <div className="paper-page min-h-screen pt-16 pb-10 px-4">
      <div className="max-w-lg mx-auto">
        <header className="text-center mb-6 pt-2">
          <p className="text-sm font-bold text-primary">{age.label} · {age.years}</p>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mt-1">道闸成长小路</h1>
          <p className="text-muted-foreground mt-1">{age.tagline}</p>
        </header>

        <button
          onClick={() => handleOpen(next.path, true)}
          className="soft-card w-full p-4 mb-6 flex items-center gap-3 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          <XiaoZhaZha mood="waving" size={72} />
          <div className="flex-1">
            <p className="text-xs font-bold text-primary">小闸闸邀请你</p>
            <p className="text-lg font-black text-foreground">下一站：{next.name}</p>
            <p className="text-sm text-muted-foreground leading-snug">{next.goal[age.id]}</p>
          </div>
        </button>

        <div className="flex items-center justify-between text-sm font-bold text-muted-foreground mb-3 px-1">
          <span>成长进度</span>
          <span>{doneCount} / {STATIONS.length}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden mb-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-golden transition-all"
            style={{ width: `${(doneCount / STATIONS.length) * 100}%` }}
          />
        </div>

        <ol className="relative space-y-4">
          <div className="absolute left-[27px] top-6 bottom-6 w-1 rounded-full bg-border/80" aria-hidden />
          {STATIONS.map((station, index) => {
            const unlocked = isStationUnlocked(station.id, completed, unlockAll);
            const done = completed.includes(station.id);
            return (
              <li key={station.id} className="relative">
                <button
                  disabled={!unlocked}
                  onClick={() => handleOpen(station.path, unlocked)}
                  className={`relative w-full text-left soft-card p-4 pl-16 bg-gradient-to-br ${station.tint} transition-all ${
                    unlocked ? 'hover:scale-[1.01] active:scale-[0.99]' : 'opacity-55'
                  } ${done ? 'ring-2 ring-primary/30' : ''}`}
                  aria-label={`${station.name}${unlocked ? '' : '，还没开放'}`}
                >
                  <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center text-lg border-2 ${
                    done ? 'bg-primary text-primary-foreground border-primary' :
                    unlocked ? 'bg-card border-primary/40' : 'bg-muted border-border'
                  }`}>
                    {done ? '✓' : index + 1}
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[11px] font-bold text-primary">{DOMAIN_LABEL[station.domain]}</p>
                      <p className="text-lg font-black text-foreground">
                        <span className="mr-1" aria-hidden>{station.icon}</span>{station.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{unlocked ? station.goal[age.id] : '先走完上一站，这里会打开'}</p>
                    </div>
                    <span className="text-2xl shrink-0" aria-hidden>{unlocked ? '›' : '🔒'}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="flex justify-center gap-3 mt-8">
          <button
            onClick={() => { playClick(); navigate('/collection'); }}
            className="kid-btn touch-target px-5 bg-golden/25 text-foreground"
          >
            成长手册
          </button>
          <button
            onClick={() => { playClick(); navigate('/parent'); }}
            className="kid-btn touch-target px-5 bg-muted text-foreground"
          >
            家长
          </button>
        </div>
      </div>
    </div>
  );
};

export default IslandMap;
