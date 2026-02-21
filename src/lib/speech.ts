// 道闸乐园 - Web Speech API 语音合成

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
  return speak(zh, 'zh-CN', rate).then(() => speak(en, 'en-US', rate));
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
