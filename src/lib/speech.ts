import { getAudioFlags } from '@/lib/audio-flags';
import { AUDIO_MANIFEST } from '@/data/audio-manifest';

let speechUnlocked = false;
let defaultRate = 0.78;
let currentAudio: HTMLAudioElement | null = null;
let voicesReady = false;

export function setSpeechDefaults(opts: { rate?: number }): void {
  if (typeof opts.rate === 'number' && opts.rate > 0) {
    defaultRate = opts.rate;
  }
}

function unlockSpeech() {
  if (speechUnlocked) return;
  if ('speechSynthesis' in window) {
    const u = new SpeechSynthesisUtterance('');
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }
  speechUnlocked = true;
}

function warmVoices() {
  if (!('speechSynthesis' in window)) return;
  const load = () => {
    window.speechSynthesis.getVoices();
    voicesReady = true;
  };
  load();
  window.speechSynthesis.addEventListener('voiceschanged', load, { once: true });
}

if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockSpeech();
    warmVoices();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
  warmVoices();
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clipUrl(file: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${file}`.replace(/([^:]\/)\/+/g, '$1');
}

function stopAudio() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

function playClip(file: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      stopAudio();
      const audio = new Audio(clipUrl(file));
      currentAudio = audio;
      audio.onended = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve(true);
      };
      audio.onerror = () => {
        if (currentAudio === audio) currentAudio = null;
        resolve(false);
      };
      audio.play().catch(() => resolve(false));
    } catch {
      resolve(false);
    }
  });
}

function pickVoice(lang: 'zh-CN' | 'en-US'): SpeechSynthesisVoice | undefined {
  if (!('speechSynthesis' in window)) return undefined;
  const voices = window.speechSynthesis.getVoices();
  const prefix = lang.slice(0, 2);
  const pool = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));
  const prefer = lang === 'zh-CN'
    ? [/xiaoyi/i, /xiaoshuang/i, /xiaoxiao/i, /yunxia/i, /huihui/i, /yaoyao/i, /ting/i, /female/i, /neural/i]
    : [/jenny/i, /aria/i, /samantha/i, /female/i, /natural/i, /neural/i];
  for (const re of prefer) {
    const hit = pool.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return pool[0];
}

function speakTts(text: string, lang: 'zh-CN' | 'en-US', rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = Math.min(0.92, Math.max(0.62, rate));
    utterance.pitch = lang === 'zh-CN' ? 1.02 : 1.0;
    const voice = pickVoice(lang);
    if (voice) utterance.voice = voice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function speak(text: string, lang: 'zh-CN' | 'en-US' = 'zh-CN', rate = defaultRate): Promise<void> {
  if (!getAudioFlags().voice || !text.trim()) return;
  stopAudio();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const file = AUDIO_MANIFEST[`${lang}|${text}`];
  if (file) {
    const ok = await playClip(file);
    if (ok) return;
  }
  await speakTts(text, lang, rate);
}

export function speakBilingual(zh: string, en: string, rate = defaultRate): Promise<void> {
  return speak(zh, 'zh-CN', rate)
    .then(() => delay(380))
    .then(() => speak(en, 'en-US', rate));
}

export function stopSpeaking(): void {
  stopAudio();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
