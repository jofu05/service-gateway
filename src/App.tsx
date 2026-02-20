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
import ActionsManager from "./pages/admin/ActionsManager";
import CmdbDashboard from "./pages/admin/cmdb/CmdbDashboard";
import CmdbEntityPage from "./pages/admin/cmdb/CmdbEntityPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Laddar...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <AppLayout />;
}

function EditorRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  if (!hasRole('editor') && !hasRole('admin')) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { hasRole, loading } = useAuth();
  if (loading) return null;
  if (!hasRole('admin')) return <Navigate to="/" replace />;
  return <>{children}</>;
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
              <Route path="/editor/flows" element={<EditorRoute><FlowList /></EditorRoute>} />
              <Route path="/editor/flows/new" element={<EditorRoute><FlowEditorPage /></EditorRoute>} />
              <Route path="/editor/flows/:id" element={<EditorRoute><FlowEditorPage /></EditorRoute>} />
              <Route path="/editor/flows/:id/preview" element={<EditorRoute><FlowPreviewPage /></EditorRoute>} />
              <Route path="/editor/flows/preview" element={<EditorRoute><FlowPreviewPage /></EditorRoute>} />
              <Route path="/admin/cmdb" element={<EditorRoute><CmdbDashboard /></EditorRoute>} />
              <Route path="/admin/cmdb/:entity" element={<EditorRoute><CmdbEntityPage /></EditorRoute>} />
              <Route path="/admin/actions" element={<AdminRoute><ActionsManager /></AdminRoute>} />
              <Route path="/admin/roles" element={<AdminRoute><RoleMapping /></AdminRoute>} />
              <Route path="/admin/logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><IntegrationSettings /></AdminRoute>} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
