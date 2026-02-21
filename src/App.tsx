import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider, useGame } from "@/contexts/GameContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/WelcomePage";
import WorldTourPage from "./pages/WorldTourPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import FactoryPage from "./pages/FactoryPage";
import ColoringPage from "./pages/ColoringPage";
import TrafficPage from "./pages/TrafficPage";
import LabPage from "./pages/LabPage";
import LanguagePage from "./pages/LanguagePage";
import MusicPage from "./pages/MusicPage";
import StoryPage from "./pages/StoryPage";
import TreasurePage from "./pages/TreasurePage";
import CollectionPage from "./pages/CollectionPage";
import ParentPage from "./pages/ParentPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { state } = useGame();

  return (
    <div className={state.globalSettings.highContrast ? 'high-contrast' : ''}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
