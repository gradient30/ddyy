// 道闸乐园 - Web Speech API 语音合成（含移动端解锁）

let speechUnlocked = false;

/** 在首次用户点击时解锁语音合成（移动端必须） */
function unlockSpeech() {
  if (speechUnlocked) return;
  if (!('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance('');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  speechUnlocked = true;
}

// 监听首次用户交互来解锁
if (typeof window !== 'undefined') {
  const unlock = () => {
    unlockSpeech();
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('click', unlock);
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('click', unlock, { once: true });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function speak(text: string, lang: 'zh-CN' | 'en-US' = 'zh-CN', rate = 0.8): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.1;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function speakBilingual(zh: string, en: string, rate = 0.8): Promise<void> {
  return speak(zh, 'zh-CN', rate)
    .then(() => delay(400))
    .then(() => speak(en, 'en-US', rate));
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
