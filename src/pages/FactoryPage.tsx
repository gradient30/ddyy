import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { PartIcon } from '@/components/parts/PartIcons';
import { PartTile } from '@/components/parts/PartTile';
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
  const baseId = slots.base;
  const pillarId = slots.pillar;
  const armId = slots.arm;
  const motorId = slots.motor;
  const sensorId = slots.sensor;
  const lightId = slots.light;
  const panelId = slots.panel;
  const paintId = slots.paint;
  const decoId = slots.deco;

  const paintFill = paintId === 'paint2'
    ? 'hsl(210,80%,52%)'
    : paintId === 'paint3'
      ? 'url(#factoryRainbow)'
      : 'hsl(0,72%,56%)';
  const stripeFill = paintId === 'paint2' ? 'hsl(48,95%,58%)' : '#FFF8EE';

  return (
    <svg viewBox="0 0 280 200" className="w-full max-w-md mx-auto">
      <defs>
        <linearGradient id="factoryRainbow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(0,80%,60%)" />
          <stop offset="25%" stopColor="hsl(54,100%,50%)" />
          <stop offset="50%" stopColor="hsl(142,69%,58%)" />
          <stop offset="75%" stopColor="hsl(195,100%,50%)" />
          <stop offset="100%" stopColor="hsl(270,70%,65%)" />
        </linearGradient>
      </defs>
      <rect x="0" y="172" width="280" height="28" rx="6" fill="hsl(142,32%,72%)" />
      <rect x="0" y="186" width="280" height="8" fill="hsl(30,18%,42%)" />

      {baseId === 'base2' ? (
        <ellipse cx="70" cy="170" rx="42" ry="16" fill="#5B6570" />
      ) : baseId ? (
        <rect x="28" y="154" width="84" height="24" rx="6" fill="#5B6570" />
      ) : null}

      {pillarId === 'pillar2' ? (
        <rect x="54" y="62" width="32" height="96" rx="16" fill="#6B7580" />
      ) : pillarId ? (
        <rect x="52" y="62" width="36" height="96" rx="6" fill="#6B7580" />
      ) : null}

      {motorId === 'motor2' ? (
        <>
          <rect x="42" y="46" width="56" height="22" rx="3" fill="#1E4A7A" />
          {[50, 62, 74, 86].map((x) => <line key={x} x1={x} y1="48" x2={x} y2="66" stroke="#49C2E8" strokeWidth="2" />)}
          <circle cx="70" cy="78" r="16" fill="#3AA0C7" />
        </>
      ) : motorId ? (
        <>
          <circle cx="70" cy="78" r="20" fill="#3AA0C7" />
          <circle cx="70" cy="78" r="8" fill="#F4D35E" />
        </>
      ) : null}

      {armId && (
        <g style={{ transformOrigin: '70px 78px', transition: 'transform 1s cubic-bezier(0.34,1.56,0.64,1)', transform: isRunning ? 'rotate(-85deg)' : 'rotate(0deg)' }}>
          {armId === 'arm3' ? (
            <>
              <rect x="70" y="70" width="170" height="6" rx="2" fill="#5B6570" />
              <rect x="70" y="88" width="170" height="6" rx="2" fill="#5B6570" />
              {[88, 108, 128, 148, 168, 188, 208].map((x) => (
                <rect key={x} x={x} y="70" width="7" height="24" rx="2" fill="#7A8490" />
              ))}
            </>
          ) : armId === 'arm2' ? (
            <>
              <rect x="70" y="70" width="88" height="16" rx="8" fill={paintFill} />
              <rect x="150" y="46" width="70" height="14" rx="7" fill={paintFill} transform="rotate(-22 150 53)" />
              <circle cx="156" cy="78" r="7" fill="#4E575F" />
            </>
          ) : (
            <>
              <rect x="70" y="70" width="176" height="16" rx="8" fill={paintFill} />
              {[96, 120, 144, 168, 192, 216].map((x) => (
                <rect key={x} x={x} y="70" width="10" height="16" fill={stripeFill} />
              ))}
              <circle cx="238" cy="78" r="9" fill="#F4D35E" />
            </>
          )}
        </g>
      )}

      {sensorId === 'sensor2' ? (
        <g>
          <path d="M48 108 h10 v16 a8 8 0 0 1-10 0z" fill="#E25B4C" />
          <path d="M62 108 h10 v16 a8 8 0 0 1-10 0z" fill="#3AA0C7" />
        </g>
      ) : sensorId === 'sensor3' ? (
        <g>
          <rect x="52" y="104" width="24" height="16" rx="4" fill="#3D4450" />
          <circle cx="64" cy="112" r="5" fill="#49C2E8" />
        </g>
      ) : sensorId ? (
        <circle cx="64" cy="112" r="9" fill="#E25B4C" className={isRunning ? 'animate-glow-pulse' : ''} />
      ) : null}

      {lightId === 'light2' ? (
        <g>
          {['#E25B4C', '#F4D35E', '#4CAF7A'].map((c, i) => (
            <circle key={c} cx={56 + i * 12} cy="48" r="6" fill={c} />
          ))}
        </g>
      ) : lightId ? (
        <>
          <circle cx="70" cy="46" r="10" fill={isRunning ? '#4CAF7A' : '#E25B4C'} />
          <circle cx="70" cy="46" r="4" fill="white" opacity="0.55" />
        </>
      ) : null}

      {panelId === 'panel2' ? (
        <rect x="88" y="118" width="28" height="22" rx="4" fill="#4E575F" />
      ) : panelId === 'panel3' ? (
        <rect x="92" y="114" width="16" height="28" rx="6" fill="#5B6570" />
      ) : panelId ? (
        <g>
          <rect x="88" y="116" width="30" height="24" rx="4" fill="#4E575F" />
          <circle cx="97" cy="128" r="4" fill="#4CAF7A" />
          <circle cx="109" cy="128" r="4" fill="#E25B4C" />
        </g>
      ) : null}

      {decoId === 'sticker3' && <circle cx="200" cy="54" r="12" fill="#F4D35E" />}
      {decoId === 'sticker2' && <rect x="188" y="42" width="24" height="24" rx="8" fill="#49C2E8" />}
      {decoId === 'sticker1' && <rect x="186" y="46" width="28" height="14" rx="4" fill="#F4D35E" />}
    </svg>
  );
};

const FactoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge, addKnowledge, completeStation } = useGame();
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
    const newSlots = { ...slots, [step.slot]: step.id };
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
      addBadge('engineer');
      addKnowledge('assemble');
      completeStation('engineer');
      speak('太棒了！道闸建好了！', 'zh-CN', 0.85);
    }
  };

  const handleFreeDrop = useCallback((slot: string, partId: string) => {
    setSlots(prev => ({ ...prev, [slot]: partId }));
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
    addBadge('creative-builder');
    addKnowledge('assemble');
    completeStation('engineer');
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
                <PartIcon id={t.id === 'folding' ? 'arm2' : t.id === 'fence' ? 'arm3' : 'arm1'} size={72} />
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
              <div className="flex justify-center mb-2">
                <PartIcon id={buildSteps[tutorialStep].id} size={88} />
              </div>
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
                  <span key={key} className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${slots[key] ? 'bg-grass/20 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {slots[key] ? <PartIcon id={slots[key]} size={22} /> : <span>❓</span>} {name}
                  </span>
                ))}
              </div>
            </div>

            {/* 零件库 */}
            <div className="bg-card rounded-2xl shadow-md p-4 mb-4">
              <h3 className="text-lg font-bold text-foreground mb-3">🧰 零件库（点一下就能装上）</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {freeParts.map(part => (
                  <PartTile
                    key={part.id}
                    id={part.id}
                    name={part.name}
                    selected={slots[part.slot] === part.id || dragPart === part.id}
                    onClick={() => { handleFreeDrop(part.slot, part.id); setMascotMsg(`安装了${part.name}！`); }}
                  />
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
