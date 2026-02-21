import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider, useGame } from "@/contexts/GameContext";
import React, { Suspense } from "react";

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

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground font-bold">加载中...</p>
    </div>
  </div>
);

const AppContent = () => {
  const { state } = useGame();

  return (
    <div className={state.globalSettings.highContrast ? 'high-contrast' : ''}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
