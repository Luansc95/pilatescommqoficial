import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAuth } from "@/components/app/RequireAuth";
import { AppLayout } from "@/components/app/AppLayout";
import Login from "@/pages/app/Login";
import Dashboard from "@/pages/app/Dashboard";
import StudentNew from "@/pages/app/StudentNew";
import StudentDetail from "@/pages/app/StudentDetail";
import StudentPrint from "@/pages/app/StudentPrint";
import Team from "@/pages/app/Team";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/app/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppLayout><Dashboard /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/alunos/novo"
              element={
                <RequireAuth>
                  <AppLayout><StudentNew /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/alunos/:id"
              element={
                <RequireAuth>
                  <AppLayout><StudentDetail /></AppLayout>
                </RequireAuth>
              }
            />
            <Route
              path="/app/alunos/:id/imprimir"
              element={
                <RequireAuth>
                  <StudentPrint />
                </RequireAuth>
              }
            />
            <Route
              path="/app/equipe"
              element={
                <RequireAuth adminOnly>
                  <AppLayout><Team /></AppLayout>
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
