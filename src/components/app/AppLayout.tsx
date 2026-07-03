import { ReactNode, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LogOut, Users, UserCog, Menu, BookOpen, Dumbbell, ClipboardList, CalendarDays, ChevronDown, ChevronRight,
} from "lucide-react";
import logoMQ from "@/assets/logo-mq.png";

export function AppLayout({ children }: { children: ReactNode }) {
  const { profile, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const aulasActive = location.pathname.startsWith("/app/aulas");
  const [aulasOpen, setAulasOpen] = useState(aulasActive);

  const handleSignOut = async () => {
    await signOut();
    navigate("/app/login");
  };

  const aulasSub = [
    { to: "/app/aulas/agenda", label: "Agenda", icon: CalendarDays },
    { to: "/app/aulas/aulas", label: "Aulas", icon: ClipboardList },
    { to: "/app/aulas/planos", label: "Planos de Aula", icon: BookOpen },
    { to: "/app/aulas/exercicios", label: "Exercícios", icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen w-64 bg-background border-r border-border z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col print:hidden`}
      >
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logoMQ} alt="MQ" className="h-10 w-auto" />
          <div>
            <p className="text-sm font-bold text-purple-dark">PilatescomMQ</p>
            <p className="text-xs text-muted-foreground">Prontuário Digital</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavLink
            to="/app"
            end
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span className="font-medium">Alunos</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setAulasOpen((v) => !v)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
              aulasActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="font-medium flex-1 text-left">Aulas</span>
            {aulasOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
          {aulasOpen && (
            <div className="ml-3 pl-3 border-l border-border space-y-1">
              {aulasSub.map((s) => (
                <NavLink
                  key={s.to}
                  to={s.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                    }`
                  }
                >
                  <s.icon className="w-4 h-4" />
                  {s.label}
                </NavLink>
              ))}
            </div>
          )}

          {isAdmin && (
            <NavLink
              to="/app/equipe"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`
              }
            >
              <UserCog className="w-5 h-5" />
              <span className="font-medium">Equipe</span>
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="px-2">
            <p className="text-sm font-medium truncate">{profile?.full_name ?? "Usuário"}</p>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Administrador" : "Professor"}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSignOut} className="w-full">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
          <Link
            to="/"
            className="block text-xs text-muted-foreground hover:text-primary text-center pt-2"
          >
            Ver site público
          </Link>
        </div>
      </aside>


      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-background border-b border-border p-4 flex items-center justify-between print:hidden">
          <button onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logoMQ} alt="MQ" className="h-8 w-auto" />
            <span className="text-sm font-bold text-purple-dark">PilatescomMQ</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
