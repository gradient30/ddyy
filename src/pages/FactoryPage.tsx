import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick, playSuccess, playStarCollect, playBarrierLift, playError, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

type BarrierType = 'straight' | 'folding' | 'fence';
type BuildStep = { id: string; name: string; emoji: string; desc: string; slot: string };

const barrierTypes: { id: BarrierType; name: string; emoji: string; desc: string }[] = [
  { id: 'straight', name: '直臂道闸', emoji: '➖', desc: '杆子直直的，最常见！' },
  { id: 'folding', name: '折臂道闸', emoji: '📐', desc: '杆子会折叠，适合矮空间！' },
  { id: 'fence', name: '围栏道闸', emoji: '🔲', desc: '像栅栏一样，更安全！' },
];

const buildSteps: BuildStep[] = [
  { id: 'base', name: '底座', emoji: '🧱', desc: '先装一个稳稳的底座', slot: 'base' },
  { id: 'pillar', name: '立柱', emoji: '🏛️', desc: '竖起坚固的立柱', slot: 'pillar' },
  { id: 'motor', name: '电机', emoji: '⚙️', desc: '安装电机，给道闸力量', slot: 'motor' },
  { id: 'arm', name: '杆子', emoji: '🦾', desc: '装上长长的杆子', slot: 'arm' },
  { id: 'sensor', name: '传感器', emoji: '👁️', desc: '装传感器，能看到车来了', slot: 'sensor' },
  { id: 'light', name: '指示灯', emoji: '🚦', desc: '装上红绿灯，更安全', slot: 'light' },
  { id: 'panel', name: '控制面板', emoji: '🖥️', desc: '安装控制面板', slot: 'panel' },
  { id: 'paint', name: '涂装', emoji: '🎨', desc: '最后涂上漂亮的颜色！', slot: 'paint' },
];

const freeParts = [
  { id: 'base1', name: '方形底座', emoji: '🧱', slot: 'base' },
  { id: 'base2', name: '圆形底座', emoji: '⭕', slot: 'base' },
  { id: 'pillar1', name: '方柱', emoji: '🏛️', slot: 'pillar' },
  { id: 'pillar2', name: '圆柱', emoji: '🗼', slot: 'pillar' },
  { id: 'motor1', name: '普通电机', emoji: '⚙️', slot: 'motor' },
  { id: 'motor2', name: '太阳能电机', emoji: '☀️', slot: 'motor' },
  { id: 'arm1', name: '直杆', emoji: '➖', slot: 'arm' },
  { id: 'arm2', name: '折叠杆', emoji: '📐', slot: 'arm' },
  { id: 'arm3', name: '栅栏杆', emoji: '🔲', slot: 'arm' },
  { id: 'sensor1', name: '红外传感器', emoji: '👁️', slot: 'sensor' },
  { id: 'sensor2', name: '地磁传感器', emoji: '🧲', slot: 'sensor' },
  { id: 'sensor3', name: '摄像头', emoji: '📷', slot: 'sensor' },
  { id: 'light1', name: '红绿灯', emoji: '🚦', slot: 'light' },
  { id: 'light2', name: 'LED灯带', emoji: '💡', slot: 'light' },
  { id: 'panel1', name: '按钮面板', emoji: '🖥️', slot: 'panel' },
  { id: 'panel2', name: '刷卡器', emoji: '💳', slot: 'panel' },
  { id: 'panel3', name: '遥控器', emoji: '📡', slot: 'panel' },
  { id: 'paint1', name: '红白条纹', emoji: '🔴', slot: 'paint' },
  { id: 'paint2', name: '蓝黄条纹', emoji: '🔵', slot: 'paint' },
  { id: 'paint3', name: '彩虹色', emoji: '🌈', slot: 'paint' },
  { id: 'sticker1', name: '反光贴', emoji: '✨', slot: 'deco' },
  { id: 'sticker2', name: '小闸闸贴纸', emoji: '🚧', slot: 'deco' },
  { id: 'sticker3', name: '笑脸贴纸', emoji: '😊', slot: 'deco' },
];

const slotNames: Record<string, string> = {
  base: '底座', pillar: '立柱', motor: '电机', arm: '杆子',
  sensor: '传感器', light: '指示灯', panel: '控制面板', paint: '涂装', deco: '装饰',
};

const BuiltBarrierSVG: React.FC<{ slots: Record<string, string>; isRunning: boolean }> = ({ slots, isRunning }) => {
  const hasBase = !!slots.base;
  const hasPillar = !!slots.pillar;
  const hasArm = !!slots.arm;
  const hasMotor = !!slots.motor;
  const hasSensor = !!slots.sensor;
  const hasLight = !!slots.light;
  const paintColor = slots.paint === '🔴' ? 'hsl(0,72%,60%)' : slots.paint === '🔵' ? 'hsl(210,80%,55%)' : slots.paint === '🌈' ? 'url(#rainbow)' : 'hsl(0,72%,60%)';

  return (
    <svg viewBox="0 0 200 160" className="w-full max-w-xs mx-auto">
      <defs>
        <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(0,80%,60%)" />
          <stop offset="25%" stopColor="hsl(54,100%,50%)" />
          <stop offset="50%" stopColor="hsl(142,69%,58%)" />
          <stop offset="75%" stopColor="hsl(195,100%,50%)" />
          <stop offset="100%" stopColor="hsl(270,70%,65%)" />
        </linearGradient>
      </defs>
      {/* Ground */}
      <rect x="0" y="140" width="200" height="20" rx="4" fill="hsl(142,30%,75%)" />
      {/* Base */}
      {hasBase && <rect x="30" y="120" width="40" height="20" rx="4" fill="hsl(220,15%,45%)" />}
      {/* Pillar */}
      {hasPillar && <rect x="40" y="50" width="20" height="70" rx="3" fill="hsl(220,15%,50%)" />}
      {/* Motor */}
      {hasMotor && <circle cx="50" cy="55" r="10" fill="hsl(195,100%,50%)" opacity="0.8" />}
      {/* Arm */}
      {hasArm && (
        <g style={{ transformOrigin: '50px 55px', transition: 'transform 1s cubic-bezier(0.34,1.56,0.64,1)', transform: isRunning ? 'rotate(-85deg)' : 'rotate(0deg)' }}>
          <rect x="50" y="50" width="120" height="10" rx="5" fill={paintColor} />
          {[70, 95, 120, 145].map(x => <rect key={x} x={x} y="50" width="6" height="10" rx="1" fill="white" opacity="0.5" />)}
          <circle cx="165" cy="55" r="7" fill="hsl(54,100%,50%)" />
        </g>
      )}
      {/* Sensor */}
      {hasSensor && <circle cx="50" cy="75" r="5" fill="hsl(0,80%,60%)" className={isRunning ? 'animate-glow-pulse' : ''} />}
      {/* Light */}
      {hasLight && (
        <>
          <circle cx="50" cy="40" r="6" fill={isRunning ? 'hsl(142,69%,58%)' : 'hsl(0,72%,60%)'} />
          <circle cx="50" cy="40" r="3" fill="white" opacity="0.5" />
        </>
      )}
    </svg>
  );
};

const FactoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge } = useGame();
  const [mode, setMode] = useState<'select' | 'tutorial' | 'free' | 'done'>('select');
  const [selectedType, setSelectedType] = useState<BarrierType>('straight');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [dragPart, setDragPart] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mascotMsg, setMascotMsg] = useState('选择一种模式开始建造吧！');
  const [typeSelected, setTypeSelected] = useState(false);

  const handleStartTutorial = (type: BarrierType) => {
    playClick();
    setSelectedType(type);
    setMode('tutorial');
    setTypeSelected(true);
    setTutorialStep(0);
    setSlots({});
    setMascotMsg(buildSteps[0].desc);
    speak(buildSteps[0].desc, 'zh-CN', 0.85);
  };

  const handleTutorialPlace = () => {
    const step = buildSteps[tutorialStep];
    const newSlots = { ...slots, [step.slot]: step.emoji };
    setSlots(newSlots);
    playStarCollect();
    vibrate(30);

    if (tutorialStep < buildSteps.length - 1) {
      const next = tutorialStep + 1;
      setTutorialStep(next);
      setMascotMsg(buildSteps[next].desc);
      speak(buildSteps[next].desc, 'zh-CN', 0.85);
    } else {
      setMode('done');
      setMascotMsg('太棒了！道闸建好了！试试运行吧！');
      playSuccess();
      addStars(5);
      addBadge('🏗️ 小小工程师');
      speak('太棒了！道闸建好了！', 'zh-CN', 0.85);
    }
  };

  const handleFreeDrop = useCallback((slot: string, emoji: string) => {
    setSlots(prev => ({ ...prev, [slot]: emoji }));
    playStarCollect();
    vibrate(20);
  }, []);

  const handleFreeComplete = () => {
    const requiredSlots = ['base', 'pillar', 'motor', 'arm'];
    const filled = requiredSlots.filter(s => slots[s]);
    if (filled.length < requiredSlots.length) {
      playError();
      setMascotMsg(`还缺${requiredSlots.filter(s => !slots[s]).map(s => slotNames[s]).join('、')}哦！`);
      return;
    }
    setMode('done');
    setMascotMsg('你自己组装了一个道闸！太厉害了！');
    playSuccess();
    addStars(8);
    addBadge('🔧 创意建造师');
    speak('你自己组装了一个道闸！太厉害了！', 'zh-CN', 0.85);
  };

  const handleTestRun = () => {
    playClick();
    playBarrierLift();
    setIsRunning(true);
    setMascotMsg('看！道闸升起来了！🎉');
    setTimeout(() => {
      setIsRunning(false);
      setMascotMsg('道闸落下来了。再试一次？');
    }, 3000);
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-orange-warm/15 via-background to-golden/10 pt-20 pb-8 px-4">
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-black text-foreground">🏗️ 建造工厂</h1>
        </div>

        {/* 小闸闸 + 提示 */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <XiaoZhaZha mood={mode === 'done' ? 'excited' : 'happy'} size={50} />
          <div className="bg-card rounded-2xl px-4 py-2 shadow-sm max-w-xs">
            <p className="text-sm font-bold text-foreground">{mascotMsg}</p>
          </div>
        </div>

        {/* 模式选择 */}
        {mode === 'select' && (
          <div className="max-w-md mx-auto space-y-4 animate-pop-in">
            <button
              onClick={() => { playClick(); setMode('tutorial'); setTypeSelected(false); setMascotMsg('先选一种道闸类型吧！'); }}
              className="w-full touch-target rounded-3xl bg-gradient-to-r from-sky to-grass text-primary-foreground p-6 text-left shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="text-3xl mb-1">📖</div>
              <h2 className="text-2xl font-black">教学模式</h2>
              <p className="text-sm opacity-80">一步步学习组装道闸</p>
            </button>
            <button
              onClick={() => { playClick(); setMode('free'); setSlots({}); setMascotMsg('拖拽零件到对应位置吧！'); }}
              className="w-full touch-target rounded-3xl bg-gradient-to-r from-golden to-orange-warm text-primary-foreground p-6 text-left shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <div className="text-3xl mb-1">🔧</div>
              <h2 className="text-2xl font-black">自由建造</h2>
              <p className="text-sm opacity-80">自己选零件组装道闸</p>
            </button>
          </div>
        )}

        {/* 教学 - 选类型 */}
        {mode === 'tutorial' && !typeSelected && (
          <div className="max-w-md mx-auto grid gap-3 animate-pop-in">
            {barrierTypes.map(t => (
              <button key={t.id} onClick={() => handleStartTutorial(t.id)}
                className="touch-target rounded-2xl bg-card shadow-md p-4 flex items-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                <span className="text-4xl">{t.emoji}</span>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* 教学模式 - 步骤 */}
        {mode === 'tutorial' && typeSelected && (
          <div className="max-w-md mx-auto animate-pop-in">
            {/* 进度 */}
            <div className="flex gap-1 mb-4 justify-center">
              {buildSteps.map((s, i) => (
                <div key={s.id} className={`w-8 h-2 rounded-full transition-all ${i <= tutorialStep ? 'bg-sky' : 'bg-muted'}`} />
              ))}
            </div>

            {/* 预览 */}
            <div className="bg-card rounded-3xl shadow-lg p-4 mb-4">
              <BuiltBarrierSVG slots={slots} isRunning={false} />
            </div>

            {/* 当前步骤 */}
            <div className="bg-card rounded-2xl shadow-md p-5 text-center">
              <p className="text-sm text-muted-foreground mb-1">第 {tutorialStep + 1}/{buildSteps.length} 步</p>
              <div className="text-5xl mb-2">{buildSteps[tutorialStep].emoji}</div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{buildSteps[tutorialStep].name}</h3>
              <p className="text-base text-muted-foreground mb-4">{buildSteps[tutorialStep].desc}</p>
              <button onClick={handleTutorialPlace}
                className="touch-target rounded-2xl bg-gradient-to-r from-sky to-grass text-primary-foreground px-8 py-4 text-xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
                ✅ 安装 {buildSteps[tutorialStep].name}！
              </button>
            </div>
          </div>
        )}

        {/* 自由建造 */}
        {mode === 'free' && (
          <div className="max-w-lg mx-auto animate-pop-in">
            {/* 预览 */}
            <div className="bg-card rounded-3xl shadow-lg p-4 mb-4">
              <BuiltBarrierSVG slots={slots} isRunning={false} />
              {/* 插槽指示 */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {Object.entries(slotNames).map(([key, name]) => (
                  <span key={key} className={`px-3 py-1 rounded-full text-xs font-bold ${slots[key] ? 'bg-grass/20 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {slots[key] || '❓'} {name}
                  </span>
                ))}
              </div>
            </div>

            {/* 零件库 */}
            <div className="bg-card rounded-2xl shadow-md p-4 mb-4">
              <h3 className="text-lg font-bold text-foreground mb-2">🧰 零件库（点击安装）</h3>
              <div className="grid grid-cols-4 gap-2">
                {freeParts.map(part => (
                  <button key={part.id}
                    onClick={() => { handleFreeDrop(part.slot, part.emoji); setMascotMsg(`安装了${part.name}！`); }}
                    className={`rounded-xl p-2 text-center transition-all hover:scale-110 active:scale-90 ${
                      dragPart === part.id ? 'ring-2 ring-sky bg-sky/20' : 'bg-muted/50 hover:bg-muted'
                    }`}>
                    <div className="text-2xl">{part.emoji}</div>
                    <div className="text-[10px] font-bold text-foreground truncate">{part.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={handleFreeComplete}
                className="touch-target rounded-2xl bg-gradient-to-r from-sky to-grass text-primary-foreground px-6 py-3 text-lg font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
                ✅ 组装完成！
              </button>
              <button onClick={() => { playClick(); setSlots({}); setMascotMsg('重新开始！'); }}
                className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
                🔄 重来
              </button>
            </div>
          </div>
        )}

        {/* 完成 */}
        {mode === 'done' && (
          <div className="max-w-md mx-auto animate-pop-in text-center">
            <div className="bg-card rounded-3xl shadow-lg p-6 mb-4">
              <h2 className="text-2xl font-black text-foreground mb-4">🎉 道闸建好了！</h2>
              <BuiltBarrierSVG slots={slots} isRunning={isRunning} />
              <div className="flex gap-3 justify-center mt-4">
                <button onClick={handleTestRun}
                  className="touch-target rounded-2xl bg-gradient-to-r from-golden to-orange-warm text-primary-foreground px-6 py-3 text-lg font-black shadow-lg hover:scale-105 active:scale-95 transition-all">
                  🚧 试运行！
                </button>
                <button onClick={() => { playClick(); setMode('select'); setSlots({}); setTypeSelected(false); setMascotMsg('再建一个吧！'); }}
                  className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
                  🔄 再建一个
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 返回 */}
        <div className="flex justify-center mt-6">
          <button onClick={() => { playClick(); navigate('/'); }} className="touch-target rounded-2xl bg-muted hover:bg-muted/80 px-6 py-3 text-lg font-bold transition-all active:scale-95">
            🏠 回到地图
          </button>
        </div>
      </div>
    </>
  );
};

export default FactoryPage;
