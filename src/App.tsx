import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <GameProvider>
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
            <Route path="/collection" element={<PlaceholderPage title="我的收藏馆" emoji="🏆" desc="徽章、作品、星星都在这！" color="from-golden/15 via-background to-sky/10" />} />
            <Route path="/parent" element={<PlaceholderPage title="家长区" emoji="🔑" desc="查看学习报告和设置" color="from-muted via-background to-muted" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
