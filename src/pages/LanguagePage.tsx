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

type GameMode = 'menu' | 'match4' | 'flashcard';

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

  const prompt = matchType === 'emoji' ? target.emoji :
                 matchType === 'zh' ? target.zh : target.en;
  const promptLabel = matchType === 'emoji' ? '找到这个图片对应的词' :
                      matchType === 'zh' ? '找到这个汉字对应的图片' : '找到这个英语单词的图片';

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
    if (!flipped) {
      speakBilingual(word.zh, word.en);
    }
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
                  {mode === 'match4' ? '🎯 四连匹配' : '🃏 翻转卡片'}
                </h2>
                {mode === 'match4' ? <Match4Game onScore={handleScore} /> : <FlashcardMode onScore={handleScore} />}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default LanguagePage;
