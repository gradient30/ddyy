/**
 * 网络状态 Hook
 * 监听在线/离线状态和网络质量
 */

import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  /** 是否在线 */
  isOnline: boolean;
  /** 网络类型 (wifi, 4g, 3g, 2g, slow-2g, unknown) */
  type: string;
  /** 预估下行速度 (Mbps) */
  downlink: number;
  /** 预估往返时间 (ms) */
  rtt: number;
  /** 是否节省数据流量模式 */
  saveData: boolean;
  /** 网络质量: good | moderate | poor */
  quality: 'good' | 'moderate' | 'poor' | 'unknown';
}

/**
 * 网络状态 Hook
 * 
 * 使用示例:
 * const { isOnline, quality, type } = useNetworkStatus();
 * 
 * if (!isOnline) {
 *   return <OfflinePage />;
 * }
 * 
 * if (quality === 'poor') {
 *   return <LowQualityMode />;
 * }
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    type: 'unknown',
    downlink: 0,
    rtt: 0,
    saveData: false,
    quality: 'unknown',
  });

  const updateStatus = useCallback(() => {
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    const isOnline = navigator.onLine;
    
    let quality: NetworkStatus['quality'] = 'unknown';
    
    if (connection) {
      const { effectiveType, downlink, rtt, saveData } = connection;
      
      // 根据 effectiveType 判断网络质量
      switch (effectiveType) {
        case '4g':
        case 'wifi':
          quality = 'good';
          break;
        case '3g':
          quality = 'moderate';
          break;
        case '2g':
        case 'slow-2g':
          quality = 'poor';
          break;
        default:
          quality = 'unknown';
      }

      setStatus({
        isOnline,
        type: effectiveType || 'unknown',
        downlink: downlink || 0,
        rtt: rtt || 0,
        saveData: saveData || false,
        quality,
      });
    } else {
      setStatus(prev => ({
        ...prev,
        isOnline,
        quality: isOnline ? 'unknown' : 'poor',
      }));
    }
  }, []);

  useEffect(() => {
    // 初始状态
    updateStatus();

    // 监听在线/离线事件
    const handleOnline = () => {
      updateStatus();
    };

    const handleOffline = () => {
      setStatus(prev => ({
        ...prev,
        isOnline: false,
        quality: 'poor',
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 监听网络变化（如果支持）
    const connection = (navigator as any).connection ||
                       (navigator as any).mozConnection ||
                       (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', updateStatus);
      }
    };
  }, [updateStatus]);

  return status;
}

/**
 * 检查是否应该使用低质量模式
 * 基于网络状态和偏好设置
 */
export function shouldUseLowQualityMode(
  networkStatus: NetworkStatus,
  userPreference?: 'auto' | 'high' | 'low'
): boolean {
  // 用户明确选择高质量
  if (userPreference === 'high') return false;
  
  // 用户明确选择低质量
  if (userPreference === 'low') return true;

  // 自动判断
  if (!networkStatus.isOnline) return true;
  if (networkStatus.saveData) return true;
  if (networkStatus.quality === 'poor') return true;
  if (networkStatus.downlink < 1.5) return true;

  return false;
}

export default useNetworkStatus;
