import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { setupProcessPolyfill } from "./utils/process-polyfill";
import EnhancedLinkExtractor from "./components/dashboard/EnhancedLinkExtractor";
import { LinkExtractor } from '@/components/linkExtractor/LinkExtractor';
import { SupabaseTest } from './components/SupabaseTest';

// Set up process polyfill early
setupProcessPolyfill();

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import YouTubeCallback from "@/pages/auth/youtube/callback";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <SupabaseTest />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/auth/youtube/callback" element={<YouTubeCallback />} />
      <Route path="/link-extractor" element={<LinkExtractor />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </TooltipProvider>
);

export default App;
