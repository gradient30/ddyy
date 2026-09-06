import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import GameLayout from '@/components/layout/GameLayout';
import { playClick, playSuccess } from '@/lib/sound';
import { delay, speak, stopSpeaking } from '@/lib/speech';
import { getAgeConfig } from '@/data/age';

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, addStars, addBadge, addKnowledge, completeStation } = useGame();
  const age = getAgeConfig(currentProfile?.ageBand);
  const [phase, setPhase] = useState<'tap' | 'talk' | 'ready'>('tap');
  const [line, setLine] = useState('');
  const cancelled = React.useRef(false);

  useEffect(() => () => { cancelled.current = true; stopSpeaking(); }, []);

  const run = async () => {
    cancelled.current = false;
    setPhase('talk');
    const name = currentProfile?.name ?? '小朋友';
    const lines = age.id === 'sprout'
      ? [`${name}，你好呀！我是小闸闸。`, '今天我们一起看、一起点。', '走完一站，小路会打开下一站。']
      : age.id === 'explorer'
        ? [`${name}，欢迎回来！`, '道闸是停车场的大门，它会抬起来让车过去。', '我们先学会观察和数数，再学安全。']
        : [`${name}，今天你是小小研究者。`, '每到一站，先想“为什么”，再动手。', '不同地方的大门不一样，但都是为了安全。'];

    for (const text of lines) {
      if (cancelled.current) return;
      setLine(text);
      await speak(text, 'zh-CN', age.speechRate);
      await delay(350);
    }
    if (cancelled.current) return;
    setPhase('ready');
    playSuccess();
  };

  const finish = () => {
    playClick();
    stopSpeaking();
    addStars(1);
    addBadge('welcome-friend');
    addKnowledge('greet-friend');
    completeStation('welcome');
    navigate('/');
  };

  return (
    <GameLayout
      title="欢迎小屋"
      domain="social"
      goal={age.id === 'sprout' ? '听小闸闸打招呼，点一下出发' : age.id === 'explorer' ? '听问候，记住小闸闸' : '听完后能说出下一站去哪里'}
      mascotMood="waving"
      showBack
    >
      <div className="soft-card p-6 text-center">
        <XiaoZhaZha mood={phase === 'ready' ? 'happy' : 'waving'} size={130} className="mx-auto" />
        {phase === 'tap' && (
          <div className="mt-4">
            <p className="text-xl font-black mb-2">点一下，小闸闸开始说话</p>
            <p className="text-sm text-muted-foreground mb-5">先听完，再走上成长小路</p>
            <button onClick={() => { playClick(); run(); }} className="kid-btn px-8 bg-primary text-primary-foreground text-xl">
              我听好了
            </button>
          </div>
        )}
        {phase === 'talk' && (
          <p className="mt-5 text-xl font-extrabold leading-snug">{line}</p>
        )}
        {phase === 'ready' && (
          <div className="mt-5">
            <p className="text-xl font-black mb-4">下一站是观察花园</p>
            <button onClick={finish} className="kid-btn px-8 bg-primary text-primary-foreground text-xl">
              出发
            </button>
          </div>
        )}
        {phase !== 'ready' && (
          <button onClick={finish} className="mt-5 text-sm text-muted-foreground underline">先去小路看看</button>
        )}
      </div>
    </GameLayout>
  );
};

export default WelcomePage;
