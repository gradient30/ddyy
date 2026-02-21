import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import GlobalNav from '@/components/nav/GlobalNav';
import { playSuccess, playClick } from '@/lib/sound';
import { speak } from '@/lib/speech';

const greetingsZh = [
  '小朋友你好呀！我是小闸闸！',
  '嘿！今天又来玩啦！太开心了！',
  '哇，小闸闸的好朋友来啦！',
  '欢迎回来！我们一起探险吧！',
  '你好呀！今天想玩什么？',
];

const greetingsEn = [
  "Hi there! I'm XiaoZhaZha!",
  "Hey! So happy to see you again!",
  "Wow, my best friend is here!",
  "Welcome back! Let's explore together!",
  "Hello! What shall we play today?",
];

const funFacts = [
  { zh: '你知道吗？道闸可以保护停车场的安全哦！', en: 'Barriers keep parking lots safe!', emoji: '🅿️' },
  { zh: '全世界有好多不同样子的道闸呢！', en: 'There are many barrier types worldwide!', emoji: '🌍' },
  { zh: '道闸的杆子就像一个大杠杆！', en: 'A barrier arm is like a big lever!', emoji: '⚖️' },
  { zh: '有些道闸用太阳能发电，好环保！', en: 'Some barriers use solar power!', emoji: '☀️' },
  { zh: '道闸上有传感器，能看到车来了！', en: 'Barriers have sensors to detect cars!', emoji: '👀' },
  { zh: '最快的道闸可以1秒钟就抬起来！', en: 'The fastest barriers lift in 1 second!', emoji: '⚡' },
];

const WelcomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentProfile, addStars } = useGame();
  const [phase, setPhase] = useState<'intro' | 'greeting' | 'fact' | 'ready'>('intro');
  const [greetIdx] = useState(() => Math.floor(Math.random() * greetingsZh.length));
  const [factIdx] = useState(() => Math.floor(Math.random() * funFacts.length));
  const [mascotMood, setMascotMood] = useState<'happy' | 'excited' | 'waving'>('waving');
  const [showSubtitle, setShowSubtitle] = useState('');

  useEffect(() => {
    // Intro sequence
    const t1 = setTimeout(() => {
      setPhase('greeting');
      setMascotMood('waving');
      setShowSubtitle(greetingsZh[greetIdx]);
      speak(greetingsZh[greetIdx], 'zh-CN', 0.85);
    }, 800);

    const t2 = setTimeout(() => {
      setShowSubtitle(greetingsEn[greetIdx]);
      speak(greetingsEn[greetIdx], 'en-US', 0.8);
    }, 3500);

    const t3 = setTimeout(() => {
      setPhase('fact');
      setMascotMood('excited');
      const fact = funFacts[factIdx];
      setShowSubtitle(fact.zh);
      speak(fact.zh, 'zh-CN', 0.85);
    }, 6000);

    const t4 = setTimeout(() => {
      const fact = funFacts[factIdx];
      setShowSubtitle(fact.en);
      speak(fact.en, 'en-US', 0.8);
    }, 9000);

    const t5 = setTimeout(() => {
      setPhase('ready');
      setMascotMood('happy');
      setShowSubtitle('准备好了吗？出发探险啦！');
      playSuccess();
    }, 11500);

    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, [greetIdx, factIdx]);

  const handleExplore = () => {
    playClick();
    addStars(1);
    navigate('/');
  };

  const fact = funFacts[factIdx];

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-sky/20 via-background to-golden/10 pt-20 pb-8 px-4 flex flex-col items-center justify-center">
        {/* 背景装饰 */}
        <div className="absolute top-24 left-8 text-4xl animate-float opacity-60">🎈</div>
        <div className="absolute top-32 right-8 text-3xl animate-float opacity-60" style={{ animationDelay: '1s' }}>🎪</div>
        <div className="absolute bottom-20 left-12 text-3xl animate-bounce-gentle opacity-50">🌟</div>
        <div className="absolute bottom-32 right-12 text-4xl animate-bounce-gentle opacity-50" style={{ animationDelay: '0.5s' }}>✨</div>

        {/* 小闸闸 */}
        <div className="animate-pop-in mb-6">
          <XiaoZhaZha mood={mascotMood} size={140} />
        </div>

        {/* 对话气泡 */}
        <div className="relative bg-card rounded-3xl shadow-lg p-6 max-w-md w-full text-center mb-6 animate-pop-in" style={{ animationDelay: '0.3s' }}>
          {/* 三角箭头 */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-card rotate-45 rounded-sm" />

          {phase === 'intro' && (
            <div className="py-8">
              <div className="text-4xl animate-bounce-gentle">🚧</div>
              <p className="text-lg font-bold text-muted-foreground mt-2">加载中...</p>
            </div>
          )}

          {phase === 'greeting' && (
            <div className="py-4">
              <p className="text-2xl md:text-3xl font-black text-foreground mb-2">{greetingsZh[greetIdx]}</p>
              <p className="text-lg text-muted-foreground italic">{greetingsEn[greetIdx]}</p>
              {currentProfile && (
                <p className="text-xl mt-3 font-bold text-primary">
                  {currentProfile.avatar} {currentProfile.name}，你好！
                </p>
              )}
            </div>
          )}

          {phase === 'fact' && (
            <div className="py-4">
              <div className="text-5xl mb-3">{fact.emoji}</div>
              <p className="text-xl font-bold text-foreground mb-1">{fact.zh}</p>
              <p className="text-base text-muted-foreground italic">{fact.en}</p>
            </div>
          )}

          {phase === 'ready' && (
            <div className="py-4">
              <p className="text-2xl font-black text-foreground mb-4">🎉 准备好了吗？</p>
              <p className="text-lg text-muted-foreground mb-4">点击下面的按钮，开始今天的冒险！</p>
              <button
                onClick={handleExplore}
                className="touch-target rounded-3xl bg-gradient-to-r from-sky to-grass text-primary-foreground px-8 py-4 text-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                🗺️ 出发探险！
              </button>
            </div>
          )}
        </div>

        {/* 字幕 */}
        {showSubtitle && (
          <div className="bg-foreground/80 text-primary-foreground rounded-2xl px-6 py-3 max-w-sm text-center animate-pop-in">
            <p className="text-lg font-bold">🔊 {showSubtitle}</p>
          </div>
        )}

        {/* 跳过按钮 */}
        {phase !== 'ready' && (
          <button
            onClick={handleExplore}
            className="mt-6 text-muted-foreground hover:text-foreground text-sm underline transition-colors"
          >
            跳过 →
          </button>
        )}

        {/* 再听一次 */}
        {phase !== 'intro' && (
          <button
            onClick={() => {
              playClick();
              if (phase === 'greeting') speak(greetingsZh[greetIdx], 'zh-CN', 0.7);
              else if (phase === 'fact') speak(fact.zh, 'zh-CN', 0.7);
            }}
            className="mt-4 touch-target rounded-2xl bg-golden/20 hover:bg-golden/30 px-6 py-3 text-lg font-bold transition-all active:scale-95"
          >
            🔁 再听一次（慢速）
          </button>
        )}
      </div>
    </>
  );
};

export default WelcomePage;
