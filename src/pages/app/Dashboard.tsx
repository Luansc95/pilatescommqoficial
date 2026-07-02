import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STUDENT_STATUS_LABELS, STUDENT_STATUS_COLORS } from "@/lib/appConstants";
import { formatDate } from "@/lib/appHelpers";

interface Student {
  id: string;
  full_name: string;
  photo_url: string | null;
  phone: string | null;
  status: string;
  enrollment_date: string | null;
}

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("students")
        .select("id, full_name, photo_url, phone, status, enrollment_date")
        .order("full_name");
      setStudents((data ?? []) as Student[]);
      setLoading(false);
    })();
  }, []);

  const filtered = students.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (search && !s.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-dark">Alunos</h1>
          <p className="text-muted-foreground">{students.length} cadastrados</p>
        </div>
        <Button asChild size="lg" className="rounded-full">
          <Link to="/app/alunos/novo">
            <Plus className="w-5 h-5 mr-2" /> Novo Aluno
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-xl"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-56 h-11 rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STUDENT_STATUS_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-12">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card className="rounded-3xl border-0 shadow-soft">
          <CardContent className="p-12 text-center">
            <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">
              {students.length === 0 ? "Nenhum aluno cadastrado ainda" : "Nenhum aluno encontrado"}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {students.length === 0 ? "Cadastre o primeiro aluno para começar." : "Ajuste os filtros e tente de novo."}
            </p>
            {students.length === 0 && (
              <Button asChild>
                <Link to="/app/alunos/novo"><Plus className="w-4 h-4 mr-2" />Cadastrar aluno</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <Link key={s.id} to={`/app/alunos/${s.id}`}>
              <Card className="rounded-3xl border-0 shadow-soft hover:shadow-glow hover:-translate-y-1 transition-all cursor-pointer h-full">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden flex-shrink-0">
                    {s.photo_url ? (
                      <img src={s.photo_url} alt={s.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">{s.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{s.phone ?? "sem telefone"}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="outline" className={`text-xs ${STUDENT_STATUS_COLORS[s.status]}`}>
                        {STUDENT_STATUS_LABELS[s.status]}
                      </Badge>
                      {s.enrollment_date && (
                        <span className="text-xs text-muted-foreground">desde {formatDate(s.enrollment_date)}</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
