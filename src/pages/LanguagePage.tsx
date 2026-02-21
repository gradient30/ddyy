import React, { useState, useCallback, useEffect } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { playClick, playSuccess, playError, vibrate } from '@/lib/sound';
import { speak, speakBilingual } from '@/lib/speech';

// ===================== VOCABULARY DATA =====================

interface Word {
  zh: string;
  en: string;
  pinyin: string;
  emoji: string;
  category: string;
}

const VOCAB: Word[] = [
  { zh: '车', en: 'car', pinyin: 'chē', emoji: '🚗', category: '交通' },
  { zh: '门', en: 'gate', pinyin: 'mén', emoji: '🚧', category: '交通' },
  { zh: '停', en: 'stop', pinyin: 'tíng', emoji: '🛑', category: '交通' },
  { zh: '行', en: 'go', pinyin: 'xíng', emoji: '🚶', category: '交通' },
  { zh: '红', en: 'red', pinyin: 'hóng', emoji: '🔴', category: '颜色' },
  { zh: '绿', en: 'green', pinyin: 'lǜ', emoji: '🟢', category: '颜色' },
  { zh: '蓝', en: 'blue', pinyin: 'lán', emoji: '🔵', category: '颜色' },
  { zh: '黄', en: 'yellow', pinyin: 'huáng', emoji: '🟡', category: '颜色' },
  { zh: '太阳', en: 'sun', pinyin: 'tài yáng', emoji: '☀️', category: 'STEM' },
  { zh: '电', en: 'electric', pinyin: 'diàn', emoji: '⚡', category: 'STEM' },
  { zh: '安全', en: 'safe', pinyin: 'ān quán', emoji: '🛡️', category: '交通' },
  { zh: '大', en: 'big', pinyin: 'dà', emoji: '🐘', category: '基础' },
  { zh: '小', en: 'small', pinyin: 'xiǎo', emoji: '🐭', category: '基础' },
  { zh: '上', en: 'up', pinyin: 'shàng', emoji: '⬆️', category: '基础' },
  { zh: '下', en: 'down', pinyin: 'xià', emoji: '⬇️', category: '基础' },
  { zh: '开', en: 'open', pinyin: 'kāi', emoji: '🔓', category: '基础' },
  { zh: '关', en: 'close', pinyin: 'guān', emoji: '🔒', category: '基础' },
  { zh: '圆', en: 'circle', pinyin: 'yuán', emoji: '⭕', category: '形状' },
  { zh: '方', en: 'square', pinyin: 'fāng', emoji: '⬜', category: '形状' },
  { zh: '星', en: 'star', pinyin: 'xīng', emoji: '⭐', category: '基础' },
];

type GameMode = 'menu' | 'match4' | 'flashcard' | 'spell';

// ===================== 4-WAY MATCH GAME =====================

const Match4Game: React.FC<{ onScore: () => void }> = ({ onScore }) => {
  const [round, setRound] = useState(0);
  const [words, setWords] = useState<Word[]>([]);
  const [target, setTarget] = useState<Word | null>(null);
  const [matchType, setMatchType] = useState<'emoji' | 'zh' | 'en'>('emoji');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const setupRound = useCallback(() => {
    const shuffled = [...VOCAB].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, 4);
    const tgt = picked[Math.floor(Math.random() * 4)];
    const types: ('emoji' | 'zh' | 'en')[] = ['emoji', 'zh', 'en'];
    setWords(picked);
    setTarget(tgt);
    setMatchType(types[Math.floor(Math.random() * types.length)]);
    setFeedback(null);
  }, []);

  useEffect(() => { setupRound(); }, [round, setupRound]);

  const handlePick = (word: Word) => {
    playClick();
    if (word.zh === target?.zh) {
      playSuccess();
      vibrate(80);
      setFeedback('correct');
      setScore(s => s + 1);
      onScore();
      speakBilingual(target.zh, target.en);
      setTimeout(() => setRound(r => r + 1), 1800);
    } else {
      playError();
      setFeedback('wrong');
      speak('再试试！');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (!target) return null;

  const prompt = matchType === 'emoji' ? target.emoji : matchType === 'zh' ? target.zh : target.en;
  const promptLabel = matchType === 'emoji' ? '找到这个图片对应的词' : matchType === 'zh' ? '找到这个汉字对应的图片' : '找到这个英语单词的图片';

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">得分: {score}</span>
      </div>
      <p className="text-sm text-muted-foreground">{promptLabel}</p>
      <div className={`text-5xl p-4 rounded-3xl bg-primary/10 ${feedback === 'correct' ? 'animate-pop-in' : ''}`}>
        {prompt}
      </div>
      <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
        {words.map(word => {
          const display = matchType === 'emoji'
            ? <><span className="text-lg font-black">{word.zh}</span><span className="text-xs text-muted-foreground">{word.en}</span></>
            : <span className="text-3xl">{word.emoji}</span>;
          return (
            <button key={word.zh} onClick={() => handlePick(word)}
              disabled={feedback === 'correct'}
              className={`flex flex-col items-center gap-1 p-4 rounded-2xl transition-all active:scale-95 ${
                feedback === 'correct' && word.zh === target.zh ? 'bg-accent/30 ring-2 ring-accent' :
                feedback === 'wrong' && word.zh !== target.zh ? '' : 'bg-card hover:bg-primary/10 border border-border'
              }`}>
              {display}
            </button>
          );
        })}
      </div>
      {feedback === 'correct' && (
        <div className="text-center animate-pop-in">
          <p className="text-xl">🎉 太棒了！</p>
          <p className="text-sm text-muted-foreground">{target.emoji} {target.zh}（{target.pinyin}）= {target.en}</p>
        </div>
      )}
    </div>
  );
};

// ===================== FLASHCARD MODE =====================

const FlashcardMode: React.FC<{ onScore: () => void }> = ({ onScore }) => {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const { addLearnedWord } = useGame();
  const word = VOCAB[index % VOCAB.length];

  const handleFlip = () => {
    playClick();
    setFlipped(!flipped);
    if (!flipped) speakBilingual(word.zh, word.en);
  };

  const handleNext = () => {
    playClick();
    vibrate(30);
    addLearnedWord(word.zh);
    onScore();
    setFlipped(false);
    setIndex(i => i + 1);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground">点击卡片翻转学习！第 {(index % VOCAB.length) + 1}/{VOCAB.length}</p>
      <button onClick={handleFlip}
        className="w-56 h-40 rounded-3xl bg-card border-2 border-border shadow-lg flex flex-col items-center justify-center gap-2 transition-all active:scale-95 hover:shadow-xl">
        {!flipped ? (
          <>
            <span className="text-5xl">{word.emoji}</span>
            <span className="text-xs text-muted-foreground">点击翻转 →</span>
          </>
        ) : (
          <>
            <span className="text-4xl font-black text-foreground">{word.zh}</span>
            <span className="text-sm text-muted-foreground">{word.pinyin}</span>
            <span className="text-lg font-bold text-primary">{word.en}</span>
          </>
        )}
      </button>
      {flipped && (
        <div className="flex gap-3">
          <button onClick={handleFlip}
            className="touch-target rounded-2xl bg-secondary/20 hover:bg-secondary/30 font-bold px-4 py-2 active:scale-95 transition-all text-foreground">
            🔄 再听一次
          </button>
          <button onClick={handleNext}
            className="touch-target rounded-2xl bg-accent/20 hover:bg-accent/30 font-bold px-4 py-2 active:scale-95 transition-all text-foreground">
            ✅ 学会了！
          </button>
        </div>
      )}
    </div>
  );
};

// ===================== SPELL MODE (NEW!) =====================

const SpellMode: React.FC<{ onScore: () => void }> = ({ onScore }) => {
  const spellableWords = VOCAB.filter(w => w.en.length >= 2 && w.en.length <= 6);
  const [wordIdx, setWordIdx] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [available, setAvailable] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);

  const word = spellableWords[wordIdx % spellableWords.length];

  // Setup round
  useEffect(() => {
    const letters = word.en.split('');
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    // Ensure shuffled differs from original for words > 1 letter
    if (shuffled.join('') === letters.join('') && letters.length > 1) {
      const tmp = shuffled[0];
      shuffled[0] = shuffled[1];
      shuffled[1] = tmp;
    }
    setAvailable(shuffled);
    setPlaced([]);
    setFeedback(null);
  }, [wordIdx, word.en]);

  const handlePickLetter = (idx: number) => {
    playClick();
    vibrate(20);
    const letter = available[idx];
    const newPlaced = [...placed, letter];
    setPlaced(newPlaced);
    setAvailable(prev => prev.filter((_, i) => i !== idx));

    // Check when all letters placed
    if (newPlaced.length === word.en.length) {
      const spelled = newPlaced.join('');
      if (spelled === word.en) {
        setFeedback('correct');
        playSuccess();
        vibrate(100);
        setScore(s => s + 1);
        onScore();
        speakBilingual(word.zh, word.en);
        setTimeout(() => setWordIdx(i => i + 1), 2000);
      } else {
        setFeedback('wrong');
        playError();
        speak('顺序不对，再试一次！');
        setTimeout(() => {
          // Reset
          const letters = word.en.split('');
          setAvailable([...letters].sort(() => Math.random() - 0.5));
          setPlaced([]);
          setFeedback(null);
        }, 1200);
      }
    }
  };

  const handleUndo = () => {
    if (placed.length === 0 || feedback) return;
    playClick();
    const last = placed[placed.length - 1];
    setPlaced(prev => prev.slice(0, -1));
    setAvailable(prev => [...prev, last]);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-muted-foreground">已拼: {score}</span>
      </div>

      {/* Target word display */}
      <div className="text-center">
        <span className="text-5xl">{word.emoji}</span>
        <p className="text-2xl font-black text-foreground mt-1">{word.zh}</p>
        <p className="text-sm text-muted-foreground">{word.pinyin}</p>
        <p className="text-xs text-muted-foreground mt-1">拼出英文单词！</p>
      </div>

      {/* Placed letters slots */}
      <div className="flex gap-2 justify-center">
        {word.en.split('').map((_, i) => (
          <div key={i} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center text-xl font-black transition-all ${
            placed[i]
              ? feedback === 'correct' ? 'bg-accent/30 border-accent' :
                feedback === 'wrong' ? 'bg-destructive/20 border-destructive' :
                'bg-primary/10 border-primary'
              : 'border-dashed border-muted-foreground/40'
          }`}>
            {placed[i] || ''}
          </div>
        ))}
      </div>

      {/* Available letters */}
      <div className="flex gap-2 flex-wrap justify-center">
        {available.map((letter, i) => (
          <button key={`${letter}-${i}`} onClick={() => handlePickLetter(i)}
            disabled={feedback !== null}
            className="w-12 h-12 rounded-2xl bg-card border-2 border-border hover:border-primary/40 text-xl font-black text-foreground active:scale-90 transition-all shadow-sm">
            {letter}
          </button>
        ))}
      </div>

      {/* Undo button */}
      {placed.length > 0 && !feedback && (
        <button onClick={handleUndo}
          className="text-sm text-muted-foreground hover:text-foreground underline">
          ↩️ 撤销
        </button>
      )}

      {feedback === 'correct' && (
        <div className="text-center animate-pop-in">
          <p className="text-xl">🎉 拼对了！</p>
          <p className="text-sm text-muted-foreground">{word.emoji} {word.zh} = {word.en}</p>
        </div>
      )}
    </div>
  );
};

// ===================== MAIN LANGUAGE PAGE =====================

const LanguagePage: React.FC = () => {
  const { addStars, addBadge } = useGame();
  const [mode, setMode] = useState<GameMode>('menu');
  const [totalScore, setTotalScore] = useState(0);

  const handleScore = () => {
    setTotalScore(s => {
      const next = s + 1;
      if (next % 5 === 0) addStars(2);
      if (next === 20) {
        addBadge('语言小达人');
        speak('恭喜！获得语言小达人徽章！');
      }
      return next;
    });
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-golden/15 via-background to-primary/10 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          {mode === 'menu' ? (
            <>
              <div className="text-center mb-6">
                <XiaoZhaZha mood="happy" size={80} />
                <h1 className="text-3xl font-black text-foreground mt-2">📚 语言魔法屋</h1>
                <p className="text-muted-foreground">认字学词真有趣！已学 {totalScore} 个</p>
              </div>
              <div className="grid gap-3">
                <button onClick={() => { playClick(); setMode('match4'); }}
                  className="flex items-center gap-4 p-5 rounded-3xl bg-card border-2 border-border hover:border-primary/30 transition-all active:scale-[0.97]">
                  <span className="text-4xl">🎯</span>
                  <div className="text-left">
                    <p className="font-bold text-foreground">四连匹配</p>
                    <p className="text-sm text-muted-foreground">图片↔汉字↔英语 快速匹配</p>
                  </div>
                </button>
                <button onClick={() => { playClick(); setMode('flashcard'); }}
                  className="flex items-center gap-4 p-5 rounded-3xl bg-card border-2 border-border hover:border-primary/30 transition-all active:scale-[0.97]">
                  <span className="text-4xl">🃏</span>
                  <div className="text-left">
                    <p className="font-bold text-foreground">翻转卡片</p>
                    <p className="text-sm text-muted-foreground">一个一个认，带发音哦</p>
                  </div>
                </button>
                <button onClick={() => { playClick(); setMode('spell'); }}
                  className="flex items-center gap-4 p-5 rounded-3xl bg-card border-2 border-border hover:border-primary/30 transition-all active:scale-[0.97]">
                  <span className="text-4xl">🔤</span>
                  <div className="text-left">
                    <p className="font-bold text-foreground">拼单词</p>
                    <p className="text-sm text-muted-foreground">看图拼英文，锻炼记忆力！</p>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { playClick(); setMode('menu'); }}
                className="touch-target rounded-2xl bg-card hover:bg-muted px-4 py-2 font-bold text-foreground mb-4 active:scale-95 transition-all">
                ← 返回
              </button>
              <div className="bg-card rounded-3xl shadow-lg p-5">
                <h2 className="text-xl font-black text-center text-foreground mb-4">
                  {mode === 'match4' ? '🎯 四连匹配' : mode === 'flashcard' ? '🃏 翻转卡片' : '🔤 拼单词'}
                </h2>
                {mode === 'match4' && <Match4Game onScore={handleScore} />}
                {mode === 'flashcard' && <FlashcardMode onScore={handleScore} />}
                {mode === 'spell' && <SpellMode onScore={handleScore} />}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LanguagePage;
