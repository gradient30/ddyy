import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick, playSuccess } from '@/lib/sound';
import { speak } from '@/lib/speech';

const ProfileSelect: React.FC = () => {
  const { state, selectProfile, updateProfileAgeGroup } = useGame();
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);

  const handleSelectProfile = (id: number) => {
    playClick();
    setSelectedProfileId(id);
    speak('选择年龄段', 'zh-CN', 0.8);
  };

  const handleSelectAgeGroup = (ageGroup: 'toddler' | 'child') => {
    if (selectedProfileId === null) return;
    playSuccess();
    updateProfileAgeGroup(ageGroup);
    selectProfile(selectedProfileId);
    
    const greeting = ageGroup === 'toddler' 
      ? '小朋友你好呀！让我们开始有趣的冒险吧！'
      : '欢迎回来！准备好开始新的探索了吗？';
    speak(greeting, 'zh-CN', 0.8);
  };

  const handleBack = () => {
    playClick();
    setSelectedProfileId(null);
  };

  // 年龄段选择界面
  if (selectedProfileId !== null) {
    const profile = state.profiles.find(p => p.id === selectedProfileId);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/10 via-background to-golden/10 p-4 md:p-8 animate-fade-in">
        {/* 返回按钮 */}
        <button 
          onClick={handleBack}
          className="absolute top-4 left-4 touch-target rounded-2xl bg-card border-2 border-border hover:border-primary transition-all"
        >
          ← 返回
        </button>

        {/* 标题 */}
        <div className="mb-4 md:mb-6">
          <XiaoZhaZha mood="happy" size={120} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2">
          你好，{profile?.name}！
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          选择适合你的游戏模式
        </p>

        {/* 年龄段选择 */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 max-w-2xl w-full px-4">
          {/* 幼儿版 */}
          <button
            onClick={() => handleSelectAgeGroup('toddler')}
            className="flex-1 touch-target-xl animate-pop-in flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-golden/20 to-coral/20 border-4 border-golden/40 hover:border-golden transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            style={{ animationDelay: '0.1s' }}
          >
            <span className="text-7xl md:text-8xl">🧸</span>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-black text-foreground block">幼儿版</span>
              <span className="text-base md:text-lg text-muted-foreground">3-6岁</span>
            </div>
            <ul className="text-sm md:text-base text-muted-foreground text-left space-y-2 mt-2">
              <li>✨ 超大按钮，轻松点击</li>
              <li>🎵 更多语音引导</li>
              <li>🎨 简单有趣的画面</li>
              <li>⏱️ 没有时间限制</li>
            </ul>
          </button>

          {/* 儿童版 */}
          <button
            onClick={() => handleSelectAgeGroup('child')}
            className="flex-1 touch-target-xl animate-pop-in flex flex-col items-center gap-4 p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-sky/20 border-4 border-primary/40 hover:border-primary transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            style={{ animationDelay: '0.2s' }}
          >
            <span className="text-7xl md:text-8xl">🚀</span>
            <div className="text-center">
              <span className="text-2xl md:text-3xl font-black text-foreground block">儿童版</span>
              <span className="text-base md:text-lg text-muted-foreground">7-10岁</span>
            </div>
            <ul className="text-sm md:text-base text-muted-foreground text-left space-y-2 mt-2">
              <li>📚 丰富的文字内容</li>
              <li>🧩 更有挑战的游戏</li>
              <li>🏆 解锁更多成就</li>
              <li>⚡ 趣味时间挑战</li>
            </ul>
          </button>
        </div>

        {/* 提示 */}
        <p className="text-sm text-muted-foreground mt-8 text-center max-w-md">
          💡 提示：之后可以在设置中随时切换模式
        </p>
      </div>
    );
  }

  // 档案选择界面
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky/20 via-background to-golden/10 p-4 md:p-8">
      {/* 跳过链接 - 无障碍 */}
      <a href="#profiles" className="skip-link">跳转到档案选择</a>

      {/* 标题 */}
      <div className="animate-pop-in mb-4 md:mb-6">
        <XiaoZhaZha mood="waving" size={140} />
      </div>
      <h1 className="text-4xl md:text-6xl font-black text-foreground mb-2 animate-pop-in" style={{ animationDelay: '0.1s' }}>
        🚧 道闸乐园
      </h1>
      <p className="text-lg md:text-2xl text-muted-foreground mb-8 md:mb-10 animate-pop-in" style={{ animationDelay: '0.2s' }}>
        Barrier Buddies Adventure
      </p>

      {/* 选择提示 */}
      <p id="profiles" className="text-xl md:text-2xl font-bold text-foreground mb-6 md:mb-8 animate-pop-in" style={{ animationDelay: '0.3s' }}>
        选择你的档案 👇
      </p>

      {/* 3个孩子档案 */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-10">
        {state.profiles.map((profile, i) => (
          <button
            key={profile.id}
            onClick={() => handleSelectProfile(profile.id)}
            className="touch-target-lg animate-pop-in flex flex-col items-center gap-3 md:gap-4 p-6 md:p-8 rounded-3xl bg-card border-4 border-primary/30 hover:border-primary hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[140px] md:min-w-[180px]"
            style={{ animationDelay: `${0.4 + i * 0.1}s` }}
            aria-label={`选择${profile.name}的档案`}
          >
            <span className="text-6xl md:text-7xl" role="img" aria-label="头像">{profile.avatar}</span>
            <span className="text-xl md:text-2xl font-bold text-card-foreground">{profile.name}</span>
            <span className="text-sm md:text-base text-muted-foreground flex items-center gap-1">
              ⭐ {profile.stars}
            </span>
            {profile.ageGroup && (
              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {profile.ageGroup === 'toddler' ? '🧸 幼儿版' : '🚀 儿童版'}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileSelect;
