import Turnout from "./pages/Turnout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import BotDetail from "./pages/BotDetail";
import PoliticalMap from "./pages/PoliticalMap";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import DataExplorer from "./pages/DataExplorer";
import Billing from "./pages/Billing";
import Onboarding from "./pages/Onboarding";
import { Team } from "./pages/Placeholder";
import CountyDashboard from "./pages/CountyDashboard";
import CountyNews from "./pages/CountyNews";
import CountyNewsArticle from "./pages/CountyNewsArticle";
import CountyNewsEditor from "./pages/CountyNewsEditor";
import CountyNewsManage from "./pages/CountyNewsManage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/news" element={<CountyNews />} />
            <Route path="/news/manage" element={<ProtectedRoute role="admin"><CountyNewsManage /></ProtectedRoute>} />
            <Route path="/news/new" element={<ProtectedRoute role="admin"><CountyNewsEditor /></ProtectedRoute>} />
            <Route path="/news/edit/:id" element={<ProtectedRoute role="admin"><CountyNewsEditor /></ProtectedRoute>} />
            <Route path="/news/:id" element={<CountyNewsArticle />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/political-map" element={<ProtectedRoute><PoliticalMap /></ProtectedRoute>} />
            <Route path="/bots/:botKey" element={<ProtectedRoute><BotDetail /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/data-explorer" element={<ProtectedRoute role="analyst"><DataExplorer /></ProtectedRoute>} />
            <Route path="/county" element={<ProtectedRoute><CountyDashboard /></ProtectedRoute>} />
            <Route path="/turnout" element={<ProtectedRoute><Turnout /></ProtectedRoute>} />
            <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
