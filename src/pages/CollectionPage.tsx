import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { playClick, playSuccess } from '@/lib/sound';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';

const ALL_BADGES = [
  { id: 'world-traveler', name: '环球小旅行家', emoji: '🌍', desc: '集齐15国道闸' },
  { id: 'engineer', name: '小工程师', emoji: '🔧', desc: '完成引导组装' },
  { id: 'creative-builder', name: '创意建造师', emoji: '🏗️', desc: '自由建造道闸' },
  { id: 'artist', name: '小画家', emoji: '🎨', desc: '完成涂色作品' },
  { id: 'traffic-hero', name: '交通小英雄', emoji: '🚦', desc: '通过全部交通关卡' },
  { id: 'scientist', name: '小科学家', emoji: '🔬', desc: '完成全部实验' },
  { id: 'linguist', name: '语言小达人', emoji: '📖', desc: '学会20个词汇' },
  { id: 'musician', name: '小音乐家', emoji: '🎵', desc: '完成音乐演奏' },
  { id: 'storyteller', name: '故事大王', emoji: '📚', desc: '完成全部故事' },
  { id: 'treasure-hunter', name: '寻宝达人', emoji: '💎', desc: '找到全部宝藏' },
  { id: 'parking-master', name: '停车小能手', emoji: '🅿️', desc: '完成停车关卡' },
  { id: 'safety-guard', name: '安全小卫士', emoji: '🛡️', desc: '学会交通安全规则' },
  { id: 'color-master', name: '调色大师', emoji: '🌈', desc: '使用全部颜色涂色' },
  { id: 'drum-king', name: '鼓点之王', emoji: '🥁', desc: '完成节奏挑战' },
  { id: 'globe-spinner', name: '地球转转转', emoji: '🌐', desc: '旋转地球仪探索' },
  { id: 'lever-master', name: '杠杆大师', emoji: '⚖️', desc: '完成杠杆实验' },
  { id: 'solar-expert', name: '太阳能专家', emoji: '☀️', desc: '完成太阳能实验' },
  { id: 'sensor-pro', name: '传感器达人', emoji: '📡', desc: '完成传感器实验' },
  { id: 'early-bird', name: '早起的鸟儿', emoji: '🐦', desc: '连续3天使用' },
  { id: 'superstar', name: '超级明星', emoji: '🌟', desc: '获得100颗星星' },
];

const CollectionPage: React.FC = () => {
  const { currentProfile, addStars } = useGame();
  const navigate = useNavigate();
  const [selectedBadge, setSelectedBadge] = useState<typeof ALL_BADGES[0] | null>(null);
  const [tab, setTab] = useState<'badges' | 'words' | 'stats'>('badges');

  if (!currentProfile) {
    navigate('/');
    return null;
  }

  const earnedBadges = currentProfile.badges;

  const handleBadgeClick = (badge: typeof ALL_BADGES[0]) => {
    playClick();
    setSelectedBadge(badge);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-golden/15 via-background to-sky/10 p-4 pt-16">
      {/* Header */}
      <div className="text-center mb-6">
        <button onClick={() => { playClick(); navigate('/'); }} className="absolute top-4 left-4 text-3xl touch-target">🏠</button>
        <h1 className="text-3xl font-black">🏆 我的收藏馆</h1>
        <p className="text-muted-foreground mt-1">{currentProfile.name}的荣誉殿堂</p>
      </div>

      {/* Star summary */}
      <div className="flex justify-center gap-6 mb-6">
        <div className="bg-card rounded-3xl px-6 py-4 text-center shadow-lg border border-border">
          <div className="text-4xl mb-1">⭐</div>
          <div className="text-3xl font-black text-foreground">{currentProfile.stars}</div>
          <div className="text-xs text-muted-foreground">星星总数</div>
        </div>
        <div className="bg-card rounded-3xl px-6 py-4 text-center shadow-lg border border-border">
          <div className="text-4xl mb-1">🏅</div>
          <div className="text-3xl font-black text-foreground">{earnedBadges.length}</div>
          <div className="text-xs text-muted-foreground">徽章数</div>
        </div>
        <div className="bg-card rounded-3xl px-6 py-4 text-center shadow-lg border border-border">
          <div className="text-4xl mb-1">📖</div>
          <div className="text-3xl font-black text-foreground">{currentProfile.learnedWords.length}</div>
          <div className="text-xs text-muted-foreground">词汇量</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {([['badges', '🏅 徽章墙'], ['words', '📖 词汇本'], ['stats', '📊 统计']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { playClick(); setTab(key); }}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${tab === key ? 'bg-primary text-primary-foreground scale-105' : 'bg-muted text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Badge Wall */}
      {tab === 'badges' && (
        <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
          {ALL_BADGES.map(badge => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <button
                key={badge.id}
                onClick={() => handleBadgeClick(badge)}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all touch-target ${
                  earned
                    ? 'bg-golden/20 border-2 border-golden shadow-lg hover:scale-105 active:scale-95'
                    : 'bg-muted/50 border border-border opacity-40 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-[10px] font-bold text-foreground mt-1 leading-tight text-center">{badge.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Word Book */}
      {tab === 'words' && (
        <div className="max-w-lg mx-auto">
          {currentProfile.learnedWords.length === 0 ? (
            <div className="text-center py-12">
              <XiaoZhaZha mood="happy" size={80} className="mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">还没有学会的词汇哦～</p>
              <p className="text-sm text-muted-foreground">去语言魔法屋学习吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {currentProfile.learnedWords.map((word, i) => (
                <div key={i} className="bg-card rounded-2xl p-3 text-center border border-border shadow-sm">
                  <span className="text-lg font-bold text-foreground">{word}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {tab === 'stats' && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-foreground">📊 学习数据</h3>
            <div className="space-y-3">
              <StatRow label="总游戏时间" value={`${currentProfile.totalPlayMinutes} 分钟`} icon="⏰" />
              <StatRow label="获得星星" value={`${currentProfile.stars} ⭐`} icon="🌟" />
              <StatRow label="解锁徽章" value={`${earnedBadges.length} / ${ALL_BADGES.length}`} icon="🏅" />
              <StatRow label="学会词汇" value={`${currentProfile.learnedWords.length} 个`} icon="📖" />
              <StatRow label="组装成功率" value={`${currentProfile.buildSuccessRate}%`} icon="🔧" />
            </div>
          </div>

          {/* Achievement progress */}
          <div className="bg-card rounded-3xl p-6 border border-border shadow-lg">
            <h3 className="font-bold text-lg mb-4 text-foreground">🎯 成就进度</h3>
            <div className="h-4 rounded-full bg-muted overflow-hidden mb-2">
              <div
                className="h-full rounded-full rainbow-bar transition-all duration-500"
                style={{ width: `${(earnedBadges.length / ALL_BADGES.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              已完成 {Math.round((earnedBadges.length / ALL_BADGES.length) * 100)}% 的成就
            </p>
          </div>
        </div>
      )}

      {/* Badge detail modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-6" onClick={() => setSelectedBadge(null)}>
          <div className="bg-card rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl animate-pop-in border border-border" onClick={e => e.stopPropagation()}>
            <div className="text-6xl mb-4">{selectedBadge.emoji}</div>
            <h2 className="text-2xl font-black text-foreground mb-2">{selectedBadge.name}</h2>
            <p className="text-muted-foreground mb-4">{selectedBadge.desc}</p>
            {earnedBadges.includes(selectedBadge.id) ? (
              <div className="bg-primary/20 text-primary rounded-2xl px-4 py-2 font-bold">✅ 已获得！</div>
            ) : (
              <div className="bg-muted rounded-2xl px-4 py-2 text-muted-foreground font-bold">🔒 未解锁</div>
            )}
            <button onClick={() => setSelectedBadge(null)} className="mt-4 text-sm text-muted-foreground underline">关闭</button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatRow: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="text-muted-foreground"><span className="mr-2">{icon}</span>{label}</span>
    <span className="font-bold text-foreground">{value}</span>
  </div>
);

export default CollectionPage;
