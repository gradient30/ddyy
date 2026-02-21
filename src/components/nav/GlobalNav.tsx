import React from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { playClick } from '@/lib/sound';

const GlobalNav: React.FC = () => {
  const { currentProfile, timerSeconds, logout } = useGame();
  const navigate = useNavigate();
  const PLAY_DURATION = 15 * 60;
  const progress = Math.min((timerSeconds / PLAY_DURATION) * 100, 100);
  const remaining = PLAY_DURATION - timerSeconds;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;

  const handleHome = () => {
    playClick();
    navigate('/');
  };

  const handleLogout = () => {
    playClick();
    logout();
    navigate('/');
  };

  if (!currentProfile) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-3 md:px-6 py-2 md:py-3 flex items-center gap-3 md:gap-4">
      {/* 回家按钮 */}
      <button onClick={handleHome} className="touch-target rounded-2xl bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all px-3 py-1 text-2xl md:text-3xl" aria-label="回到首页">
        🏠
      </button>

      {/* 彩虹计时进度条 */}
      <div className="flex-1 flex flex-col gap-0.5">
        <div className="h-3 md:h-4 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full rainbow-bar transition-all duration-1000"
            style={{ width: `${100 - progress}%` }}
          />
        </div>
        <span className="text-xs md:text-sm font-bold text-muted-foreground text-center">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      {/* 星星 */}
      <div className="flex items-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-2xl bg-golden/20">
        <span className="text-lg md:text-xl">⭐</span>
        <span className="font-bold text-sm md:text-base text-foreground">{currentProfile.stars}</span>
      </div>

      {/* 头像/退出 */}
      <button onClick={handleLogout} className="touch-target text-3xl md:text-4xl" aria-label="切换档案">
        {currentProfile.avatar}
      </button>
    </div>
  );
};

export default GlobalNav;
