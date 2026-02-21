import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playError, playBarrierLift, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

// ===================== WHY PROMPT COMPONENT =====================

const WhyPrompt: React.FC<{
  question: string;
  options: { text: string; correct: boolean }[];
  onDone: () => void;
}> = ({ question, options, onDone }) => {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);

  const handlePick = (idx: number) => {
    playClick();
    setPicked(idx);
    const isCorrect = options[idx].correct;
    setResult(isCorrect);
    if (isCorrect) {
      playSuccess();
      vibrate(60);
      speak('答对了！你真会思考！');
      setTimeout(onDone, 1500);
    } else {
      playError();
      speak('再想想为什么呢？');
      setTimeout(() => { setPicked(null); setResult(null); }, 1200);
    }
  };

  return (
    <div className="bg-golden/15 rounded-2xl p-4 text-center animate-pop-in mt-3">
      <p className="text-sm font-bold text-foreground mb-1">🤔 想一想为什么？</p>
      <p className="text-base font-bold text-foreground mb-3">{question}</p>
      <div className="grid gap-2">
        {options.map((opt, i) => (
          <button key={i} onClick={() => handlePick(i)}
            disabled={result === true}
            className={`p-3 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              picked === i && result === true ? 'bg-accent/30 ring-2 ring-accent' :
              picked === i && result === false ? 'bg-destructive/20 ring-2 ring-destructive' :
              'bg-card hover:bg-primary/10 border border-border'
            }`}>
            {opt.text}
          </button>
        ))}
      </div>
      {result === true && <p className="text-xs text-accent mt-2 animate-pop-in">🌟 +1 思考之星！</p>}
    </div>
  );
};

// ===================== LEVEL DATA =====================

interface Level {
  id: number;
  title: string;
  emoji: string;
  rule: string;
  ruleEn: string;
  word: string;
  wordEn: string;
}

const LEVELS: Level[] = [
  { id: 1, title: '停车入位', emoji: '🅿️', rule: '车要停在停车位里', ruleEn: 'Cars park in parking spots', word: '停', wordEn: 'park' },
  { id: 2, title: '红绿灯', emoji: '🚦', rule: '红灯停，绿灯行', ruleEn: 'Red means stop, green means go', word: '红', wordEn: 'red' },
  { id: 3, title: '数车车', emoji: '🚗', rule: '数一数有几辆车', ruleEn: 'Count the cars', word: '车', wordEn: 'car' },
  { id: 4, title: '过斑马线', emoji: '🦓', rule: '行人优先，慢慢走', ruleEn: 'Pedestrians first, walk slowly', word: '行', wordEn: 'walk' },
  { id: 5, title: '小司机', emoji: '🏎️', rule: '安全驾驶最重要', ruleEn: 'Safe driving is most important', word: '安全', wordEn: 'safe' },
];

// Why prompts per level
const WHY_PROMPTS: Record<number, { question: string; options: { text: string; correct: boolean }[] }> = {
  1: { question: '为什么车要停在停车位里？', options: [{ text: '保持秩序，让别的车也有地方停', correct: true }, { text: '随便停哪里都可以', correct: false }] },
  2: { question: '为什么红灯要停下来？', options: [{ text: '让其他方向的车和行人安全通过', correct: true }, { text: '因为红色不好看', correct: false }] },
  3: { question: '为什么要数清楚车的数量？', options: [{ text: '帮助管理停车场，知道还有没有空位', correct: true }, { text: '数数好玩', correct: false }] },
  4: { question: '为什么行人过马路要走斑马线？', options: [{ text: '司机看到斑马线会减速，更安全', correct: true }, { text: '斑马线好看', correct: false }] },
  5: { question: '为什么开车不能太快？', options: [{ text: '速度太快来不及刹车，容易出事故', correct: true }, { text: '开快点可以早到', correct: false }] },
};

// ===================== LEVEL 1: PARKING =====================

const Level1Parking: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [carX, setCarX] = useState(50);
  const [parked, setParked] = useState(false);
  const [barrierUp, setBarrierUp] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (parked) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setCarX(Math.max(10, Math.min(90, x)));
  }, [parked]);

  const handleCheck = () => {
    if (carX >= 55 && carX <= 80) {
      setParked(true);
      playSuccess();
      vibrate(100);
      setBarrierUp(true);
      playBarrierLift();
      speak('太棒了！车停好了，道闸升起来啦！');
      setTimeout(onComplete, 2500);
    } else {
      playError();
      speak('再试试，把车拖到蓝色停车位里');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-64 bg-muted rounded-3xl overflow-hidden touch-none"
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onMouseMove={(e) => e.buttons && handleMove(e.clientX)}>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-foreground/20 rounded-b-3xl" />
      <div className="absolute bottom-8 left-0 right-0 h-1 border-t-2 border-dashed border-secondary" />
      <div className="absolute bottom-2 right-[15%] w-16 h-16 border-2 border-dashed border-primary rounded-xl flex items-center justify-center">
        <span className="text-xs font-bold text-primary">🅿️</span>
      </div>
      <div className="absolute bottom-16 right-[35%]">
        <div className="w-3 h-12 bg-foreground/40 rounded-t" />
        <div className={`absolute top-0 left-3 w-14 h-2 bg-coral rounded origin-left transition-transform duration-700 ${barrierUp ? '-rotate-[85deg]' : 'rotate-0'}`}>
          <div className="absolute right-0 top-0 w-2 h-2 rounded-full bg-secondary" />
        </div>
      </div>
      <div className="absolute bottom-4 transition-all duration-150 text-4xl select-none cursor-grab active:cursor-grabbing"
        style={{ left: `${carX}%`, transform: 'translateX(-50%)' }}>
        🚙
      </div>
      {!parked && (
        <button onClick={handleCheck}
          className="absolute top-3 right-3 touch-target rounded-2xl bg-accent text-accent-foreground font-bold px-4 py-2 active:scale-95 transition-transform">
          ✅ 停好了！
        </button>
      )}
      {parked && <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pop-in">🎉</div>}
    </div>
  );
};

// ===================== LEVEL 2: TRAFFIC LIGHT =====================

const Level2TrafficLight: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [lightColor, setLightColor] = useState<'red' | 'green' | 'yellow'>('red');
  const [answer, setAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const colors: ('red' | 'green' | 'yellow')[] = ['red', 'green', 'yellow'];
    setLightColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const check = (action: string) => {
    playClick();
    setAnswer(action);
    const isCorrect = (lightColor === 'red' && action === 'stop') ||
                      (lightColor === 'green' && action === 'go') ||
                      (lightColor === 'yellow' && action === 'slow');
    setCorrect(isCorrect);
    if (isCorrect) {
      playSuccess();
      vibrate(100);
      speak(lightColor === 'red' ? '对了！红灯停！' : lightColor === 'green' ? '对了！绿灯行！' : '对了！黄灯要减速！');
      setTimeout(onComplete, 2000);
    } else {
      playError();
      speak('再想想，这个灯是什么意思？');
      setTimeout(() => { setAnswer(null); setCorrect(null); }, 1500);
    }
  };

  const lightColors = {
    red: 'bg-destructive shadow-[0_0_20px_hsl(var(--destructive))]',
    yellow: 'bg-secondary shadow-[0_0_20px_hsl(var(--golden))]',
    green: 'bg-accent shadow-[0_0_20px_hsl(var(--grass-green))]',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-foreground/80 rounded-2xl p-3 flex flex-col gap-2 items-center w-16">
        <div className={`w-10 h-10 rounded-full ${lightColor === 'red' ? lightColors.red : 'bg-foreground/30'}`} />
        <div className={`w-10 h-10 rounded-full ${lightColor === 'yellow' ? lightColors.yellow : 'bg-foreground/30'}`} />
        <div className={`w-10 h-10 rounded-full ${lightColor === 'green' ? lightColors.green : 'bg-foreground/30'}`} />
      </div>
      <div className="flex gap-3">
        {[
          { action: 'stop', label: '🛑 停', bg: 'bg-destructive/20 hover:bg-destructive/30' },
          { action: 'slow', label: '⚠️ 慢', bg: 'bg-secondary/20 hover:bg-secondary/30' },
          { action: 'go', label: '✅ 行', bg: 'bg-accent/20 hover:bg-accent/30' },
        ].map(b => (
          <button key={b.action} onClick={() => check(b.action)}
            disabled={answer !== null}
            className={`touch-target rounded-2xl ${b.bg} font-bold text-lg px-5 py-3 active:scale-95 transition-all ${answer === b.action ? (correct ? 'ring-4 ring-accent' : 'ring-4 ring-destructive') : ''}`}>
            {b.label}
          </button>
        ))}
      </div>
      {correct && <div className="text-2xl animate-pop-in">🎉 太棒了！</div>}
    </div>
  );
};

// ===================== LEVEL 3: COUNT CARS =====================

const Level3CountCars: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [targetCount] = useState(() => Math.floor(Math.random() * 8) + 3);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const cars = ['🚗', '🚙', '🚕', '🚌', '🚎', '🏎️', '🚑', '🚒', '🚐', '🛻'];

  const check = (n: number) => {
    playClick();
    setSelected(n);
    if (n === targetCount) {
      setCorrect(true);
      playSuccess();
      vibrate(100);
      speak(`对了！一共有${targetCount}辆车！`);
      setTimeout(onComplete, 2000);
    } else {
      setCorrect(false);
      playError();
      speak('数一数，再试试');
      setTimeout(() => { setSelected(null); setCorrect(null); }, 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-lg font-bold text-foreground">数一数，有几辆车？🚗</p>
      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
        {Array.from({ length: targetCount }).map((_, i) => (
          <span key={i} className="text-3xl animate-pop-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {cars[i % cars.length]}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
        {[targetCount - 2, targetCount - 1, targetCount, targetCount + 1, targetCount + 2]
          .filter(n => n > 0 && n <= 20)
          .sort(() => Math.random() - 0.5)
          .map(n => (
            <button key={n} onClick={() => check(n)}
              disabled={selected !== null}
              className={`w-14 h-14 rounded-2xl text-2xl font-black transition-all active:scale-95 ${
                selected === n ? (correct ? 'bg-accent text-accent-foreground' : 'bg-destructive text-destructive-foreground') : 'bg-primary/15 hover:bg-primary/25 text-foreground'
              }`}>
              {n}
            </button>
          ))}
      </div>
      {correct && <div className="text-2xl animate-pop-in">🎉</div>}
    </div>
  );
};

// ===================== LEVEL 4: CROSSWALK =====================

const Level4Crosswalk: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [animalPos, setAnimalPos] = useState(0);
  const [weather] = useState<'sunny' | 'rainy'>(() => Math.random() > 0.5 ? 'rainy' : 'sunny');
  const [done, setDone] = useState(false);
  const animals = ['🐰', '🐻', '🐱', '🐶'];
  const [animal] = useState(() => animals[Math.floor(Math.random() * animals.length)]);

  const step = () => {
    if (done) return;
    playClick();
    vibrate(30);
    setAnimalPos(prev => {
      const next = prev + 1;
      if (next >= 5) {
        setDone(true);
        playSuccess();
        vibrate(100);
        speak(weather === 'rainy' ? '太棒了！下雨天慢慢走，安全过马路！' : '太棒了！安全过斑马线啦！');
        setTimeout(onComplete, 2000);
      }
      return Math.min(next, 5);
    });
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg font-bold text-foreground">
        {weather === 'rainy' ? '🌧️ 下雨了！' : '☀️ 晴天！'} 帮{animal}过斑马线
      </p>
      <div className="relative w-full max-w-xs h-32 bg-muted rounded-2xl overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-foreground/20" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="absolute top-1/2 -translate-y-1/2 h-16 w-3 bg-card"
            style={{ left: `${15 + i * 14}%` }} />
        ))}
        <div className="absolute top-1/2 -translate-y-1/2 text-3xl transition-all duration-500"
          style={{ left: `${5 + animalPos * 18}%` }}>
          {animal}
        </div>
        {weather === 'rainy' && (
          <div className="absolute top-1 left-0 right-0 text-center text-xs opacity-50">
            💧💧💧💧💧💧
          </div>
        )}
        {done && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-3xl animate-pop-in">🎉</div>}
      </div>
      {!done && (
        <button onClick={step}
          className="touch-target rounded-2xl bg-accent/20 hover:bg-accent/30 text-foreground font-bold text-lg px-6 py-3 active:scale-95 transition-all">
          👣 走一步
        </button>
      )}
    </div>
  );
};

// ===================== LEVEL 5: DRIVING =====================

const Level5Driving: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [carLane, setCarLane] = useState(1);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<{ lane: number; top: number; id: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const nextId = useRef(0);

  useEffect(() => {
    if (gameOver) return;
    const interval = setInterval(() => {
      setObstacles(prev => {
        const moved = prev.map(o => ({ ...o, top: o.top + 5 })).filter(o => o.top < 110);
        const hit = moved.some(o => o.top > 75 && o.top < 95 && o.lane === carLane);
        if (hit) {
          playError();
          setGameOver(true);
          clearInterval(interval);
          return moved;
        }
        const dodged = prev.filter(o => o.top <= 95).length - moved.filter(o => o.top <= 95).length;
        if (dodged > 0) setScore(s => s + dodged);
        if (Math.random() < 0.1) {
          moved.push({ lane: Math.floor(Math.random() * 3), top: -10, id: nextId.current++ });
        }
        return moved;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [carLane, gameOver]);

  useEffect(() => {
    if (score >= 10 && !gameOver) {
      setGameOver(true);
      playSuccess();
      vibrate(100);
      speak('太棒了！安全驾驶小达人！');
      setTimeout(onComplete, 2000);
    }
  }, [score, gameOver, onComplete]);

  const moveCar = (dir: number) => {
    playClick();
    setCarLane(prev => Math.max(0, Math.min(2, prev + dir)));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="font-bold text-foreground">躲避障碍！得分: {score}/10</p>
      <div className="relative w-48 h-64 bg-foreground/10 rounded-2xl overflow-hidden">
        {[1, 2].map(i => (
          <div key={i} className="absolute top-0 bottom-0 w-px border-l border-dashed border-muted-foreground/30"
            style={{ left: `${(i * 100) / 3}%` }} />
        ))}
        {obstacles.map(o => (
          <div key={o.id} className="absolute text-2xl transition-none"
            style={{ left: `${(o.lane * 100) / 3 + 16.6}%`, top: `${o.top}%`, transform: 'translate(-50%, -50%)' }}>
            🚧
          </div>
        ))}
        <div className="absolute bottom-4 text-3xl transition-all duration-150"
          style={{ left: `${(carLane * 100) / 3 + 16.6}%`, transform: 'translateX(-50%)' }}>
          🚙
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => moveCar(-1)} className="touch-target rounded-2xl bg-primary/15 hover:bg-primary/25 font-bold text-xl px-5 py-3 active:scale-95">⬅️</button>
        <button onClick={() => moveCar(1)} className="touch-target rounded-2xl bg-primary/15 hover:bg-primary/25 font-bold text-xl px-5 py-3 active:scale-95">➡️</button>
      </div>
      {gameOver && score < 10 && (
        <button onClick={() => { setGameOver(false); setScore(0); setObstacles([]); }}
          className="touch-target rounded-2xl bg-accent/20 font-bold px-5 py-3 active:scale-95">
          🔄 再来一次
        </button>
      )}
    </div>
  );
};

// ===================== MAIN TRAFFIC PAGE =====================

const TrafficPage: React.FC = () => {
  const navigate = useNavigate();
  const { addStars, addBadge } = useGame();
  const [currentLevel, setCurrentLevel] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showWhy, setShowWhy] = useState<number | null>(null);

  const handleLevelComplete = useCallback((levelId: number) => {
    // Show "Why?" prompt after completing a level
    setShowWhy(levelId);
  }, []);

  const handleWhyDone = useCallback((levelId: number) => {
    setShowWhy(null);
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(levelId);
      addStars(3); // Extra star for thinking!
      if (next.size === 5) {
        addBadge('交通小英雄');
        speak('恭喜你！获得交通小英雄徽章！');
      }
      return next;
    });
    setTimeout(() => setCurrentLevel(0), 1500);
  }, [addStars, addBadge]);

  const renderLevel = () => {
    switch (currentLevel) {
      case 1: return <Level1Parking onComplete={() => handleLevelComplete(1)} />;
      case 2: return <Level2TrafficLight onComplete={() => handleLevelComplete(2)} />;
      case 3: return <Level3CountCars onComplete={() => handleLevelComplete(3)} />;
      case 4: return <Level4Crosswalk onComplete={() => handleLevelComplete(4)} />;
      case 5: return <Level5Driving onComplete={() => handleLevelComplete(5)} />;
      default: return null;
    }
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-coral/15 via-background to-accent/10 pt-20 pb-8 px-4">
        {currentLevel === 0 ? (
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <XiaoZhaZha mood="excited" size={80} />
              <h1 className="text-3xl font-black text-foreground mt-2">🚦 交通英雄城</h1>
              <p className="text-muted-foreground">完成5关，成为交通小英雄！</p>
              <p className="text-sm text-muted-foreground/70 mt-1">已完成 {completed.size}/5 关</p>
            </div>
            <div className="grid gap-3">
              {LEVELS.map(level => (
                <button key={level.id}
                  onClick={() => { playClick(); setCurrentLevel(level.id); speak(level.rule); }}
                  className={`flex items-center gap-4 p-4 rounded-3xl transition-all active:scale-[0.97] ${
                    completed.has(level.id) ? 'bg-accent/20 border-2 border-accent' : 'bg-card border-2 border-border hover:border-primary/30'
                  }`}>
                  <span className="text-4xl">{level.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-bold text-foreground">{level.title}</p>
                    <p className="text-sm text-muted-foreground">{level.rule}</p>
                    <p className="text-xs text-muted-foreground/60">{level.ruleEn}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg">{completed.has(level.id) ? '⭐' : '🔒'}</span>
                    <span className="text-xs font-bold text-foreground">{level.word}</span>
                    <span className="text-xs text-muted-foreground">{level.wordEn}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <button onClick={() => { playClick(); setCurrentLevel(0); setShowWhy(null); }}
              className="touch-target rounded-2xl bg-card hover:bg-muted px-4 py-2 font-bold text-foreground mb-4 active:scale-95 transition-all">
              ← 返回关卡
            </button>
            <div className="bg-card rounded-3xl shadow-lg p-5">
              <h2 className="text-xl font-black text-center text-foreground mb-1">{LEVELS[currentLevel - 1].emoji} {LEVELS[currentLevel - 1].title}</h2>
              <p className="text-center text-sm text-muted-foreground mb-4">{LEVELS[currentLevel - 1].rule}</p>
              {renderLevel()}
              {/* Why prompt after level complete */}
              {showWhy && WHY_PROMPTS[showWhy] && (
                <WhyPrompt
                  question={WHY_PROMPTS[showWhy].question}
                  options={WHY_PROMPTS[showWhy].options}
                  onDone={() => handleWhyDone(showWhy)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrafficPage;
