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
            <Route path="/lab" element={<PlaceholderPage title="探秘实验室" emoji="🔬" desc="STEM科学实验等你来！" color="from-purple-fun/15 via-background to-sky/10" />} />
            <Route path="/traffic" element={<PlaceholderPage title="交通英雄城" emoji="🚦" desc="学习交通安全规则！" color="from-coral/15 via-background to-grass/10" />} />
            <Route path="/language" element={<PlaceholderPage title="语言魔法屋" emoji="📚" desc="认字学词真有趣！" color="from-golden/15 via-background to-sky/10" />} />
            <Route path="/music" element={<PlaceholderPage title="音乐律动" emoji="🎵" desc="敲击节奏玩音乐！" color="from-purple-fun/15 via-background to-sky/10" />} />
            <Route path="/story" element={<PlaceholderPage title="故事王国" emoji="📖" desc="互动绘本等你翻！" color="from-grass/15 via-background to-golden/10" />} />
            <Route path="/treasure" element={<PlaceholderPage title="寻宝乐园" emoji="🗺️" desc="找零件拼道闸！" color="from-orange-warm/15 via-background to-coral/10" />} />
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
