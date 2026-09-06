import React from 'react';
import { useNavigate } from 'react-router-dom';
import GameLayout from '@/components/layout/GameLayout';
import { useGame } from '@/contexts/GameContext';
import { getAgeConfig } from '@/data/age';
import { playClick } from '@/lib/sound';

const DOORS = [
  { path: '/coloring', name: '涂色工坊', desc: '选颜色，画一座温柔的道闸', min: 0 as const },
  { path: '/music', name: '节奏小台', desc: '咚嗒咚嗒，杆子跟着点头', min: 1 as const },
  { path: '/story', name: '故事角落', desc: '听故事，做一个安全的选择', min: 1 as const },
];

const ExpressPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile } = useGame();
  const age = getAgeConfig(currentProfile?.ageBand);
  const rank = age.id === 'sprout' ? 0 : age.id === 'explorer' ? 1 : 2;

  return (
    <GameLayout
      title="表达舞台"
      domain="art"
      goal={age.id === 'sprout' ? '选喜欢的颜色画一画' : age.id === 'explorer' ? '画画或跟着鼓点敲' : '画、敲、再讲一个故事'}
      mascotMood="excited"
    >
      <div className="grid gap-3">
        {DOORS.filter(d => rank >= d.min).map(door => (
          <button
            key={door.path}
            onClick={() => { playClick(); navigate(door.path); }}
            className="soft-card p-5 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            <p className="text-lg font-black text-foreground">{door.name}</p>
            <p className="text-sm text-muted-foreground">{door.desc}</p>
          </button>
        ))}
      </div>
    </GameLayout>
  );
};

export default ExpressPage;
