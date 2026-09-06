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
    <div className="fixed left-0 right-0 z-50 h-12 bg-card/90 backdrop-blur-md border-b border-border px-2 md:px-4 flex items-center gap-2" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <button onClick={handleHome} className="rounded-xl bg-primary/10 hover:bg-primary/20 active:scale-95 transition-all w-10 h-10 text-xl" aria-label="回到首页">
        🏠
      </button>

      <div className="flex-1 flex items-center gap-2 min-w-0">
        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-golden transition-all duration-1000"
            style={{ width: `${100 - progress}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground tabular-nums w-10 text-right">
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-golden/20">
        <span className="text-sm">⭐</span>
        <span className="font-bold text-sm text-foreground">{currentProfile.stars}</span>
      </div>

      <button onClick={handleLogout} className="w-10 h-10 text-2xl" aria-label="切换档案">
        {currentProfile.avatar}
      </button>
    </div>
  );
};

export default GlobalNav;
