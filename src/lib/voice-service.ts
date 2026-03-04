/**
 * 语音服务抽象层
 * 支持多种语音合成提供商：
 * - Web Speech API (浏览器原生，免费)
 * - 科大讯飞 (需要后端代理)
 * - 百度语音 (需要后端代理)
 * 
 * 使用方式：
 * const voice = createVoiceService('xunfei', { appId: 'xxx', apiKey: 'xxx' });
 * await voice.speak('你好，小朋友！');
 * 
 * 🎙️ 手动配置支持：
 * 在浏览器控制台运行: window.voiceConfig.help()
 * 或通过 localStorage 配置: window.voiceConfig.save({ provider: 'xunfei', ... })
 */

import { getVoiceConfig, toServiceConfig } from './voice-config';

// 语音服务类型
type VoiceProvider = 'webspeech' | 'xunfei' | 'baidu' | 'mock';

// 语音配置
interface VoiceConfig {
  provider: VoiceProvider;
  // Web Speech API 配置
  webSpeech?: {
    lang?: string;
    rate?: number;
    pitch?: number;
    voice?: SpeechSynthesisVoice;
  };
  // 科大讯飞配置 (需要后端代理)
  xunfei?: {
    appId: string;
    apiKey: string;
    apiSecret?: string;
    voice?: string;
    speed?: number;
    pitch?: number;
    volume?: number;
  };
  // 百度语音配置 (需要后端代理)
  baidu?: {
    appId: string;
    apiKey: string;
    secretKey?: string;
    per?: number; // 发音人
    spd?: number; // 语速
    pit?: number; // 音调
    vol?: number; // 音量
  };
}

// 语音服务接口
interface VoiceService {
  speak(text: string, options?: Partial<VoiceConfig>): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  isSpeaking(): boolean;
  getVoices(): Promise<string[]>;
  setVoice(voiceId: string): void;
}

// ==================== Web Speech API 实现 ====================

class WebSpeechService implements VoiceService {
  private config: Required<VoiceConfig['webSpeech']>;
  private utterance: SpeechSynthesisUtterance | null = null;
  private isCurrentlySpeaking = false;

  constructor(config: VoiceConfig['webSpeech'] = {}) {
    this.config = {
      lang: config?.lang ?? 'zh-CN',
      rate: config?.rate ?? 0.9,
      pitch: config?.pitch ?? 1.1,
      voice: config?.voice ?? null!,
    };
  }

  async speak(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    if (!('speechSynthesis' in window)) {
      console.warn('Web Speech API not supported');
      return;
    }

    // 取消之前的语音
    window.speechSynthesis.cancel();

    return new Promise((resolve, reject) => {
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.lang = options?.webSpeech?.lang ?? this.config.lang;
      this.utterance.rate = options?.webSpeech?.rate ?? this.config.rate;
      this.utterance.pitch = options?.webSpeech?.pitch ?? this.config.pitch;

      if (options?.webSpeech?.voice) {
        this.utterance.voice = options.webSpeech.voice;
      } else if (this.config.voice) {
        this.utterance.voice = this.config.voice;
      }

      this.utterance.onstart = () => {
        this.isCurrentlySpeaking = true;
      };

      this.utterance.onend = () => {
        this.isCurrentlySpeaking = false;
        resolve();
      };

      this.utterance.onerror = (event) => {
        this.isCurrentlySpeaking = false;
        console.error('Speech synthesis error:', event);
        reject(event);
      };

      // 移动端需要先解锁
      this.unlockSpeech().then(() => {
        window.speechSynthesis.speak(this.utterance!);
      });
    });
  }

  private async unlockSpeech(): Promise<void> {
    // 在移动端，语音合成需要在用户交互中触发
    // 这里创建一个静音的utterance来解锁
    const silentUtterance = new SpeechSynthesisUtterance('');
    silentUtterance.volume = 0;
    window.speechSynthesis.speak(silentUtterance);
    window.speechSynthesis.cancel();
  }

  stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isCurrentlySpeaking = false;
    }
  }

  pause(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  resume(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  async getVoices(): Promise<string[]> {
    if (!('speechSynthesis' in window)) {
      return [];
    }

    const voices = window.speechSynthesis.getVoices();
    return voices
      .filter(v => v.lang.startsWith('zh'))
      .map(v => v.name);
  }

  setVoice(voiceId: string): void {
    if (!('speechSynthesis' in window)) return;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === voiceId);
    if (voice) {
      this.config.voice = voice;
    }
  }
}

// ==================== 科大讯飞语音服务 (需要后端代理) ====================

class XunfeiVoiceService implements VoiceService {
  private config: Required<VoiceConfig['xunfei']>;
  private audio: HTMLAudioElement | null = null;
  private isCurrentlySpeaking = false;

  constructor(config: VoiceConfig['xunfei']) {
    if (!config) {
      throw new Error('Xunfei config required');
    }

    this.config = {
      appId: config.appId,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret ?? '',
      voice: config.voice ?? 'xiaoyan',
      speed: config.speed ?? 50,
      pitch: config.pitch ?? 50,
      volume: config.volume ?? 50,
    };
  }

  async speak(text: string, options?: Partial<VoiceConfig>): Promise<void> {
    try {
      // 注意：这里需要后端代理，前端不能直接调用科大讯飞API
      // 因为会暴露 API Key
      const response = await fetch('/api/voice/xunfei', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          appId: this.config.appId,
          voice: options?.xunfei?.voice ?? this.config.voice,
          speed: options?.xunfei?.speed ?? this.config.speed,
          pitch: options?.xunfei?.pitch ?? this.config.pitch,
          volume: options?.xunfei?.volume ?? this.config.volume,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to synthesize speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return new Promise((resolve, reject) => {
        this.audio = new Audio(audioUrl);
        this.audio.onplay = () => {
          this.isCurrentlySpeaking = true;
        };
        this.audio.onended = () => {
          this.isCurrentlySpeaking = false;
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        this.audio.onerror = (error) => {
          this.isCurrentlySpeaking = false;
          reject(error);
        };
        this.audio.play();
      });
    } catch (error) {
      console.error('Xunfei TTS error:', error);
      // 降级到 Web Speech API
      console.warn('Falling back to Web Speech API');
      const fallback = new WebSpeechService();
      return fallback.speak(text, options);
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isCurrentlySpeaking = false;
    }
  }

  pause(): void {
    this.audio?.pause();
  }

  resume(): void {
    this.audio?.play();
  }

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  async getVoices(): Promise<string[]> {
    // 科大讯飞支持的音色列表
    return [
      'xiaoyan', // 小燕 - 女声
      'xiaoyu',  // 小宇 - 男声
      'catherine', // Catherine - 英文女声
      'henry',   // Henry - 英文男声
      'vixy',    // 小桃丸 - 东北话
      'xiaoqi',  // 小琪 - 台湾话
      'vils',    // 小蓉 - 四川话
    ];
  }

  setVoice(voiceId: string): void {
    this.config.voice = voiceId;
  }
}

// ==================== Mock 语音服务 (测试/离线模式) ====================

class MockVoiceService implements VoiceService {
  private isCurrentlySpeaking = false;

  async speak(text: string): Promise<void> {
    console.log('[Mock Voice]', text);
    this.isCurrentlySpeaking = true;
    
    // 模拟语音时长
    const duration = text.length * 200;
    await new Promise(resolve => setTimeout(resolve, duration));
    
    this.isCurrentlySpeaking = false;
  }

  stop(): void {
    this.isCurrentlySpeaking = false;
  }

  pause(): void {}
  resume(): void {}

  isSpeaking(): boolean {
    return this.isCurrentlySpeaking;
  }

  async getVoices(): Promise<string[]> {
    return ['mock-voice'];
  }

  setVoice(): void {}
}

// ==================== 工厂函数 ====================

export function createVoiceService(config: VoiceConfig): VoiceService {
  switch (config.provider) {
    case 'xunfei':
      return new XunfeiVoiceService(config.xunfei);
    case 'mock':
      return new MockVoiceService();
    case 'webspeech':
    default:
      return new WebSpeechService(config.webSpeech);
  }
}

// ==================== React Hook ====================

import { useState, useCallback, useEffect, useRef } from 'react';

export function useVoiceService(config: VoiceConfig) {
  const serviceRef = useRef<VoiceService>(createVoiceService(config));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<string[]>([]);
  const [currentVoice, setCurrentVoice] = useState<string>('');

  useEffect(() => {
    serviceRef.current.getVoices().then(v => {
      setVoices(v);
      if (v.length > 0) {
        setCurrentVoice(v[0]);
      }
    });
  }, []);

  const speak = useCallback(async (text: string, options?: Partial<VoiceConfig>) => {
    setIsSpeaking(true);
    try {
      await serviceRef.current.speak(text, options);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    serviceRef.current.stop();
    setIsSpeaking(false);
  }, []);

  const pause = useCallback(() => {
    serviceRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    serviceRef.current.resume();
  }, []);

  const setVoice = useCallback((voiceId: string) => {
    serviceRef.current.setVoice(voiceId);
    setCurrentVoice(voiceId);
  }, []);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    voices,
    currentVoice,
    setVoice,
  };
}

/**
 * 使用手动配置的语音服务 Hook
 * 自动读取 localStorage 或 window.__VOICE_CONFIG__ 中的配置
 * 
 * 配置方式：
 * 1. 运行时配置: window.__VOICE_CONFIG__ = { provider: 'xunfei', ... }
 * 2. 持久化配置: window.voiceConfig.save({ provider: 'xunfei', ... })
 * 
 * 在浏览器控制台运行: window.voiceConfig.help() 查看帮助
 */
export function useVoiceServiceWithManualConfig() {
  const [config, setConfig] = useState<VoiceConfig>(() => {
    const manualConfig = getVoiceConfig();
    return toServiceConfig(manualConfig);
  });

  const refreshConfig = useCallback(() => {
    const manualConfig = getVoiceConfig();
    setConfig(toServiceConfig(manualConfig));
    console.log('[VoiceService] 配置已刷新:', manualConfig);
  }, []);

  const voiceService = useVoiceService(config);

  return {
    ...voiceService,
    config,
    refreshConfig,
  };
}

// 默认导出
export default createVoiceService;
export type { VoiceConfig, VoiceProvider, VoiceService };
