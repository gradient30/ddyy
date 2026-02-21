import React, { useState, useCallback, useRef } from 'react';
import GlobalNav from '@/components/nav/GlobalNav';
import XiaoZhaZha from '@/components/mascot/XiaoZhaZha';
import { useGame } from '@/contexts/GameContext';
import { vibrate } from '@/lib/sound';
import { speak } from '@/lib/speech';

// ===================== DRUM SOUNDS =====================

function playDrum(type: 'kick' | 'snare' | 'hihat' | 'tom'): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    switch (type) {
      case 'kick':
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3);
        break;
      case 'snare':
        osc.frequency.value = 200;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15);
        // Noise layer
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        const ng = ctx.createGain();
        noise.buffer = buf;
        noise.connect(ng);
        ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.3, now);
        ng.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        noise.start(now); noise.stop(now + 0.1);
        break;
      case 'hihat':
        osc.frequency.value = 800;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
        break;
      case 'tom':
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now); osc.stop(now + 0.25);
        break;
    }
  } catch {}
}

// ===================== RHYTHM PATTERNS =====================

interface RhythmPattern {
  name: string;
  emoji: string;
  beats: ('kick' | 'snare' | 'hihat' | 'tom')[];
  bpm: number;
}

const PATTERNS: RhythmPattern[] = [
  { name: '基础节拍', emoji: '🥁', beats: ['kick', 'hihat', 'snare', 'hihat', 'kick', 'hihat', 'snare', 'hihat'], bpm: 100 },
  { name: '快乐鼓点', emoji: '🎉', beats: ['kick', 'kick', 'snare', 'tom', 'kick', 'hihat', 'snare', 'tom'], bpm: 120 },
  { name: '道闸节奏', emoji: '🚧', beats: ['tom', 'tom', 'kick', 'snare', 'hihat', 'hihat', 'kick', 'snare'], bpm: 90 },
];

const PADS = [
  { type: 'kick' as const, label: '咚', emoji: '🔴', color: 'bg-destructive/20 hover:bg-destructive/30 active:bg-destructive/50' },
  { type: 'snare' as const, label: '嗒', emoji: '🟡', color: 'bg-secondary/20 hover:bg-secondary/30 active:bg-secondary/50' },
  { type: 'hihat' as const, label: '嚓', emoji: '🟢', color: 'bg-accent/20 hover:bg-accent/30 active:bg-accent/50' },
  { type: 'tom' as const, label: '嘭', emoji: '🔵', color: 'bg-primary/20 hover:bg-primary/30 active:bg-primary/50' },
];

const MusicPage: React.FC = () => {
  const { addStars, addBadge } = useGame();
  const [barrierAngle, setBarrierAngle] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [activePattern, setActivePattern] = useState<number | null>(null);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [lastHit, setLastHit] = useState<string | null>(null);

  const handlePadHit = useCallback((type: 'kick' | 'snare' | 'hihat' | 'tom') => {
    playDrum(type);
    vibrate(30);
    setLastHit(type);
    setTimeout(() => setLastHit(null), 150);

    // Barrier reacts to hits
    setBarrierAngle(prev => {
      const next = prev >= -85 ? prev - 15 : 0;
      return next;
    });
    setTimeout(() => setBarrierAngle(prev => Math.min(0, prev + 15)), 300);

    setHitCount(prev => {
      const next = prev + 1;
      if (next % 20 === 0) {
        addStars(1);
      }
      if (next === 50) {
        addBadge('节奏小鼓手');
        speak('太棒了！获得节奏小鼓手徽章！');
      }
      return next;
    });
  }, [addStars, addBadge]);

  const playPattern = (idx: number) => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
      setCurrentBeat(-1);
      return;
    }
    setActivePattern(idx);
    setPlaying(true);
    const pattern = PATTERNS[idx];
    const ms = 60000 / pattern.bpm;
    let beat = 0;
    intervalRef.current = setInterval(() => {
      const type = pattern.beats[beat % pattern.beats.length];
      playDrum(type);
      setCurrentBeat(beat % pattern.beats.length);
      setBarrierAngle(type === 'kick' || type === 'tom' ? -40 : -20);
      setTimeout(() => setBarrierAngle(0), ms * 0.4);
      beat++;
      if (beat >= pattern.beats.length * 2) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPlaying(false);
        setCurrentBeat(-1);
        addStars(1);
      }
    }, ms);
  };

  return (
    <>
      <GlobalNav />
      <div className="min-h-screen bg-gradient-to-b from-purple-fun/15 via-background to-primary/10 pt-20 pb-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-4">
            <XiaoZhaZha mood="excited" size={70} />
            <h1 className="text-3xl font-black text-foreground mt-2">🎵 音乐律动场</h1>
            <p className="text-muted-foreground">敲击鼓点，让道闸跳舞！</p>
          </div>

          {/* Barrier Animation */}
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 160 100" className="w-48 h-28">
              <rect x="35" y="60" width="20" height="35" rx="4" fill="hsl(var(--foreground) / 0.3)" />
              <rect x="40" y="25" width="10" height="40" rx="3" fill="hsl(var(--foreground) / 0.4)" />
              <g style={{ transformOrigin: '50px 30px', transition: 'transform 0.15s', transform: `rotate(${barrierAngle}deg)` }}>
                <rect x="50" y="27" width="80" height="6" rx="3" fill="hsl(var(--coral-red))" />
                <circle cx="130" cy="30" r="3" fill="hsl(var(--secondary))" />
              </g>
            </svg>
          </div>

          {/* Drum Pads */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {PADS.map(pad => (
              <button key={pad.type}
                onPointerDown={() => handlePadHit(pad.type)}
                className={`touch-target rounded-3xl ${pad.color} flex flex-col items-center justify-center gap-1 py-6 transition-all ${lastHit === pad.type ? 'scale-90' : ''} active:scale-90`}>
                <span className="text-3xl">{pad.emoji}</span>
                <span className="text-lg font-black text-foreground">{pad.label}</span>
              </button>
            ))}
          </div>

          {/* Beat count */}
          <p className="text-center text-sm text-muted-foreground mb-4">
            敲击次数: {hitCount} 🥁
          </p>

          {/* Rhythm Patterns */}
          <h3 className="font-bold text-foreground text-center mb-2">🎶 跟着节奏打</h3>
          <div className="grid gap-2">
            {PATTERNS.map((pat, idx) => (
              <button key={idx} onClick={() => playPattern(idx)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.97] ${
                  playing && activePattern === idx ? 'bg-primary/20 border-2 border-primary' : 'bg-card border-2 border-border hover:border-primary/30'
                }`}>
                <span className="text-2xl">{pat.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold text-foreground text-sm">{pat.name}</p>
                  <div className="flex gap-1 mt-1">
                    {pat.beats.map((b, i) => (
                      <span key={i} className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                        currentBeat === i && playing && activePattern === idx ? 'ring-2 ring-primary scale-125' : ''
                      } ${b === 'kick' ? 'bg-destructive/30' : b === 'snare' ? 'bg-secondary/30' : b === 'hihat' ? 'bg-accent/30' : 'bg-primary/30'}`}>
                        {b[0].toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-sm font-bold text-muted-foreground">
                  {playing && activePattern === idx ? '⏹' : '▶️'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MusicPage;
