import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { playClick } from '@/lib/sound';

const exercises = [
  { emoji: '👀', name: '转转眼睛', desc: '眼睛画大圆圈，顺时针转5圈' },
  { emoji: '😌', name: '闭眼休息', desc: '轻轻闭上眼睛，深呼吸10秒' },
  { emoji: '🌳', name: '远眺绿色', desc: '看看窗外远处的树和天空' },
  { emoji: '😊', name: '眨眨眼', desc: '快速眨眼10次，让眼睛湿润' },
];

function generateMathQuestion(): { question: string; answer: number } {
  const isAdd = Math.random() > 0.4;
  if (isAdd) {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * (10 - a)) + 1;
    return { question: `${a} + ${b} = ?`, answer: a + b };
  } else {
    const a = Math.floor(Math.random() * 9) + 2;
    const b = Math.floor(Math.random() * (a - 1)) + 1;
    return { question: `${a} - ${b} = ?`, answer: a - b };
  }
}

const RestMode: React.FC = () => {
  const { restSeconds, resetTimer } = useGame();
  const [exerciseIdx, setExerciseIdx] = useState(0);
  const [showUnlock, setShowUnlock] = useState(false);
  const [mathQ, setMathQ] = useState(generateMathQuestion);
  const [userAnswer, setUserAnswer] = useState('');
  const [wrong, setWrong] = useState(false);

  const mins = Math.floor(restSeconds / 60);
  const secs = restSeconds % 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setExerciseIdx(prev => (prev + 1) % exercises.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUnlockAttempt = useCallback(() => {
    const num = parseInt(userAnswer, 10);
    if (num === mathQ.answer) {
      playClick();
      resetTimer();
    } else {
      setWrong(true);
      setUserAnswer('');
      setMathQ(generateMathQuestion());
      setTimeout(() => setWrong(false), 800);
    }
  }, [userAnswer, mathQ, resetTimer]);

  const handleNumPad = (d: string) => {
    playClick();
    if (d === 'del') {
      setUserAnswer(prev => prev.slice(0, -1));
    } else if (d === 'ok') {
      handleUnlockAttempt();
    } else if (userAnswer.length < 2) {
      setUserAnswer(prev => prev + d);
    }
  };

  const ex = exercises[exerciseIdx];

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[hsl(220,40%,15%)] to-[hsl(240,30%,10%)] flex flex-col items-center justify-center text-primary-foreground p-6">
      <div className="absolute top-8 right-8 text-5xl animate-float">🌙</div>
      <div className="absolute top-16 left-12 text-2xl animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute top-24 right-24 text-xl animate-bounce-gentle" style={{ animationDelay: '1s' }}>⭐</div>

      <XiaoZhaZha mood="sleeping" size={120} className="mb-6" />

      <h1 className="text-3xl md:text-4xl font-black mb-2">🏠 休息小屋</h1>
      <p className="text-lg text-primary-foreground/70 mb-6">让眼睛休息一下吧！</p>

      <div className="text-6xl font-black mb-8 tabular-nums">
        {mins}:{secs.toString().padStart(2, '0')}
      </div>

      {!showUnlock && (
        <div className="bg-card/10 backdrop-blur rounded-3xl p-8 max-w-sm w-full text-center animate-pop-in" key={exerciseIdx}>
          <div className="text-6xl mb-4">{ex.emoji}</div>
          <h2 className="text-2xl font-bold mb-2">{ex.name}</h2>
          <p className="text-lg text-primary-foreground/80">{ex.desc}</p>
        </div>
      )}

      {showUnlock && (
        <div className="bg-card/10 backdrop-blur rounded-3xl p-6 max-w-xs w-full text-center animate-pop-in">
          <h2 className="text-xl font-bold mb-1">🔓 家长解锁</h2>
          <p className="text-sm text-primary-foreground/60 mb-4">请回答算术题</p>

          <div className="text-3xl font-black mb-4">{mathQ.question}</div>

          <div className={`w-20 h-14 mx-auto rounded-2xl border-2 flex items-center justify-center text-3xl font-black mb-4 transition-all ${wrong ? 'border-destructive bg-destructive/20 animate-shake' : 'border-primary-foreground/30 bg-card/10'}`}>
            {userAnswer || '_'}
          </div>

          <div className="grid grid-cols-4 gap-2 max-w-[220px] mx-auto">
            {['1','2','3','del','4','5','6','ok','7','8','9','0'].map((d, i) => (
              <button
                key={i}
                onClick={() => handleNumPad(d)}
                className={`h-11 rounded-xl font-bold text-lg active:scale-95 transition-all ${
                  d === 'ok' ? 'bg-primary text-primary-foreground' :
                  d === 'del' ? 'bg-muted/20 text-primary-foreground/70' :
                  'bg-card/15 text-primary-foreground border border-primary-foreground/10'
                }`}
              >
                {d === 'del' ? '⌫' : d === 'ok' ? '✓' : d}
              </button>
            ))}
          </div>

          <button
            onClick={() => { playClick(); setShowUnlock(false); setUserAnswer(''); }}
            className="mt-4 text-sm text-primary-foreground/50 underline"
          >
            返回
          </button>
        </div>
      )}

      {!showUnlock && (
        <p className="mt-8 text-sm text-primary-foreground/50">休息结束后会自动回到游戏哦 💤</p>
      )}

      {!showUnlock && (
        <button
          onClick={() => { playClick(); setShowUnlock(true); setMathQ(generateMathQuestion()); setUserAnswer(''); }}
          className="absolute bottom-6 right-6 w-12 h-12 rounded-full bg-card/10 border border-primary-foreground/20 flex items-center justify-center text-xl active:scale-90 transition-all"
          aria-label="家长解锁"
        >
          🔓
        </button>
      )}
    </div>
  );
};

export default RestMode;
