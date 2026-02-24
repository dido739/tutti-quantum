import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/contexts/I18nContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LocalGame from "./pages/LocalGame";
import OnlineGame from "./pages/OnlineGame";
import AIGame from "./pages/AIGame";
import HowToPlay from "./pages/HowToPlay";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <I18nProvider>
        <BrowserRouter>
          <AuthProvider>
            <LanguageSwitcher />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/local-game" element={<LocalGame />} />
              <Route path="/ai-game" element={<AIGame />} />
              <Route path="/online-game" element={<OnlineGame />} />
              <Route path="/online-game/:gameCode" element={<OnlineGame />} />
              <Route path="/how-to-play" element={<HowToPlay />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
