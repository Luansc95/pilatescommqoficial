import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Loader2 } from "lucide-react";
import { LESSON_STATUS_COLORS, LESSON_STATUS_LABELS } from "@/lib/appConstants";

type Row = {
  id: string;
  scheduled_date: string;
  scheduled_time: string;
  duration_min: number;
  status: string;
  student: { full_name: string } | null;
};

function startOfWeek(d: Date) {
  const day = d.getDay(); // 0 sun
  const diff = day === 0 ? -6 : 1 - day; // start Monday
  const nd = new Date(d);
  nd.setDate(d.getDate() + diff);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h..20h

export default function Agenda() {
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  }), [weekStart]);

  const end = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("lessons")
        .select("id, scheduled_date, scheduled_time, duration_min, status, student:students!inner(full_name)")
        .gte("scheduled_date", weekStart.toISOString().slice(0, 10))
        .lte("scheduled_date", end.toISOString().slice(0, 10));
      setRows((data as any) ?? []);
      setLoading(false);
    })();
  }, [weekStart, end]);

  const cellFor = (day: Date, hour: number) => {
    const dstr = day.toISOString().slice(0, 10);
    return rows.filter((r) => r.scheduled_date === dstr && Number(r.scheduled_time.slice(0, 2)) === hour);
  };

  const shift = (weeks: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + weeks * 7);
    setWeekStart(d);
  };

  const label = `${weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} — ${end.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}`;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">Agenda</h1>
          <p className="text-sm text-muted-foreground">Semana de {label}</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="icon" onClick={() => shift(-1)}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date()))}>Hoje</Button>
          <Button variant="outline" size="icon" onClick={() => shift(1)}><ChevronRight className="w-4 h-4" /></Button>
          <Button asChild><Link to="/app/aulas/aulas/nova"><Plus className="w-4 h-4 mr-1" /> Nova aula</Link></Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <Card className="rounded-2xl border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[900px]">
              <div className="grid grid-cols-[70px_repeat(6,1fr)] border-b bg-secondary/40">
                <div />
                {days.map((d) => (
                  <div key={d.toISOString()} className="p-2 text-center border-l">
                    <div className="text-xs text-muted-foreground uppercase">{d.toLocaleDateString("pt-BR", { weekday: "short" })}</div>
                    <div className="font-semibold">{d.getDate()}</div>
                  </div>
                ))}
              </div>
              {HOURS.map((h) => (
                <div key={h} className="grid grid-cols-[70px_repeat(6,1fr)] border-b min-h-[64px]">
                  <div className="text-xs text-muted-foreground p-2 text-right">{String(h).padStart(2, "0")}:00</div>
                  {days.map((d) => {
                    const cells = cellFor(d, h);
                    const dstr = d.toISOString().slice(0, 10);
                    return (
                      <button
                        key={d.toISOString() + h}
                        onClick={() => navigate(`/app/aulas/aulas/nova?date=${dstr}&time=${String(h).padStart(2, "0")}:00`)}
                        className="border-l text-left p-1 hover:bg-secondary/40 transition-colors relative"
                      >
                        <div className="space-y-1">
                          {cells.map((c) => (
                            <div
                              key={c.id}
                              onClick={(e) => { e.stopPropagation(); navigate(`/app/aulas/aulas/${c.id}`); }}
                              className="rounded-lg p-1.5 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/20"
                            >
                              <div className="font-medium truncate">{c.scheduled_time.slice(0, 5)} • {c.student?.full_name}</div>
                              <Badge className={LESSON_STATUS_COLORS[c.status] + " text-[10px] mt-1"} variant="outline">
                                {LESSON_STATUS_LABELS[c.status]}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
