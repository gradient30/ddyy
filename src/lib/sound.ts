// 道闸乐园 — 用噪声 + 低频模拟金属、电机、落杆，而不是纯蜂鸣

import { getAudioFlags } from '@/lib/audio-flags';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function withAudio(fn: (ctx: AudioContext) => void): void {
  if (!getAudioFlags().sound) return;
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') void ctx.resume().catch(() => { /* resume may be blocked */ });
    fn(ctx);
  } catch {
    /* Web Audio may be blocked */
  }
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const n = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function playNoise(
  ctx: AudioContext,
  opts: {
    start?: number;
    duration: number;
    freq: number;
    q?: number;
    gain: number;
    type?: BiquadFilterType;
    freqTo?: number;
  },
): void {
  const start = opts.start ?? ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx, opts.duration + 0.05);
  const filter = ctx.createBiquadFilter();
  filter.type = opts.type ?? 'bandpass';
  filter.frequency.setValueAtTime(opts.freq, start);
  if (opts.freqTo) filter.frequency.linearRampToValueAtTime(opts.freqTo, start + opts.duration);
  filter.Q.value = opts.q ?? 1.2;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(opts.gain, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + opts.duration);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  src.start(start);
  src.stop(start + opts.duration);
}

function playTone(
  ctx: AudioContext,
  opts: {
    start?: number;
    duration: number;
    freq: number;
    freqTo?: number;
    gain: number;
    type?: OscillatorType;
  },
): void {
  const start = opts.start ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? 'sine';
  osc.frequency.setValueAtTime(opts.freq, start);
  if (opts.freqTo) osc.frequency.linearRampToValueAtTime(opts.freqTo, start + opts.duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  gain.gain.setValueAtTime(opts.gain, start);
  gain.gain.exponentialRampToValueAtTime(0.001, start + opts.duration);
  osc.start(start);
  osc.stop(start + opts.duration);
}

/** 轻点按钮：短促塑料壳 + 一点高频 */
export function playClick(): void {
  withAudio((ctx) => {
    playNoise(ctx, { duration: 0.04, freq: 2400, q: 0.8, gain: 0.12, type: 'highpass' });
    playTone(ctx, { duration: 0.07, freq: 420, gain: 0.08, type: 'triangle' });
  });
}

/** 答对：两下轻铃，不像游戏机连奏 */
export function playSuccess(): void {
  withAudio((ctx) => {
    playTone(ctx, { duration: 0.16, freq: 523, gain: 0.16, type: 'sine' });
    playTone(ctx, { start: ctx.currentTime + 0.12, duration: 0.22, freq: 659, gain: 0.14, type: 'sine' });
  });
}

export function playError(): void {
  withAudio((ctx) => {
    playNoise(ctx, { duration: 0.12, freq: 180, q: 0.7, gain: 0.14, type: 'lowpass' });
    playTone(ctx, { duration: 0.22, freq: 140, freqTo: 90, gain: 0.16, type: 'triangle' });
  });
}

export function playStarCollect(): void {
  withAudio((ctx) => {
    playTone(ctx, { duration: 0.12, freq: 880, gain: 0.1, type: 'sine' });
    playTone(ctx, { start: ctx.currentTime + 0.07, duration: 0.16, freq: 1174, gain: 0.09, type: 'sine' });
  });
}

/** 拧螺栓 / 零件卡进槽：金属咔哒 + 壳体闷响 */
export function playPlacePart(): void {
  withAudio((ctx) => {
    playNoise(ctx, { duration: 0.045, freq: 2800, q: 1.6, gain: 0.18, type: 'bandpass' });
    playTone(ctx, { duration: 0.09, freq: 190, gain: 0.14, type: 'triangle' });
    playTone(ctx, { start: ctx.currentTime + 0.03, duration: 0.08, freq: 90, gain: 0.12, type: 'sine' });
  });
}

/** 电机齿轮箱：低频嗡 + 带通噪声扫频 */
export function playMotorWhir(seconds = 1.4): void {
  withAudio((ctx) => {
    playTone(ctx, { duration: seconds, freq: 78, freqTo: 96, gain: 0.1, type: 'sawtooth' });
    playNoise(ctx, { duration: seconds, freq: 320, freqTo: 520, q: 2.4, gain: 0.1, type: 'bandpass' });
  });
}

/** 抬杆：电机启动 → 杆臂空气声 → 到位限位撞击 */
export function playBarrierLift(): void {
  withAudio((ctx) => {
    const t = ctx.currentTime;
    playTone(ctx, { start: t, duration: 1.5, freq: 72, freqTo: 108, gain: 0.11, type: 'sawtooth' });
    playNoise(ctx, { start: t, duration: 1.5, freq: 280, freqTo: 640, q: 1.8, gain: 0.09, type: 'bandpass' });
    playNoise(ctx, { start: t + 0.15, duration: 1.2, freq: 900, freqTo: 500, q: 0.7, gain: 0.05, type: 'highpass' });
    playNoise(ctx, { start: t + 1.45, duration: 0.08, freq: 1600, q: 2, gain: 0.16, type: 'bandpass' });
    playTone(ctx, { start: t + 1.45, duration: 0.14, freq: 70, gain: 0.18, type: 'triangle' });
  });
}

/** 落杆：重力加速 + 橡胶缓冲垫闷响 */
export function playBarrierDrop(): void {
  withAudio((ctx) => {
    const t = ctx.currentTime;
    playTone(ctx, { start: t, duration: 1.1, freq: 110, freqTo: 68, gain: 0.1, type: 'sawtooth' });
    playNoise(ctx, { start: t, duration: 1.1, freq: 500, freqTo: 240, q: 1.4, gain: 0.08, type: 'bandpass' });
    playNoise(ctx, { start: t + 1.05, duration: 0.12, freq: 220, q: 0.8, gain: 0.18, type: 'lowpass' });
    playTone(ctx, { start: t + 1.05, duration: 0.18, freq: 58, gain: 0.2, type: 'sine' });
  });
}

export function vibrate(ms = 50): void {
  if (!getAudioFlags().vibrate) return;
  try {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  } catch {
    /* vibration may be blocked */
  }
}
