import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/appHelpers";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props { studentId: string; }

export default function EvolucaoTab({ studentId }: Props) {
  const { user, isAdmin } = useAuth();
  const [evolutions, setEvolutions] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [newEvo, setNewEvo] = useState({
    evolution_date: new Date().toISOString().slice(0, 10),
    description: "",
    objectives: "",
    observations: "",
    recommended_exercises: "",
  });

  const load = async () => {
    const { data } = await supabase
      .from("evolutions")
      .select("*, profiles:professor_id(full_name)")
      .eq("student_id", studentId)
      .order("evolution_date", { ascending: false });
    setEvolutions(data ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [studentId]);

  const handleCreate = async () => {
    if (!newEvo.description.trim()) {
      toast({ title: "Descrição obrigatória", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("evolutions").insert({
      ...newEvo,
      student_id: studentId,
      professor_id: user?.id,
    });
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setCreating(false);
    setNewEvo({
      evolution_date: new Date().toISOString().slice(0, 10),
      description: "", objectives: "", observations: "", recommended_exercises: "",
    });
    await load();
    toast({ title: "Evolução registrada" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir esta evolução? Esta ação não pode ser desfeita.")) return;
    const { error } = await supabase.from("evolutions").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-purple-dark">Evolução</h3>
          <p className="text-sm text-muted-foreground">Linha do tempo — histórico preservado</p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nova Evolução
          </Button>
        )}
      </div>

      {creating && (
        <Card className="rounded-2xl border-primary/30">
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Data</Label>
                <Input type="date" value={newEvo.evolution_date} onChange={(e) => setNewEvo({ ...newEvo, evolution_date: e.target.value })} />
              </div>
            </div>
            <div><Label>Descrição *</Label><Textarea rows={3} value={newEvo.description} onChange={(e) => setNewEvo({ ...newEvo, description: e.target.value })} /></div>
            <div><Label>Objetivos da sessão</Label><Textarea rows={2} value={newEvo.objectives} onChange={(e) => setNewEvo({ ...newEvo, objectives: e.target.value })} /></div>
            <div><Label>Observações</Label><Textarea rows={2} value={newEvo.observations} onChange={(e) => setNewEvo({ ...newEvo, observations: e.target.value })} /></div>
            <div><Label>Exercícios recomendados</Label><Textarea rows={2} value={newEvo.recommended_exercises} onChange={(e) => setNewEvo({ ...newEvo, recommended_exercises: e.target.value })} /></div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCreating(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Salvar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {evolutions.length === 0 && !creating ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            Nenhuma evolução registrada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {evolutions.map((e) => (
            <Card key={e.id} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-purple-dark">{formatDate(e.evolution_date)}</p>
                    <p className="text-xs text-muted-foreground">{e.profiles?.full_name ?? "—"}</p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(e.id)} className="text-destructive hover:opacity-80" aria-label="Excluir">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {e.description && <p className="text-sm mb-2 whitespace-pre-wrap">{e.description}</p>}
                {e.objectives && <p className="text-xs text-muted-foreground mb-1"><b>Objetivos:</b> {e.objectives}</p>}
                {e.observations && <p className="text-xs text-muted-foreground mb-1"><b>Obs:</b> {e.observations}</p>}
                {e.recommended_exercises && <p className="text-xs text-muted-foreground"><b>Exercícios:</b> {e.recommended_exercises}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
