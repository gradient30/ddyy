import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';
import { DOMAIN_LABEL, type Domain } from '@/data/curriculum';
import { getAgeConfig } from '@/data/age';
import { useGame } from '@/contexts/GameContext';

interface GameLayoutProps {
  title: string;
  domain: Domain;
  goal: string;
  children: React.ReactNode;
  mascotMood?: 'happy' | 'excited' | 'thinking' | 'waving';
  showBack?: boolean;
}

const GameLayout: React.FC<GameLayoutProps> = ({
  title,
  domain,
  goal,
  children,
  mascotMood = 'happy',
  showBack = true,
}) => {
  const navigate = useNavigate();
  const { currentProfile } = useGame();
  const age = getAgeConfig(currentProfile?.ageBand);

  return (
    <div className="app-stage paper-page">
      <GlobalNav />
      <div className="app-stage-body px-3 md:px-5 pb-3 flex flex-col">
        <header className="flex items-center gap-2 md:gap-3 shrink-0 mb-2">
          {showBack && (
            <button
              onClick={() => { playClick(); navigate('/'); }}
              className="kid-btn touch-target bg-card border border-border text-foreground px-3 shrink-0 h-12 min-h-12"
              aria-label="回到成长小路"
            >
              ←
            </button>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold tracking-wide text-primary">
              {DOMAIN_LABEL[domain]} · {age.label}{age.years}
            </p>
            <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight truncate">{title}</h1>
            <p className="text-sm font-extrabold text-foreground/80 leading-snug truncate">🎯 {goal}</p>
          </div>
          <XiaoZhaZha mood={mascotMood} size={52} />
        </header>
        <main className="flex-1 min-h-0 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default GameLayout;
