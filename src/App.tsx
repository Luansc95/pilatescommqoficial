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
import Exercicios from "@/pages/app/aulas/Exercicios";
import ExercicioForm from "@/pages/app/aulas/ExercicioForm";
import Planos from "@/pages/app/aulas/Planos";
import PlanoEditor from "@/pages/app/aulas/PlanoEditor";
import Aulas from "@/pages/app/aulas/Aulas";
import AulaForm from "@/pages/app/aulas/AulaForm";
import Agenda from "@/pages/app/aulas/Agenda";

const queryClient = new QueryClient();

const guarded = (el: JSX.Element, adminOnly = false) => (
  <RequireAuth adminOnly={adminOnly}><AppLayout>{el}</AppLayout></RequireAuth>
);

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
            <Route path="/app" element={guarded(<Dashboard />)} />
            <Route path="/app/alunos/novo" element={guarded(<StudentNew />)} />
            <Route path="/app/alunos/:id" element={guarded(<StudentDetail />)} />
            <Route
              path="/app/alunos/:id/imprimir"
              element={<RequireAuth><StudentPrint /></RequireAuth>}
            />
            <Route path="/app/equipe" element={guarded(<Team />, true)} />
            <Route path="/app/aulas/exercicios" element={guarded(<Exercicios />)} />
            <Route path="/app/aulas/exercicios/:id" element={guarded(<ExercicioForm />)} />
            <Route path="/app/aulas/planos" element={guarded(<Planos />)} />
            <Route path="/app/aulas/planos/:id" element={guarded(<PlanoEditor />)} />
            <Route path="/app/aulas/aulas" element={guarded(<Aulas />)} />
            <Route path="/app/aulas/aulas/:id" element={guarded(<AulaForm />)} />
            <Route path="/app/aulas/agenda" element={guarded(<Agenda />)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
