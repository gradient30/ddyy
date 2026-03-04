/**
 * 语音服务手动配置模块
 * 支持通过 localStorage 或 window 对象手动配置语音服务参数
 */

import type { VoiceServiceConfig } from './voice-service';

const CONFIG_KEY = '__voice_service_config__';

/**
 * 默认语音配置
 */
export const defaultVoiceConfig: VoiceServiceConfig = {
  provider: 'webspeech',
  lang: 'zh-CN',
};

/**
 * 语音配置接口
 */
export interface VoiceManualConfig {
  /** 提供商: webspeech | xunfei | mock */
  provider: 'webspeech' | 'xunfei' | 'mock';
  /** 语言代码 */
  lang?: string;
  /** 语速: 0-100 */
  speed?: number;
  /** 音调: 0-100 */
  pitch?: number;
  /** 音量: 0-100 */
  volume?: number;
  /** 科大讯飞配置 */
  xunfei?: {
    /** 代理服务器地址 */
    proxyUrl: string;
    /** 语音人 (xiaoyan/xiaofeng 等) */
    voice?: string;
  };
  /** Web Speech 配置 */
  webspeech?: {
    /** 语音名称 */
    voice?: string;
  };
}

/**
 * 获取当前语音配置
 * 优先级: window.__VOICE_CONFIG__ > localStorage > 默认配置
 */
export function getVoiceConfig(): VoiceManualConfig {
  try {
    // 1. 检查 window 对象配置（运行时配置，最高优先级）
    if (typeof window !== 'undefined' && (window as any).__VOICE_CONFIG__) {
      return {
        ...defaultVoiceConfig,
        ...(window as any).__VOICE_CONFIG__,
      };
    }

    // 2. 检查 localStorage 配置（持久化配置）
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      return {
        ...defaultVoiceConfig,
        ...JSON.parse(stored),
      };
    }
  } catch (error) {
    console.warn('[VoiceConfig] 读取配置失败:', error);
  }

  // 3. 返回默认配置
  return { ...defaultVoiceConfig };
}

/**
 * 保存语音配置到 localStorage
 */
export function saveVoiceConfig(config: Partial<VoiceManualConfig>): void {
  try {
    const current = getVoiceConfig();
    const newConfig = { ...current, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    console.log('[VoiceConfig] 配置已保存:', newConfig);
  } catch (error) {
    console.error('[VoiceConfig] 保存配置失败:', error);
  }
}

/**
 * 清除语音配置
 */
export function clearVoiceConfig(): void {
  try {
    localStorage.removeItem(CONFIG_KEY);
    console.log('[VoiceConfig] 配置已清除');
  } catch (error) {
    console.error('[VoiceConfig] 清除配置失败:', error);
  }
}

/**
 * 设置运行时配置（不保存到 localStorage）
 * 用于调试或动态切换
 */
export function setRuntimeVoiceConfig(config: Partial<VoiceManualConfig>): void {
  if (typeof window !== 'undefined') {
    (window as any).__VOICE_CONFIG__ = {
      ...(window as any).__VOICE_CONFIG__,
      ...config,
    };
    console.log('[VoiceConfig] 运行时配置已更新:', (window as any).__VOICE_CONFIG__);
  }
}

/**
 * 转换为 VoiceServiceConfig 格式
 */
export function toServiceConfig(config: VoiceManualConfig): VoiceServiceConfig {
  const baseConfig: VoiceServiceConfig = {
    provider: config.provider,
    lang: config.lang || 'zh-CN',
  };

  if (config.provider === 'xunfei' && config.xunfei) {
    baseConfig.xunfei = {
      appId: '', // 通过代理处理，前端不需要
      apiKey: '', // 通过代理处理，前端不需要
      apiSecret: '', // 通过代理处理，前端不需要
      proxyUrl: config.xunfei.proxyUrl,
      voice: config.xunfei.voice,
      speed: config.speed,
      pitch: config.pitch,
      volume: config.volume,
    };
  }

  if (config.provider === 'webspeech' && config.webspeech) {
    baseConfig.webspeech = {
      voice: config.webspeech.voice,
    };
  }

  return baseConfig;
}

/**
 * 配置示例（供开发者参考）
 */
export const configExamples = {
  // 使用 Web Speech API（默认，免费）
  webspeech: {
    provider: 'webspeech' as const,
    lang: 'zh-CN',
    speed: 50,
    pitch: 50,
    volume: 80,
  },

  // 使用科大讯飞（需要后端代理）
  xunfei: {
    provider: 'xunfei' as const,
    lang: 'zh-CN',
    speed: 50,
    pitch: 50,
    volume: 80,
    xunfei: {
      proxyUrl: 'wss://your-server.com/xunfei-tts',
      voice: 'xiaoyan',
    },
  },

  // 使用 Mock（测试用，无网络）
  mock: {
    provider: 'mock' as const,
    lang: 'zh-CN',
  },
};

/**
 * 声明全局配置接口
 */
declare global {
  interface Window {
    /** 语音服务运行时配置 */
    __VOICE_CONFIG__?: Partial<VoiceManualConfig>;
  }
}

/**
 * 控制台配置助手
 * 在浏览器控制台运行: window.voiceConfig.help()
 */
if (typeof window !== 'undefined') {
  (window as any).voiceConfig = {
    help: () => {
      console.log(`
🎙️ 语音服务手动配置指南

【方法1: 运行时配置】（立即生效，不保存）
window.__VOICE_CONFIG__ = {
  provider: 'webspeech',  // 或 'xunfei' | 'mock'
  lang: 'zh-CN',
  speed: 50,
  pitch: 50,
  volume: 80
};

【方法2: 持久化配置】（保存到 localStorage）
// 保存配置
window.voiceConfig.save({
  provider: 'xunfei',
  xunfei: {
    proxyUrl: 'wss://your-server.com/xunfei-tts',
    voice: 'xiaoyan'
  }
});

// 查看当前配置
window.voiceConfig.get();

// 清除配置
window.voiceConfig.clear();

【配置示例】
window.voiceConfig.examples

【当前配置】
`, window.voiceConfig.get());
    },
    get: getVoiceConfig,
    save: saveVoiceConfig,
    clear: clearVoiceConfig,
    setRuntime: setRuntimeVoiceConfig,
    examples: configExamples,
  };

  // 打印提示
  console.log('[VoiceConfig] 语音配置已就绪，运行 voiceConfig.help() 查看帮助');
}
