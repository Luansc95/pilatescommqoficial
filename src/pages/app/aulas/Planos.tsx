import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Copy, Pencil, Trash2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LEVEL_OPTIONS, OBJECTIVE_OPTIONS } from "@/lib/appConstants";
import { toast } from "@/hooks/use-toast";

type Plan = { id: string; name: string; description: string | null; objective: string | null; level: string | null; duration_min: number | null };

export default function Planos() {
  const [items, setItems] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [obj, setObj] = useState("all");
  const [level, setLevel] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("lesson_plans").select("*").is("archived_at", null).order("name");
    setItems((data as Plan[]) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (obj !== "all" && p.objective !== obj) return false;
    if (level !== "all" && p.level !== level) return false;
    return true;
  });

  const duplicate = async (id: string) => {
    const { data: plan } = await supabase.from("lesson_plans").select("*").eq("id", id).single();
    if (!plan) return;
    const { id: _i, created_at, updated_at, ...rest } = plan as any;
    const { data: newPlan, error } = await supabase.from("lesson_plans").insert({ ...rest, name: `${plan.name} (cópia)` }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    const { data: items } = await supabase.from("lesson_plan_items").select("*").eq("plan_id", id);
    if (items && items.length > 0 && newPlan) {
      const clones = items.map((it: any) => {
        const { id: _x, created_at, ...r } = it;
        return { ...r, plan_id: newPlan.id };
      });
      await supabase.from("lesson_plan_items").insert(clones);
    }
    toast({ title: "Plano duplicado" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este plano?")) return;
    const { error } = await supabase.from("lesson_plans").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">Planos de Aula</h1>
          <p className="text-sm text-muted-foreground">Modelos reutilizáveis para montar suas aulas</p>
        </div>
        <Button asChild><Link to="/app/aulas/planos/novo"><Plus className="w-4 h-4 mr-1" /> Novo plano</Link></Button>
      </div>

      <Card className="rounded-2xl border-0 shadow-soft mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome..." className="pl-9" />
          </div>
          <Select value={obj} onValueChange={setObj}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos objetivos</SelectItem>
              {OBJECTIVE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos níveis</SelectItem>
              {LEVEL_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">
          Nenhum plano ainda. <Link to="/app/aulas/planos/novo" className="text-primary underline">Crie o primeiro</Link>.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((p) => (
            <Card key={p.id} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{p.name}</h3>
                    {p.level && <Badge variant="outline">{p.level}</Badge>}
                    {p.objective && <Badge variant="secondary">{p.objective}</Badge>}
                    {p.duration_min && <Badge variant="outline">{p.duration_min} min</Badge>}
                  </div>
                  {p.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild><Link to={`/app/aulas/planos/${p.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                  <Button size="sm" variant="outline" onClick={() => duplicate(p.id)}><Copy className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => remove(p.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
