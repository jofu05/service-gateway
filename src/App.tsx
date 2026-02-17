import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import CreateTicket from "./pages/CreateTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetail from "./pages/TicketDetail";
import Statistics from "./pages/Statistics";
import FlowList from "./pages/editor/FlowList";
import FlowEditorPage from "./pages/editor/FlowEditorPage";
import FlowPreviewPage from "./pages/editor/FlowPreviewPage";
import RoleMapping from "./pages/admin/RoleMapping";
import AuditLogs from "./pages/admin/AuditLogs";
import IntegrationSettings from "./pages/admin/IntegrationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Laddar...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout />;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Auth />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<AuthRoute />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<CreateTicket />} />
              <Route path="/tickets" element={<MyTickets />} />
              <Route path="/tickets/:id" element={<TicketDetail />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/editor/flows" element={<FlowList />} />
              <Route path="/editor/flows/new" element={<FlowEditorPage />} />
              <Route path="/editor/flows/:id" element={<FlowEditorPage />} />
              <Route path="/editor/flows/preview" element={<FlowPreviewPage />} />
              <Route path="/admin/roles" element={<RoleMapping />} />
              <Route path="/admin/logs" element={<AuditLogs />} />
              <Route path="/admin/settings" element={<IntegrationSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
