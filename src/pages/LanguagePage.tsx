import React, { useCallback, useEffect, useState } from 'react';
import GameLayout from '@/components/layout/GameLayout';
import { useGame } from '@/contexts/GameContext';
import { getAgeConfig } from '@/data/age';
import { unitsForBand, vocabForBand, type Word } from '@/data/vocab';
import { playClick, playError, playSuccess, vibrate } from '@/lib/sound';
import { speak, speakBilingual } from '@/lib/speech';

type Mode = 'menu' | 'match' | 'flash' | 'spell';

const LanguagePage: React.FC = () => {
  const { currentProfile, addStars, addBadge, addLearnedWord, addKnowledge, completeStation } = useGame();
  const age = getAgeConfig(currentProfile?.ageBand);
  const words = vocabForBand(age.id);
  const units = unitsForBand(age.id);
  const [mode, setMode] = useState<Mode>('menu');
  const [unitCats, setUnitCats] = useState<Word['category'][] | null>(null);
  const [score, setScore] = useState(0);

  const pool = unitCats ? words.filter(w => unitCats.includes(w.category)) : words;

  const bump = useCallback((word?: Word) => {
    if (word) addLearnedWord(word.zh);
    setScore(s => {
      const next = s + 1;
      if (next % 4 === 0) addStars(2);
      if (next >= 8) {
        addBadge('linguist');
        completeStation('language');
        addKnowledge('colors');
        addKnowledge('opposites');
        if (age.id !== 'sprout') addKnowledge('safety-words');
        speak('语言小屋的本领收进手册啦');
      }
      return next;
    });
  }, [addLearnedWord, addStars, addBadge, completeStation, addKnowledge, age.id]);

  return (
    <GameLayout
      title="语言小屋"
      domain="language"
      goal={age.id === 'sprout' ? '听音，找出颜色和形状' : age.id === 'explorer' ? '学会相反词和安全词' : '听、说，再试着拼一拼'}
    >
      {mode === 'menu' ? (
        <div className="grid gap-3">
          <p className="text-sm font-bold text-muted-foreground">先选一组词，再玩。已学会 {score} 次</p>
          {units.map(unit => (
            <div key={unit.id} className="soft-card p-4">
              <p className="font-black text-foreground mb-2">{unit.name}</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { playClick(); setUnitCats(unit.categories); setMode('match'); }}
                  className="kid-btn px-4 bg-primary/15 text-foreground">听音配对</button>
                <button onClick={() => { playClick(); setUnitCats(unit.categories); setMode('flash'); }}
                  className="kid-btn px-4 bg-secondary/30 text-foreground">翻卡片</button>
                {age.allowSpell && (
                  <button onClick={() => { playClick(); setUnitCats(unit.categories); setMode('spell'); }}
                    className="kid-btn px-4 bg-golden/30 text-foreground">拼一拼</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="soft-card p-5">
          <button className="text-sm font-bold text-muted-foreground mb-3" onClick={() => { playClick(); setMode('menu'); }}>← 换一组</button>
          {mode === 'match' && <MatchGame words={pool} optionCount={age.optionCount} showEn={age.showEnglish} onScore={bump} />}
          {mode === 'flash' && <FlashGame words={pool} showEn={age.showEnglish} rate={age.speechRate} onScore={bump} />}
          {mode === 'spell' && <SpellGame words={pool.filter(w => w.en.length <= 5)} onScore={bump} />}
        </div>
      )}
    </GameLayout>
  );
};

const MatchGame: React.FC<{ words: Word[]; optionCount: number; showEn: boolean; onScore: (w: Word) => void }> = ({ words, optionCount, showEn, onScore }) => {
  const [target, setTarget] = useState<Word | null>(null);
  const [choices, setChoices] = useState<Word[]>([]);

  const deal = useCallback(() => {
    if (!words.length) return;
    const tgt = words[Math.floor(Math.random() * words.length)];
    const others = words.filter(w => w.zh !== tgt.zh).sort(() => Math.random() - 0.5);
    setTarget(tgt);
    setChoices([tgt, ...others].slice(0, optionCount).sort(() => Math.random() - 0.5));
    speak(tgt.zh);
  }, [words, optionCount]);

  useEffect(() => { deal(); }, [deal]);
  if (!target) return null;

  return (
    <div className="text-center">
      <p className="font-extrabold mb-1">听到的是哪一个？</p>
      <p className="text-4xl font-black mb-4">{target.zh}{showEn ? <span className="block text-base text-muted-foreground">{target.en}</span> : null}</p>
      <div className="grid grid-cols-2 gap-3">
        {choices.map(w => (
          <button key={w.zh} onClick={() => {
            playClick();
            if (w.zh === target.zh) { playSuccess(); vibrate(50); onScore(w); speak(w.zh); setTimeout(deal, 700); }
            else { playError(); speak('再听一次'); }
          }} className="soft-card p-4 hover:scale-[1.02] active:scale-95 transition-transform">
            <span className="text-3xl">{w.emoji}</span>
            <p className="font-black mt-1">{w.zh}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

const FlashGame: React.FC<{ words: Word[]; showEn: boolean; rate: number; onScore: (w: Word) => void }> = ({ words, showEn, rate, onScore }) => {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const word = words[i % Math.max(words.length, 1)];
  if (!word) return null;

  return (
    <div className="text-center">
      <button onClick={() => { playClick(); setOpen(o => !o); if (!open) speak(word.zh, 'zh-CN', rate); }}
        className="soft-card w-full max-w-xs mx-auto h-44 flex flex-col items-center justify-center">
        {!open ? <span className="text-6xl">{word.emoji}</span> : (
          <>
            <p className="text-4xl font-black">{word.zh}</p>
            <p className="text-muted-foreground">{word.pinyin}</p>
            {showEn && <p className="text-primary font-bold">{word.en}</p>}
          </>
        )}
      </button>
      {open && (
        <button onClick={() => { playClick(); onScore(word); if (showEn) speakBilingual(word.zh, word.en, rate); setOpen(false); setI(n => n + 1); }}
          className="kid-btn mt-4 px-6 bg-primary text-primary-foreground">学会了</button>
      )}
    </div>
  );
};

const SpellGame: React.FC<{ words: Word[]; onScore: (w: Word) => void }> = ({ words, onScore }) => {
  const [i, setI] = useState(0);
  const word = words[i % Math.max(words.length, 1)];
  const [placed, setPlaced] = useState<string[]>([]);
  const [pool, setPool] = useState<string[]>([]);

  useEffect(() => {
    if (!word) return;
    setPlaced([]);
    setPool(word.en.split('').sort(() => Math.random() - 0.5));
  }, [word?.en, i]);

  if (!word) return <p>这组词还不用拼</p>;

  return (
    <div className="text-center">
      <p className="text-5xl">{word.emoji}</p>
      <p className="font-black text-2xl">{word.zh}</p>
      <div className="flex justify-center gap-2 my-3">
        {word.en.split('').map((_, idx) => (
          <div key={idx} className="w-10 h-10 rounded-xl border-2 border-dashed flex items-center justify-center font-black">
            {placed[idx] ?? ''}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 flex-wrap">
        {pool.map((ch, idx) => (
          <button key={`${ch}-${idx}`} onClick={() => {
            playClick();
            const next = [...placed, ch];
            setPlaced(next);
            setPool(p => p.filter((_, j) => j !== idx));
            if (next.length === word.en.length) {
              if (next.join('') === word.en) { playSuccess(); onScore(word); setI(n => n + 1); }
              else { playError(); speak('顺序不对'); setI(n => n); setPlaced([]); setPool(word.en.split('').sort(() => Math.random() - 0.5)); }
            }
          }} className="kid-btn w-11 bg-card border border-border">{ch}</button>
        ))}
      </div>
    </div>
  );
};

export default LanguagePage;
