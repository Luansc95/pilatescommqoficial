import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Pencil } from "lucide-react";
import { LESSON_STATUS_COLORS, LESSON_STATUS_LABELS } from "@/lib/appConstants";
import { formatDate } from "@/lib/appHelpers";

export default function AulasTab({ studentId }: { studentId: string }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("student_id", studentId)
        .order("scheduled_date", { ascending: false });
      setItems(data ?? []);
      setLoading(false);
    })();
  }, [studentId]);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Histórico de aulas do aluno</p>
        <Button size="sm" asChild>
          <Link to={`/app/aulas/aulas/nova?student_id=${studentId}`}><Plus className="w-4 h-4 mr-1" /> Agendar aula</Link>
        </Button>
      </div>
      {items.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground text-sm">Nenhuma aula registrada.</div>
      ) : (
        <div className="space-y-2">
          {items.map((l) => (
            <Card key={l.id} className="rounded-xl border shadow-none">
              <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{formatDate(l.scheduled_date)} • {l.scheduled_time?.slice(0, 5)}</span>
                    <Badge className={LESSON_STATUS_COLORS[l.status]} variant="outline">{LESSON_STATUS_LABELS[l.status]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {l.duration_min} min{l.objective ? ` • ${l.objective}` : ""}{l.intensity ? ` • ${l.intensity}` : ""}
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
