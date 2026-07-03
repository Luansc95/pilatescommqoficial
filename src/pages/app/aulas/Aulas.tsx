import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Loader2, CalendarDays } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LESSON_STATUS_COLORS, LESSON_STATUS_LABELS } from "@/lib/appConstants";
import { formatDate } from "@/lib/appHelpers";

type LessonRow = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
  objective: string | null;
  duration_min: number;
  student: { id: string; full_name: string } | null;
};

export default function Aulas() {
  const [items, setItems] = useState<LessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lessons")
      .select("id, scheduled_date, scheduled_time, status, objective, duration_min, student:students!inner(id, full_name)")
      .order("scheduled_date", { ascending: false })
      .order("scheduled_time", { ascending: false });
    setItems((data as any) ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((l) => {
    if (q && !(l.student?.full_name ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    if (status !== "all" && l.status !== status) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">Aulas Individuais</h1>
          <p className="text-sm text-muted-foreground">Agende, execute e registre aulas individuais</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/app/aulas/agenda"><CalendarDays className="w-4 h-4 mr-1" /> Agenda</Link></Button>
          <Button asChild><Link to="/app/aulas/aulas/nova"><Plus className="w-4 h-4 mr-1" /> Nova aula</Link></Button>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-soft mb-4">
        <CardContent className="p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por aluno..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              {Object.entries(LESSON_STATUS_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">
          Nenhuma aula. <Link to="/app/aulas/aulas/nova" className="text-primary underline">Agende a primeira</Link>.
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((l) => (
            <Card key={l.id} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{l.student?.full_name ?? "—"}</h3>
                    <Badge className={LESSON_STATUS_COLORS[l.status] ?? ""} variant="outline">{LESSON_STATUS_LABELS[l.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(l.scheduled_date)} • {l.scheduled_time?.slice(0, 5)} • {l.duration_min} min
                    {l.objective ? ` • ${l.objective}` : ""}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/app/aulas/aulas/${l.id}`}><Pencil className="w-4 h-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
