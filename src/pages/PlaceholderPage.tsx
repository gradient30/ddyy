import React from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';

interface Props {
  title: string;
  emoji: string;
  desc: string;
  color: string;
}

const PlaceholderPage: React.FC<Props> = ({ title, emoji, desc, color }) => {
  const navigate = useNavigate();

  return (
    <>
      <GlobalNav />
      <div className={`min-h-screen bg-gradient-to-b ${color} pt-20 pb-8 px-4 flex flex-col items-center justify-center`}>
        <div className="animate-pop-in mb-6">
          <XiaoZhaZha mood="thinking" size={100} />
        </div>
        <div className="bg-card rounded-3xl shadow-lg p-8 max-w-sm w-full text-center animate-pop-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="text-3xl font-black text-foreground mb-2">{title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{desc}</p>
          <p className="text-base text-muted-foreground/70 mb-4">🚧 小闸闸正在建造中...</p>
          <button
            onClick={() => { playClick(); navigate('/'); }}
            className="touch-target rounded-2xl bg-primary/10 hover:bg-primary/20 px-6 py-3 text-lg font-bold transition-all active:scale-95"
          >
            🏠 回到地图
          </button>
        </div>
      </div>
    </>
  );
};

export default PlaceholderPage;
