import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { GameProvider, useGame } from "@/contexts/GameContext";
import { useAgeGroupStyles } from "@/hooks/use-age-group";
import { useServiceWorker } from "@/hooks/use-service-worker";
import { RouteProgressBar } from "@/components/transition/PageTransition";
import { LoadingPulse } from "@/components/loading/LoadingStates";
// 引入 PWA 组件
import * as React from "react";
import { Suspense, useEffect, useState } from "react";
import { PWAInstallPrompt, PWAUpdatePrompt } from "@/components/pwa";
import { useToast } from "@/hooks/use-toast";

const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const WelcomePage = React.lazy(() => import("./pages/WelcomePage"));
const WorldTourPage = React.lazy(() => import("./pages/WorldTourPage"));
const PlaceholderPage = React.lazy(() => import("./pages/PlaceholderPage"));
const FactoryPage = React.lazy(() => import("./pages/FactoryPage"));
const ColoringPage = React.lazy(() => import("./pages/ColoringPage"));
const TrafficPage = React.lazy(() => import("./pages/TrafficPage"));
const LabPage = React.lazy(() => import("./pages/LabPage"));
const LanguagePage = React.lazy(() => import("./pages/LanguagePage"));
const MusicPage = React.lazy(() => import("./pages/MusicPage"));
const StoryPage = React.lazy(() => import("./pages/StoryPage"));
const TreasurePage = React.lazy(() => import("./pages/TreasurePage"));
const CollectionPage = React.lazy(() => import("./pages/CollectionPage"));
const ParentPage = React.lazy(() => import("./pages/ParentPage"));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background animate-fade-in">
    <div className="flex flex-col items-center gap-4">
      <LoadingPulse size="lg" />
      <p className="text-base text-muted-foreground font-bold animate-pulse">加载中...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { state } = useGame();
  const { toast } = useToast();
  
  // 初始化 PWA Service Worker
  const { hasUpdate, skipWaiting, isOffline } = useServiceWorker();

  // 应用年龄段样式（护眼模式、纸质模式等）
  useAgeGroupStyles();

  // 监听离线状态变化
  useEffect(() => {
    if (isOffline) {
      toast({
        title: "📴 进入离线模式",
        description: "部分功能可能受限，但已缓存的内容仍可正常使用！",
        duration: 3000,
      });
    }
  }, [isOffline, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground font-chinese">
      <Toaster />
      <Sonner />
      {/* PWA 安装提示 */}
      <PWAInstallPrompt />
      {/* PWA 更新提示 */}
      <PWAUpdatePrompt hasUpdate={hasUpdate} onUpdate={skipWaiting} />
      <BrowserRouter>
        <RouteProgressBar />
        <Suspense fallback={<LoadingSpinner />}>
          <AnimatedRoutes />
        </Suspense>
      </BrowserRouter>
    </div>
  );
};

// 带页面过渡动画的路由
const AnimatedRoutes = () => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fadeOut');
      setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
      }, 200);
    }
  }, [location, displayLocation]);

  return (
    <div
      className={`transition-all duration-200 ${
        transitionStage === 'fadeIn' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <Routes location={displayLocation}>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<WelcomePage />} />
            <Route path="/world-tour" element={<WorldTourPage />} />
            <Route path="/factory" element={<FactoryPage />} />
            <Route path="/coloring" element={<ColoringPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/traffic" element={<TrafficPage />} />
            <Route path="/language" element={<LanguagePage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/treasure" element={<TreasurePage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="/parent" element={<ParentPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <AppContent />
    </GameProvider>
  </QueryClientProvider>
);

export default App;
