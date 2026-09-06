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
    <>
      <GlobalNav />
      <div className="paper-page min-h-screen pt-20 pb-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3 mb-5">
            {showBack && (
              <button
                onClick={() => { playClick(); navigate('/'); }}
                className="kid-btn touch-target bg-card border border-border text-foreground px-3 shrink-0"
                aria-label="回到成长小路"
              >
                ←
              </button>
            )}
            <div className="flex-1">
              <p className="text-xs font-bold tracking-wide text-primary mb-1">
                {DOMAIN_LABEL[domain]} · {age.label}{age.years}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-foreground leading-tight">{title}</h1>
            </div>
            <XiaoZhaZha mood={mascotMood} size={64} />
          </div>

          <div className="soft-card px-4 py-3 mb-5 flex items-start gap-3">
            <span className="text-xl" aria-hidden>🎯</span>
            <div>
              <p className="text-xs font-bold text-muted-foreground">今天学这个</p>
              <p className="text-base font-extrabold text-foreground leading-snug">{goal}</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </>
  );
};

export default GameLayout;
