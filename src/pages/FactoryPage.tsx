import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { MechanicalBarrier } from '@/components/parts/MechanicalBarrier';
import { PartIcon } from '@/components/parts/PartIcons';
import { PartTile } from '@/components/parts/PartTile';
import { playBarrierDrop, playBarrierLift, playClick, playError, playPlacePart, playSuccess, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

type BarrierType = 'straight' | 'folding' | 'fence';
type BuildStep = { id: string; name: string; desc: string; slot: string };

const barrierTypes: { id: BarrierType; name: string; desc: string; arm: string }[] = [
  { id: 'straight', name: '直臂道闸', desc: '杆子绕电机轴转上去', arm: 'arm1' },
  { id: 'folding', name: '折臂道闸', desc: '中间有铰链，会折起来', arm: 'arm2' },
  { id: 'fence', name: '围栏道闸', desc: '整排栅栏一起抬起来', arm: 'arm3' },
];

const buildSteps: BuildStep[] = [
  { id: 'base', name: '底座', desc: '先用螺栓把底座固定在地面', slot: 'base' },
  { id: 'pillar', name: '机柜', desc: '立起机柜，里面藏着电线', slot: 'pillar' },
  { id: 'motor', name: '电机', desc: '把电机装在转轴上', slot: 'motor' },
  { id: 'arm', name: '杆子', desc: '杆子套进转轴，才能抬起来', slot: 'arm' },
  { id: 'sensor', name: '传感器', desc: '装上小眼睛，看见车来了', slot: 'sensor' },
  { id: 'light', name: '指示灯', desc: '灯装在机柜顶上', slot: 'light' },
  { id: 'panel', name: '控制面板', desc: '面板装在机柜门上', slot: 'panel' },
  { id: 'paint', name: '涂装', desc: '杆子刷上颜色，晚上也能看见', slot: 'paint' },
];

const freeParts = [
  { id: 'base1', name: '方形底座', slot: 'base' },
  { id: 'base2', name: '圆形底座', slot: 'base' },
  { id: 'pillar1', name: '方柜', slot: 'pillar' },
  { id: 'pillar2', name: '圆柜', slot: 'pillar' },
  { id: 'motor1', name: '普通电机', slot: 'motor' },
  { id: 'motor2', name: '太阳能电机', slot: 'motor' },
  { id: 'arm1', name: '直杆', slot: 'arm' },
  { id: 'arm2', name: '折叠杆', slot: 'arm' },
  { id: 'arm3', name: '栅栏杆', slot: 'arm' },
  { id: 'sensor1', name: '红外传感器', slot: 'sensor' },
  { id: 'sensor2', name: '地磁传感器', slot: 'sensor' },
  { id: 'sensor3', name: '摄像头', slot: 'sensor' },
  { id: 'light1', name: '红绿灯', slot: 'light' },
  { id: 'light2', name: 'LED灯带', slot: 'light' },
  { id: 'panel1', name: '按钮面板', slot: 'panel' },
  { id: 'panel2', name: '刷卡器', slot: 'panel' },
  { id: 'panel3', name: '遥控器', slot: 'panel' },
  { id: 'paint1', name: '红白条纹', slot: 'paint' },
  { id: 'paint2', name: '蓝黄条纹', slot: 'paint' },
  { id: 'paint3', name: '彩虹色', slot: 'paint' },
  { id: 'sticker1', name: '反光贴', slot: 'deco' },
  { id: 'sticker2', name: '小闸闸贴纸', slot: 'deco' },
  { id: 'sticker3', name: '笑脸贴纸', slot: 'deco' },
];

const slotNames: Record<string, string> = {
  base: '底座', pillar: '机柜', motor: '电机', arm: '杆子',
  sensor: '传感器', light: '指示灯', panel: '控制面板', paint: '涂装', deco: '装饰',
};

const FactoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge, addKnowledge, completeStation } = useGame();
  const [mode, setMode] = useState<'select' | 'tutorial' | 'free' | 'done'>('select');
  const [tutorialStep, setTutorialStep] = useState(0);
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [mascotMsg, setMascotMsg] = useState('选一种方式，把道闸装起来');
  const [typeSelected, setTypeSelected] = useState(false);
  const [chosenArm, setChosenArm] = useState('arm1');

  const handleStartTutorial = (type: BarrierType) => {
    playClick();
    const arm = barrierTypes.find(t => t.id === type)?.arm ?? 'arm1';
    setChosenArm(arm);
    setMode('tutorial');
    setTypeSelected(true);
    setTutorialStep(0);
    setSlots({});
    setMascotMsg(buildSteps[0].desc);
    speak(buildSteps[0].desc, 'zh-CN', 0.85);
  };

  const handleTutorialPlace = () => {
    const step = buildSteps[tutorialStep];
    const partId = step.slot === 'arm' ? chosenArm : step.id;
    setSlots(prev => ({ ...prev, [step.slot]: partId }));
    playPlacePart();
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
    playPlacePart();
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
    if (!slots.arm || !slots.motor) {
      playError();
      setMascotMsg('电机和杆子都装好，才能抬起来');
      return;
    }
    playClick();
    playBarrierLift();
    setIsRunning(true);
    setMascotMsg('电机转，杆子绕轴抬起来了');
    setTimeout(() => {
      playBarrierDrop();
      setIsRunning(false);
      setMascotMsg('杆子落到缓冲垫上了。再试一次？');
    }, 2200);
  };

  return (
    <div className="app-stage paper-page">
      <GlobalNav />
      <div className="app-stage-body px-3 md:px-5 pb-3 flex flex-col">
        <div className="flex items-center gap-2 shrink-0 mb-2">
          <button onClick={() => { playClick(); navigate('/'); }} className="kid-btn h-12 min-h-12 px-3 bg-card border border-border" aria-label="回到成长小路">←</button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-black">工程工坊</h1>
            <p className="text-sm font-bold text-foreground/80 truncate">{mascotMsg}</p>
          </div>
          <XiaoZhaZha mood={mode === 'done' ? 'excited' : 'happy'} size={48} />
        </div>

        {(mode === 'tutorial' && typeSelected) || mode === 'free' || mode === 'done' ? (
          <div className="flex-1 min-h-0 overflow-hidden mb-2 bg-[#5C646C]">
            <MechanicalBarrier slots={slots} running={isRunning} className="w-full h-full min-h-[280px] md:min-h-[360px]" />
          </div>
        ) : null}

        {mode === 'select' && (
          <div className="flex-1 min-h-0 overflow-auto w-full grid md:grid-cols-2 gap-3 content-center">
            <button
              onClick={() => { playClick(); setMode('tutorial'); setTypeSelected(false); setMascotMsg('先选一种道闸'); }}
              className="w-full rounded-3xl bg-gradient-to-r from-sky to-grass text-primary-foreground p-5 text-left shadow-lg active:scale-[0.99]"
            >
              <h2 className="text-2xl font-black">一步一步装</h2>
              <p className="text-sm opacity-80">按真实顺序：底座 → 机柜 → 电机 → 杆子</p>
            </button>
            <button
              onClick={() => { playClick(); setMode('free'); setSlots({}); setMascotMsg('点零件，装到机器上'); }}
              className="w-full rounded-3xl bg-gradient-to-r from-golden to-orange-warm text-primary-foreground p-5 text-left shadow-lg active:scale-[0.99]"
            >
              <h2 className="text-2xl font-black">自己选零件</h2>
              <p className="text-sm opacity-80">点一下就卡进对应的位置</p>
            </button>
          </div>
        )}

        {mode === 'tutorial' && !typeSelected && (
          <div className="flex-1 min-h-0 overflow-auto w-full grid md:grid-cols-3 gap-3 content-center">
            {barrierTypes.map(t => (
              <button key={t.id} onClick={() => handleStartTutorial(t.id)}
                className="rounded-2xl bg-card shadow-md p-4 flex items-center gap-4 active:scale-[0.99]">
                <PartIcon id={t.arm} size={72} />
                <div className="text-left">
                  <h3 className="text-xl font-bold">{t.name}</h3>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === 'tutorial' && typeSelected && (
          <div className="shrink-0 w-full">
            <div className="flex gap-1 mb-2 justify-center">
              {buildSteps.map((s, i) => (
                <div key={s.id} className={`h-1.5 flex-1 rounded-full ${i <= tutorialStep ? 'bg-sky' : 'bg-muted'}`} />
              ))}
            </div>
            <div className="soft-card p-3 flex items-center gap-3">
              <PartIcon id={buildSteps[tutorialStep].slot === 'arm' ? chosenArm : buildSteps[tutorialStep].id} size={64} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">第 {tutorialStep + 1}/{buildSteps.length} 步 · {buildSteps[tutorialStep].name}</p>
                <p className="font-extrabold leading-snug">{buildSteps[tutorialStep].desc}</p>
              </div>
              <button onClick={handleTutorialPlace}
                className="kid-btn px-4 bg-gradient-to-r from-sky to-grass text-primary-foreground shrink-0">
                卡住
              </button>
            </div>
          </div>
        )}

        {mode === 'free' && (
          <div className="shrink-0 max-h-[38%] overflow-auto">
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {Object.entries(slotNames).map(([key, name]) => (
                <span key={key} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${slots[key] ? 'bg-grass/20' : 'bg-muted text-muted-foreground'}`}>
                  {slots[key] ? <PartIcon id={slots[key]} size={18} /> : '·'} {name}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {freeParts.map(part => (
                <PartTile
                  key={part.id}
                  id={part.id}
                  name={part.name}
                  selected={slots[part.slot] === part.id}
                  onClick={() => { handleFreeDrop(part.slot, part.id); setMascotMsg(`${part.name}卡进去了`); }}
                />
              ))}
            </div>
            <div className="flex gap-3 justify-center mt-2">
              <button onClick={handleFreeComplete} className="kid-btn px-5 bg-gradient-to-r from-sky to-grass text-primary-foreground">装好了</button>
              <button onClick={() => { playClick(); setSlots({}); setMascotMsg('重新开始'); }} className="kid-btn px-5 bg-muted">重来</button>
            </div>
          </div>
        )}

        {mode === 'done' && (
          <div className="flex gap-3 justify-center shrink-0">
            <button onClick={handleTestRun} className="kid-btn px-5 bg-gradient-to-r from-golden to-orange-warm text-primary-foreground">抬杆试运行</button>
            <button onClick={() => { playClick(); setMode('select'); setSlots({}); setTypeSelected(false); setIsRunning(false); setMascotMsg('再建一个'); }} className="kid-btn px-5 bg-muted">再建一个</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FactoryPage;
