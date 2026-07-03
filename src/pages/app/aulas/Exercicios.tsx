import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Copy, Archive, Loader2, Pencil, ArchiveRestore } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EXERCISE_CATEGORIES, LEVEL_OPTIONS } from "@/lib/appConstants";
import { toast } from "@/hooks/use-toast";

type Exercise = {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  muscle_group: string | null;
  level: string | null;
  equipment: string | null;
  archived_at: string | null;
};

export default function Exercicios() {
  const [items, setItems] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [level, setLevel] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("exercises").select("*").order("name");
    if (!showArchived) query = query.is("archived_at", null);
    const { data, error } = await query;
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    setItems((data as Exercise[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showArchived]);

  const filtered = items.filter((e) => {
    if (q && !e.name.toLowerCase().includes(q.toLowerCase()) && !(e.code ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    if (category !== "all" && e.category !== category) return false;
    if (level !== "all" && e.level !== level) return false;
    return true;
  });

  const duplicate = async (id: string) => {
    const { data } = await supabase.from("exercises").select("*").eq("id", id).single();
    if (!data) return;
    const { id: _id, created_at, updated_at, ...rest } = data as any;
    const { error } = await supabase.from("exercises").insert({ ...rest, name: `${data.name} (cópia)`, archived_at: null });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Exercício duplicado" });
      load();
    }
  };

  const toggleArchive = async (ex: Exercise) => {
    const { error } = await supabase
      .from("exercises")
      .update({ archived_at: ex.archived_at ? null : new Date().toISOString() })
      .eq("id", ex.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">Biblioteca de Exercícios</h1>
          <p className="text-sm text-muted-foreground">Cadastre e organize os exercícios do estúdio</p>
        </div>
        <Button asChild>
          <Link to="/app/aulas/exercicios/novo"><Plus className="w-4 h-4 mr-1" /> Novo exercício</Link>
        </Button>
      </div>

      <Card className="rounded-2xl border-0 shadow-soft mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome ou código..." className="pl-9" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {EXERCISE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Nível" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os níveis</SelectItem>
              {LEVEL_OPTIONS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant={showArchived ? "default" : "outline"} size="sm" onClick={() => setShowArchived((v) => !v)}>
            {showArchived ? "Ocultar arquivados" : "Ver arquivados"}
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">
          Nenhum exercício encontrado.{" "}
          <Link to="/app/aulas/exercicios/novo" className="text-primary underline">Cadastre o primeiro</Link>.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((e) => (
            <Card key={e.id} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{e.name}</h3>
                    {e.code && <Badge variant="outline" className="text-[10px]">{e.code}</Badge>}
                    {e.archived_at && <Badge variant="secondary">Arquivado</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {[e.category, e.muscle_group, e.level, e.equipment].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/app/aulas/exercicios/${e.id}`}><Pencil className="w-4 h-4" /></Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(e.id)}><Copy className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => toggleArchive(e)}>
                    {e.archived_at ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
