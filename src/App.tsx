
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { setupProcessPolyfill } from "./utils/process-polyfill";
import EnhancedLinkExtractor from "./components/dashboard/EnhancedLinkExtractor";
import { LinkExtractor } from '@/components/linkExtractor/LinkExtractor';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Set up process polyfill early
setupProcessPolyfill();

import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";
import YouTubeCallback from "@/pages/auth/youtube/callback";
import TestPage from "./pages/TestPage";

const App = () => (
  <ErrorBoundary>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/signin" 
          element={
            <ProtectedRoute requireAuth={false}>
              <SignIn />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <ProtectedRoute requireAuth={false}>
              <SignUp />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/auth/youtube/callback" 
          element={
            <ProtectedRoute>
              <YouTubeCallback />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/link-extractor" 
          element={
            <ProtectedRoute>
              <LinkExtractor />
            </ProtectedRoute>
          } 
        />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </ErrorBoundary>
);

export default App;
