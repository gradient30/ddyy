/**
 * PWA 安装提示组件
 * 检测安装状态并提示用户添加到主屏幕
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Download, Share2, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 检查是否已经安装
    if (window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // 检查是否是 iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // 检查是否已经提示过
    const hasPrompted = localStorage.getItem('pwa-install-prompted');
    if (hasPrompted === 'true') return;

    // 监听 beforeinstallprompt 事件
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // 延迟显示提示，避免立即弹出
      setTimeout(() => {
        setIsVisible(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS 没有 beforeinstallprompt 事件，显示手动安装提示
    if (isIOSDevice) {
      setTimeout(() => {
        setIsVisible(true);
      }, 5000);
    }

    // 监听 appinstalled 事件
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-install-prompted', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS) {
      // iOS 显示安装指南
      return;
    }

    if (!deferredPrompt) return;

    // 显示安装提示
    deferredPrompt.prompt();

    // 等待用户响应
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('用户接受了安装提示');
    } else {
      console.log('用户拒绝了安装提示');
      localStorage.setItem('pwa-install-prompted', 'true');
    }

    setDeferredPrompt(null);
    setIsVisible(false);
  }, [deferredPrompt, isIOS]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem('pwa-install-prompted', 'true');
  }, []);

  if (isInstalled || !isVisible) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 z-50",
      "animate-in slide-in-from-bottom-4 duration-500"
    )}>
      <div className={cn(
        "max-w-md mx-auto",
        "bg-white rounded-2xl shadow-2xl",
        "border border-[#e9ecef]",
        "p-4 sm:p-6",
        "relative"
      )}>
        {/* 关闭按钮 */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="关闭"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="flex items-start gap-4">
          {/* 图标 */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5A9B8C] to-[#4A8B7C] flex items-center justify-center shrink-0">
            <span className="text-3xl">🦉</span>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 mb-1">
              安装道闸乐园
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isIOS 
                ? '添加到主屏幕，随时随地玩游戏！'
                : '添加到主屏幕，离线也能玩！更快、更流畅~'
              }
            </p>

            {isIOS ? (
              // iOS 安装指南
              <div className="bg-amber-50 rounded-xl p-3 text-sm">
                <p className="text-amber-800 mb-2">
                  <span className="font-semibold">iOS 安装步骤：</span>
                </p>
                <ol className="space-y-2 text-amber-700">
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">1</span>
                    点击下方的
                    <Share2 className="w-4 h-4 inline" />
                    分享按钮
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-xs font-bold">2</span>
                    选择"添加到主屏幕"
                  </li>
                </ol>
              </div>
            ) : (
              // Android/桌面安装按钮
              <div className="flex gap-2">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-[#5A9B8C] hover:bg-[#4A8B7C] text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  立即安装
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDismiss}
                  className="border-gray-300"
                >
                  稍后
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * PWA 更新提示组件
 * 当有新版本时提示用户更新
 */
interface PWAUpdatePromptProps {
  hasUpdate: boolean;
  onUpdate: () => void;
}

export function PWAUpdatePrompt({ hasUpdate, onUpdate }: PWAUpdatePromptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (hasUpdate) {
      setIsVisible(true);
    }
  }, [hasUpdate]);

  const handleUpdate = useCallback(() => {
    onUpdate();
    setIsVisible(false);
  }, [onUpdate]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 left-4 right-4 z-50",
      "animate-in slide-in-from-top-4 duration-500"
    )}>
      <div className={cn(
        "max-w-md mx-auto",
        "bg-gradient-to-r from-[#5A9B8C] to-[#4A8B7C]",
        "rounded-2xl shadow-lg",
        "p-4",
        "text-white",
        "relative"
      )}>
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>

          <div className="flex-1">
            <h4 className="font-semibold">有新版本可用！</h4>
            <p className="text-sm text-white/80">
              更新后体验更好的功能和性能
            </p>
          </div>

          <Button
            onClick={handleUpdate}
            variant="secondary"
            size="sm"
            className="shrink-0 bg-white text-[#5A9B8C] hover:bg-white/90"
          >
            更新
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PWAInstallPrompt;
