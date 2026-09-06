import React, { useMemo, useState } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import { useGame } from '@/contexts/GameContext';
import { getAgeConfig } from '@/data/age';
import { playClick, playError, playSuccess, vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

type ActivityId = 'count' | 'compare' | 'shape' | 'pattern' | 'add';

const SHAPES = [
  { id: 'circle', name: '圆形', node: <circle cx="40" cy="40" r="26" fill="hsl(var(--coral-red))" /> },
  { id: 'square', name: '方形', node: <rect x="14" y="14" width="52" height="52" rx="8" fill="hsl(var(--sky-blue))" /> },
  { id: 'triangle', name: '三角形', node: <polygon points="40,12 68,66 12,66" fill="hsl(var(--golden))" /> },
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function CarRow({ count }: { count: number }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 py-2">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="72" height="46" viewBox="0 0 72 46" aria-hidden>
          <rect x="6" y="16" width="60" height="18" rx="7" fill="hsl(var(--sky-blue))" />
          <rect x="18" y="6" width="28" height="16" rx="5" fill="hsl(var(--primary))" />
          <rect x="22" y="10" width="10" height="8" rx="2" fill="#E8F6FB" />
          <rect x="36" y="10" width="8" height="8" rx="2" fill="#E8F6FB" />
          <circle cx="20" cy="36" r="7" fill="hsl(var(--foreground))" />
          <circle cx="52" cy="36" r="7" fill="hsl(var(--foreground))" />
          <circle cx="20" cy="36" r="3" fill="#D8DEE4" />
          <circle cx="52" cy="36" r="3" fill="#D8DEE4" />
        </svg>
      ))}
    </div>
  );
}

const MathPage: React.FC = () => {
  const { currentProfile, addStars, addBadge, addKnowledge, completeStation } = useGame();
  const age = getAgeConfig(currentProfile?.ageBand);
  const [activity, setActivity] = useState<ActivityId | null>(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [seed, setSeed] = useState(0);

  const activities: { id: ActivityId; name: string; desc: string; show: boolean }[] = [
    { id: 'count', name: '数一数', desc: `停车场来了几辆车？（1–${age.maxCount > 10 ? 10 : age.maxCount}）`, show: true },
    { id: 'compare', name: '比多少', desc: '哪一边的车更多？', show: true },
    { id: 'shape', name: '认形状', desc: '道闸上藏着什么形状？', show: true },
    { id: 'pattern', name: '找规律', desc: '红灯绿灯，下一个是谁？', show: age.id !== 'sprout' },
    { id: 'add', name: '来了与走了', desc: '又来了几辆，或开走了几辆？', show: age.allowAddSubtract },
  ];

  const finishActivity = (knowledgeId: string) => {
    addStars(3);
    addKnowledge(knowledgeId);
    if (knowledgeId === 'count-5' && age.maxCount >= 10) addKnowledge('count-10');
    if (knowledgeId === 'add-subtract') addKnowledge('count-10');
    completeStation('math');
    addBadge('number-friend');
    speak('太棒了！数感小岛又长大一格！');
    playSuccess();
    setActivity(null);
    setRound(0);
    setScore(0);
  };

  const onCorrect = (knowledgeId: string) => {
    playSuccess();
    vibrate(60);
    const nextScore = score + 1;
    setScore(nextScore);
    if (nextScore >= 5) {
      finishActivity(knowledgeId);
      return;
    }
    setRound(r => r + 1);
    setSeed(s => s + 1);
  };

  const onWrong = () => {
    playError();
    speak('再数一遍，慢慢来');
  };

  return (
    <GameLayout title="数感小岛" domain="math" goal={
      age.id === 'sprout' ? '一个一个点，数到五' :
      age.id === 'explorer' ? '数一数、比一比、找规律' :
      '理解来了几辆、走了几辆'
    } mascotMood="thinking">
      {!activity ? (
        <div className="grid gap-3">
          {activities.filter(a => a.show).map(item => (
            <button
              key={item.id}
              onClick={() => { playClick(); setActivity(item.id); setRound(0); setScore(0); setSeed(0); speak(item.name); }}
              className="soft-card p-4 text-left hover:scale-[1.01] active:scale-[0.99] transition-transform"
            >
              <p className="text-lg font-black text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="soft-card p-5">
          <div className="flex items-center justify-between mb-3">
            <button className="text-sm font-bold text-muted-foreground" onClick={() => { playClick(); setActivity(null); }}>← 换一换</button>
            <p className="text-sm font-bold text-primary">对了 {score} / 5</p>
          </div>
          {activity === 'count' && <CountPlay key={seed} max={Math.min(age.maxCount, 10)} options={age.optionCount} onCorrect={() => onCorrect('count-5')} onWrong={onWrong} />}
          {activity === 'compare' && <ComparePlay key={seed} max={Math.min(age.maxCount, 8)} options={age.optionCount} onCorrect={() => onCorrect('compare')} onWrong={onWrong} />}
          {activity === 'shape' && <ShapePlay key={seed} options={age.optionCount} onCorrect={() => onCorrect('shapes')} onWrong={onWrong} />}
          {activity === 'pattern' && <PatternPlay key={seed + round} options={age.optionCount} onCorrect={() => onCorrect('pattern')} onWrong={onWrong} />}
          {activity === 'add' && <AddPlay key={seed} onCorrect={() => onCorrect('add-subtract')} onWrong={onWrong} />}
        </div>
      )}
    </GameLayout>
  );
};

const CountPlay: React.FC<{ max: number; options: number; onCorrect: () => void; onWrong: () => void }> = ({ max, options, onCorrect, onWrong }) => {
  const n = useMemo(() => randInt(1, max), [max]);
  const choices = useMemo(() => {
    const set = new Set<number>([n]);
    while (set.size < Math.min(options, max)) set.add(randInt(1, max));
    return [...set].sort(() => Math.random() - 0.5);
  }, [n, options, max]);

  return (
    <div className="text-center">
      <p className="font-extrabold text-foreground mb-2">停车场里有几辆车？</p>
      <div className="rounded-3xl bg-muted/60 p-3 mb-4">
        <CarRow count={n} />
      </div>
      <div className="flex justify-center gap-3 flex-wrap">
        {choices.map(c => (
          <button key={c} onClick={() => { playClick(); if (c === n) onCorrect(); else onWrong(); }}
            className="kid-btn touch-target w-16 bg-primary/15 text-2xl text-foreground">{c}</button>
        ))}
      </div>
    </div>
  );
};

const ComparePlay: React.FC<{ max: number; options: number; onCorrect: () => void; onWrong: () => void }> = ({ max, onCorrect, onWrong }) => {
  const a = useMemo(() => randInt(1, max), [max]);
  const b = useMemo(() => {
    let n = randInt(1, max);
    if (n === a && Math.random() > 0.35) n = a === max ? a - 1 : a + 1;
    return n;
  }, [a, max]);
  const answer = a === b ? 'same' : a > b ? 'left' : 'right';

  return (
    <div className="text-center">
      <p className="font-extrabold text-foreground mb-3">哪一边的车更多？</p>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-3xl bg-muted/60 p-2"><p className="text-xs font-bold mb-1">左边</p><CarRow count={a} /></div>
        <div className="rounded-3xl bg-muted/60 p-2"><p className="text-xs font-bold mb-1">右边</p><CarRow count={b} /></div>
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {[
          { id: 'left', label: '左边多' },
          { id: 'same', label: '一样多' },
          { id: 'right', label: '右边多' },
        ].map(opt => (
          <button key={opt.id} onClick={() => { playClick(); if (opt.id === answer) onCorrect(); else onWrong(); }}
            className="kid-btn px-4 bg-primary/15 text-foreground">{opt.label}</button>
        ))}
      </div>
    </div>
  );
};

const ShapePlay: React.FC<{ options: number; onCorrect: () => void; onWrong: () => void }> = ({ options, onCorrect, onWrong }) => {
  const target = useMemo(() => SHAPES[randInt(0, SHAPES.length - 1)], []);
  const choices = useMemo(() => {
    const pool = [...SHAPES].sort(() => Math.random() - 0.5);
    const picked = [target, ...pool.filter(s => s.id !== target.id)].slice(0, options);
    return picked.sort(() => Math.random() - 0.5);
  }, [target, options]);

  return (
    <div className="text-center">
      <p className="font-extrabold text-foreground mb-2">这个灯是什么形状？</p>
      <svg viewBox="0 0 160 90" className="w-full max-w-xs mx-auto mb-4">
        <rect x="20" y="70" width="50" height="14" rx="4" fill="hsl(var(--muted-foreground) / 0.35)" />
        <rect x="38" y="38" width="14" height="34" rx="3" fill="hsl(var(--primary))" />
        <g transform="translate(70 10)">{target.node}</g>
      </svg>
      <div className="flex justify-center gap-2 flex-wrap">
        {choices.map(s => (
          <button key={s.id} onClick={() => { playClick(); if (s.id === target.id) onCorrect(); else onWrong(); }}
            className="kid-btn px-4 bg-primary/15 text-foreground">{s.name}</button>
        ))}
      </div>
    </div>
  );
};

const PatternPlay: React.FC<{ options: number; onCorrect: () => void; onWrong: () => void }> = ({ onCorrect, onWrong }) => {
  const colors = [
    { id: 'red', fill: 'hsl(var(--coral-red))', name: '红灯' },
    { id: 'green', fill: 'hsl(var(--grass-green))', name: '绿灯' },
  ];
  const seq = useMemo(() => [0, 1, 0, 1], []);
  const answer = colors[0];

  return (
    <div className="text-center">
      <p className="font-extrabold text-foreground mb-3">红绿红绿，下一个是？</p>
      <div className="flex justify-center gap-2 mb-5">
        {seq.map((i, idx) => (
          <span key={idx} className="w-14 h-14 rounded-full border-2 border-card" style={{ background: colors[i].fill }} />
        ))}
        <span className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center text-muted-foreground text-xl">?</span>
      </div>
      <div className="flex justify-center gap-3">
        {colors.map(c => (
          <button key={c.id} onClick={() => { playClick(); if (c.id === answer.id) onCorrect(); else onWrong(); }}
            className="kid-btn px-4 text-foreground" style={{ background: c.fill }}>{c.name}</button>
        ))}
      </div>
    </div>
  );
};

const AddPlay: React.FC<{ onCorrect: () => void; onWrong: () => void }> = ({ onCorrect, onWrong }) => {
  const parked = useMemo(() => randInt(3, 7), []);
  const delta = useMemo(() => randInt(1, 2), []);
  const isAdd = useMemo(() => Math.random() > 0.45, []);
  const answer = isAdd ? parked + delta : parked - delta;
  const choices = useMemo(() => {
    const set = new Set([answer, answer + 1, Math.max(1, answer - 1), parked]);
    return [...set].sort(() => Math.random() - 0.5).slice(0, 3);
  }, [answer, parked]);

  return (
    <div className="text-center">
      <p className="font-extrabold text-foreground mb-2">
        {isAdd ? `已经停了 ${parked} 辆，又来了 ${delta} 辆` : `已经停了 ${parked} 辆，开走了 ${delta} 辆`}
      </p>
      <CarRow count={parked} />
      <p className="text-sm font-bold text-primary my-2">{isAdd ? `+ ${delta}` : `− ${delta}`}</p>
      <p className="mb-3 font-extrabold">{isAdd ? '现在一共几辆？' : '现在还剩几辆？'}</p>
      <div className="flex justify-center gap-3">
        {choices.map(c => (
          <button key={c} onClick={() => { playClick(); if (c === answer) onCorrect(); else onWrong(); }}
            className="kid-btn touch-target w-16 bg-primary/15 text-2xl text-foreground">{c}</button>
        ))}
      </div>
    </div>
  );
};

export default MathPage;
