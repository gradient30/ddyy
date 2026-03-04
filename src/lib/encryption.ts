/**
 * 本地数据加密模块
 * 使用 Web Crypto API 进行客户端数据加密
 * 
 * 注意：这只是增加了一层保护，不能替代服务器端安全措施
 * 主要用途是防止本地存储数据被轻易读取
 */

// 加密配置
interface EncryptionConfig {
  algorithm: 'AES-GCM';
  keyLength: number;
  ivLength: number;
}

const DEFAULT_CONFIG: EncryptionConfig = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  ivLength: 12,
};

/**
 * 生成或获取加密密钥
 * 使用设备指纹 + 用户密码派生密钥
 */
export class EncryptionKey {
  private key: CryptoKey | null = null;
  private deviceId: string;

  constructor() {
    // 生成设备唯一标识（基于localStorage）
    this.deviceId = this.getOrCreateDeviceId();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem('__device_id');
    if (!deviceId) {
      deviceId = this.generateRandomId();
      localStorage.setItem('__device_id', deviceId);
    }
    return deviceId;
  }

  private generateRandomId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * 初始化密钥
   * @param password 用户密码（可选，用于增强安全性）
   */
  async initialize(password?: string): Promise<void> {
    const keyMaterial = await this.deriveKeyMaterial(password);
    this.key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.encodeString(this.deviceId),
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: DEFAULT_CONFIG.algorithm, length: DEFAULT_CONFIG.keyLength },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private async deriveKeyMaterial(password?: string): Promise<CryptoKey> {
    const keyData = this.encodeString(password || this.deviceId);
    return crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  private encodeString(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  getKey(): CryptoKey {
    if (!this.key) {
      throw new Error('Encryption key not initialized. Call initialize() first.');
    }
    return this.key;
  }

  isInitialized(): boolean {
    return this.key !== null;
  }
}

// 全局密钥实例
const globalKey = new EncryptionKey();

/**
 * 加密数据
 */
export async function encrypt(data: string): Promise<string> {
  if (!globalKey.isInitialized()) {
    await globalKey.initialize();
  }

  const key = globalKey.getKey();
  const iv = crypto.getRandomValues(new Uint8Array(DEFAULT_CONFIG.ivLength));
  const encoded = new TextEncoder().encode(data);

  const encrypted = await crypto.subtle.encrypt(
    { name: DEFAULT_CONFIG.algorithm, iv },
    key,
    encoded
  );

  // 将 IV 和加密数据组合
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // 转换为 Base64
  return arrayBufferToBase64(combined);
}

/**
 * 解密数据
 */
export async function decrypt(encryptedData: string): Promise<string> {
  if (!globalKey.isInitialized()) {
    await globalKey.initialize();
  }

  try {
    const key = globalKey.getKey();
    const combined = base64ToArrayBuffer(encryptedData);

    // 分离 IV 和加密数据
    const iv = combined.slice(0, DEFAULT_CONFIG.ivLength);
    const encrypted = combined.slice(DEFAULT_CONFIG.ivLength);

    const decrypted = await crypto.subtle.decrypt(
      { name: DEFAULT_CONFIG.algorithm, iv },
      key,
      encrypted
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data. Data may be corrupted or key mismatch.');
  }
}

/**
 * 加密对象
 */
export async function encryptObject<T extends object>(obj: T): Promise<string> {
  return encrypt(JSON.stringify(obj));
}

/**
 * 解密对象
 */
export async function decryptObject<T extends object>(encryptedData: string): Promise<T> {
  const decrypted = await decrypt(encryptedData);
  return JSON.parse(decrypted);
}

// ==================== 安全的本地存储 ====================

/**
 * 加密的 localStorage 包装器
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encrypted = await encrypt(value);
      localStorage.setItem(`enc:${key}`, encrypted);
    } catch (error) {
      console.error('Failed to encrypt storage:', error);
      // 降级：不加密存储
      localStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    // 先尝试读取加密版本
    const encrypted = localStorage.getItem(`enc:${key}`);
    if (encrypted) {
      try {
        return await decrypt(encrypted);
      } catch (error) {
        console.error('Failed to decrypt storage:', error);
        return null;
      }
    }

    // 回退到普通版本
    return localStorage.getItem(key);
  },

  removeItem(key: string): void {
    localStorage.removeItem(`enc:${key}`);
    localStorage.removeItem(key);
  },

  async setObject<T extends object>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },

  async getObject<T extends object>(key: string): Promise<T | null> {
    const data = await this.getItem(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },
};

// ==================== 工具函数 ====================

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// ==================== React Hook ====================

import { useState, useEffect, useCallback } from 'react';

export function useSecureStorage<T extends object>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // 加载数据
  useEffect(() => {
    const load = async () => {
      const data = await secureStorage.getObject<T>(key);
      if (data) {
        setValue(data);
      }
      setIsLoading(false);
    };
    load();
  }, [key]);

  // 保存数据
  const save = useCallback(async (newValue: T) => {
    setValue(newValue);
    await secureStorage.setObject(key, newValue);
  }, [key]);

  const remove = useCallback(async () => {
    secureStorage.removeItem(key);
    setValue(initialValue);
  }, [key, initialValue]);

  return { value, setValue: save, remove, isLoading };
}

// 导出
export { globalKey };
export default {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  secureStorage,
  EncryptionKey,
};
