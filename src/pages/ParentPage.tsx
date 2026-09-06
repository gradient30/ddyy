import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { playClick } from '@/lib/sound';

const CORRECT_PIN = '1234';

const ParentPage: React.FC = () => {
  const { state, updateSettings } = useGame();
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<'overview' | 'words' | 'settings'>('overview');

  const handlePinSubmit = () => {
    if (pin === CORRECT_PIN) {
      playClick();
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handlePinKey = (digit: string) => {
    playClick();
    if (digit === 'del') {
      setPin(prev => prev.slice(0, -1));
      return;
    }
    const newPin = pin + digit;
    setPin(newPin);
    if (newPin.length === 4) {
      setTimeout(() => {
        if (newPin === CORRECT_PIN) {
          setAuthed(true);
          setError(false);
        } else {
          setError(true);
          setPin('');
        }
      }, 200);
    }
  };

  // PIN entry screen
  if (!authed) {
    return (
      <div className="paper-page min-h-screen flex flex-col items-center justify-center p-6">
        <button onClick={() => { playClick(); navigate('/'); }} className="absolute top-4 left-4 text-3xl touch-target">🏠</button>
        <div className="text-6xl mb-4">🔑</div>
        <h1 className="text-2xl font-black text-foreground mb-2">家长区</h1>
        <p className="text-muted-foreground mb-6">请输入密码进入</p>

        {/* PIN dots */}
        <div className="flex gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
              i < pin.length ? 'bg-primary border-primary scale-110' : 'border-muted-foreground'
            }`} />
          ))}
        </div>

        {error && <p className="text-destructive font-bold mb-4 animate-shake">密码错误，请重试</p>}

        {/* Number pad */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px]">
          {['1','2','3','4','5','6','7','8','9','','0','del'].map((d, i) => (
            d === '' ? <div key={i} /> :
            <button
              key={i}
              onClick={() => handlePinKey(d)}
              className="w-[70px] h-[70px] rounded-2xl bg-card border border-border text-2xl font-bold text-foreground hover:bg-muted active:scale-95 transition-all touch-target shadow-sm"
            >
              {d === 'del' ? '⌫' : d}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-6">默认密码：1234</p>
      </div>
    );
  }

  // Authed parent dashboard
  const profiles = state.profiles;
  const { globalSettings } = state;

  return (
    <div className="paper-page min-h-screen p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { playClick(); navigate('/'); }} className="text-3xl touch-target">🏠</button>
        <h1 className="text-2xl font-black text-foreground">👨‍👩‍👧 家长区</h1>
        <button onClick={() => { playClick(); setAuthed(false); setPin(''); }} className="text-sm text-muted-foreground underline">退出</button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {([['overview', '📊 总览'], ['words', '📖 词汇'], ['settings', '⚙️ 设置']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { playClick(); setTab(key); }}
            className={`px-4 py-2 rounded-2xl font-bold text-sm transition-all ${tab === key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-4 max-w-lg mx-auto">
          {profiles.map(p => (
            <div key={p.id} className="bg-card rounded-3xl p-5 border border-border shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{p.avatar}</span>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">上次游玩: {new Date(p.lastPlayedAt).toLocaleDateString('zh-CN')}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                年龄层：{p.ageBand === 'sprout' ? '萌芽 4–5岁' : p.ageBand === 'builder' ? '建构 6–7岁' : '探索 5–6岁'}
                · 已走 {p.completedStations?.length ?? 0} 站
                · 本领 {p.knowledgeIds?.length ?? 0}
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <MiniStat icon="⭐" value={p.stars} label="星星" />
                <MiniStat icon="🏅" value={p.badges.length} label="徽章" />
                <MiniStat icon="📖" value={p.learnedWords.length} label="词汇" />
                <MiniStat icon="📘" value={p.knowledgeIds?.length ?? 0} label="本领" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Words */}
      {tab === 'words' && (
        <div className="space-y-4 max-w-lg mx-auto">
          {profiles.map(p => (
            <div key={p.id} className="bg-card rounded-3xl p-5 border border-border shadow-lg">
              <h3 className="font-bold text-lg text-foreground mb-3">{p.avatar} {p.name} 的词汇本</h3>
              {p.learnedWords.length === 0 ? (
                <p className="text-muted-foreground text-sm">还没有学会的词汇</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {p.learnedWords.map((w, i) => (
                    <span key={i} className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm font-bold">{w}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Settings */}
      {tab === 'settings' && (
        <div className="max-w-lg mx-auto space-y-4">
          <div className="bg-card rounded-3xl p-5 border border-border shadow-lg space-y-4">
            <h3 className="font-bold text-lg text-foreground">⚙️ 全局设置</h3>

            <SettingToggle
              label="🔊 音效"
              value={globalSettings.soundEnabled}
              onChange={v => updateSettings({ soundEnabled: v })}
            />
            <SettingToggle
              label="🗣️ 语音"
              value={globalSettings.voiceEnabled}
              onChange={v => updateSettings({ voiceEnabled: v })}
            />
            <SettingToggle
              label="📳 振动"
              value={globalSettings.vibrationEnabled}
              onChange={v => updateSettings({ vibrationEnabled: v })}
            />
            <SettingToggle
              label="🔲 高对比度"
              value={globalSettings.highContrast}
              onChange={v => updateSettings({ highContrast: v })}
            />
            <SettingToggle
              label="⏰ 定时休息"
              value={globalSettings.timerEnabled}
              onChange={v => updateSettings({ timerEnabled: v })}
            />
            <SettingToggle
              label="开放全部站点（跳过小路顺序）"
              value={globalSettings.unlockAllStations}
              onChange={v => updateSettings({ unlockAllStations: v })}
            />
          </div>

          {/* Data export */}
          <div className="bg-card rounded-3xl p-5 border border-border shadow-lg">
            <h3 className="font-bold text-lg text-foreground mb-3">💾 数据管理</h3>
            <button
              onClick={() => {
                playClick();
                const data = JSON.stringify(state, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `barrier-buddies-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="w-full bg-primary text-primary-foreground rounded-2xl py-3 font-bold text-lg hover:opacity-90 active:scale-95 transition-all touch-target"
            >
              📤 导出数据
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MiniStat: React.FC<{ icon: string; value: number; label: string }> = ({ icon, value, label }) => (
  <div className="bg-muted/50 rounded-xl p-2">
    <div className="text-lg">{icon}</div>
    <div className="font-bold text-foreground">{value}</div>
    <div className="text-[10px] text-muted-foreground">{label}</div>
  </div>
);

const SettingToggle: React.FC<{ label: string; value: boolean; onChange: (v: boolean) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
    <span className="font-bold text-foreground">{label}</span>
    <button
      onClick={() => { playClick(); onChange(!value); }}
      className={`w-14 h-8 rounded-full transition-all relative ${value ? 'bg-primary' : 'bg-muted'}`}
    >
      <div className={`w-6 h-6 rounded-full bg-card shadow absolute top-1 transition-all ${value ? 'left-7' : 'left-1'}`} />
    </button>
  </div>
);

export default ParentPage;
