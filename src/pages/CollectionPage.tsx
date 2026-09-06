import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';
import { BADGES, hasBadge } from '@/data/badges';
import { DOMAIN_LABEL, KNOWLEDGE, STATIONS, type Domain } from '@/data/curriculum';
import { getAgeConfig } from '@/data/age';

const CollectionPage: React.FC = () => {
  const { currentProfile } = useGame();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'path' | 'know' | 'words' | 'badges'>('path');

  if (!currentProfile) {
    navigate('/');
    return null;
  }

  const age = getAgeConfig(currentProfile.ageBand);
  const earned = currentProfile.badges;
  const know = currentProfile.knowledgeIds;

  return (
    <div className="app-stage paper-page">
      <div className="app-stage-body px-3 md:px-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => { playClick(); navigate('/'); }} className="kid-btn touch-target bg-card border border-border px-3" aria-label="回家">←</button>
          <div className="flex-1">
            <h1 className="text-2xl font-black">成长手册</h1>
            <p className="text-sm text-muted-foreground">{currentProfile.name} · {age.label}{age.years}</p>
          </div>
          <XiaoZhaZha mood="happy" size={56} />
        </div>

        <div className="grid grid-cols-3 gap-2 mb-5">
          <Stat label="星星" value={currentProfile.stars} />
          <Stat label="学会的本领" value={know.length} />
          <Stat label="走过的站" value={currentProfile.completedStations.length} />
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {([['path', '小路'], ['know', '本领'], ['words', '词汇'], ['badges', '徽章']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { playClick(); setTab(key); }}
              className={`kid-btn px-4 text-sm ${tab === key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'path' && (
          <div className="space-y-2">
            {STATIONS.map(s => {
              const done = currentProfile.completedStations.includes(s.id);
              return (
                <div key={s.id} className={`soft-card p-3 flex items-center gap-3 ${done ? '' : 'opacity-60'}`}>
                  <span className="text-xl">{done ? '✓' : s.icon}</span>
                  <div>
                    <p className="font-black">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{DOMAIN_LABEL[s.domain]} · {s.goal[age.id]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'know' && (
          <div className="space-y-4">
            {(Object.keys(DOMAIN_LABEL) as Domain[]).map(domain => {
              const cards = KNOWLEDGE.filter(k => k.domain === domain);
              const got = cards.filter(k => know.includes(k.id));
              if (!cards.length) return null;
              return (
                <div key={domain}>
                  <p className="text-sm font-bold text-primary mb-2">{DOMAIN_LABEL[domain]} {got.length}/{cards.length}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {cards.map(card => {
                      const on = know.includes(card.id);
                      return (
                        <div key={card.id} className={`soft-card p-3 ${on ? '' : 'opacity-40'}`}>
                          <p className="font-black text-sm">{on ? card.name : '还在路上'}</p>
                          {on && <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'words' && (
          currentProfile.learnedWords.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">去语言小屋听一听、点一点</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {currentProfile.learnedWords.map(w => (
                <span key={w} className="soft-card px-4 py-2 font-black">{w}</span>
              ))}
            </div>
          )
        )}

        {tab === 'badges' && (
          <div className="grid grid-cols-3 gap-3">
            {BADGES.map(badge => {
              const earnedBadge = hasBadge(earned, badge.id);
              return (
                <div key={badge.id} className={`soft-card p-3 text-center ${earnedBadge ? '' : 'opacity-35 grayscale'}`}>
                  <div className="text-3xl">{badge.emoji}</div>
                  <p className="text-xs font-black mt-1">{badge.name}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="soft-card p-3 text-center">
    <p className="text-2xl font-black">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default CollectionPage;
