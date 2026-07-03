import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, Save, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { INTENSITY_OPTIONS, OBJECTIVE_OPTIONS, LESSON_BLOCKS, LESSON_STATUS_LABELS, LESSON_STATUS_COLORS } from "@/lib/appConstants";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import ExerciseSelect from "@/components/app/aulas/ExerciseSelect";

type Item = {
  id?: string;
  block: string;
  position: number;
  exercise_id: string | null;
  exercise_name_snapshot: string | null;
  sets: number | null;
  reps: number | null;
  time_seconds: number | null;
  load: string | null;
  notes: string | null;
  done?: boolean;
};

export default function AulaForm() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === "nova";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [form, setForm] = useState<any>({
    student_id: sp.get("student_id") ?? "",
    plan_id: "",
    scheduled_date: sp.get("date") ?? new Date().toISOString().slice(0, 10),
    scheduled_time: sp.get("time") ?? "08:00",
    duration_min: 60,
    objective: "",
    intensity: "",
    status: "agendada",
    notes: "",
  });
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    (async () => {
      const [{ data: st }, { data: pl }] = await Promise.all([
        supabase.from("students").select("id, full_name").order("full_name"),
        supabase.from("lesson_plans").select("id, name").is("archived_at", null).order("name"),
      ]);
      setStudents(st ?? []);
      setPlans(pl ?? []);
      if (!isNew) {
        const { data } = await supabase.from("lessons").select("*").eq("id", id!).single();
        if (data) setForm(data);
        const { data: its } = await supabase.from("lesson_items").select("*").eq("lesson_id", id!).order("block").order("position");
        setItems((its as any) ?? []);
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const loadPlanIntoItems = async (planId: string) => {
    if (!planId) return;
    const { data } = await supabase.from("lesson_plan_items").select("*").eq("plan_id", planId).order("block").order("position");
    if (!data) return;
    setItems(data.map((it: any) => ({
      block: it.block, position: it.position,
      exercise_id: it.exercise_id, exercise_name_snapshot: it.exercise_name_snapshot,
      sets: it.sets, reps: it.reps, time_seconds: it.time_seconds,
      load: it.load, notes: it.notes, done: false,
    })));
    toast({ title: "Plano carregado", description: "Exercícios copiados. Você pode ajustá-los só para esta aula." });
  };

  const addItem = (block: string) => setItems((arr) => [...arr, {
    block, position: arr.filter((i) => i.block === block).length,
    exercise_id: null, exercise_name_snapshot: null,
    sets: null, reps: null, time_seconds: null, load: null, notes: null, done: false,
  }]);
  const updateItem = (idx: number, patch: Partial<Item>) => setItems((arr) => arr.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));

  const save = async (newStatus?: string) => {
    if (!form.student_id) { toast({ title: "Selecione um aluno", variant: "destructive" }); return; }
    setSaving(true);
    const payload: any = {
      student_id: form.student_id,
      professor_id: user?.id,
      plan_id: form.plan_id || null,
      scheduled_date: form.scheduled_date,
      scheduled_time: form.scheduled_time,
      duration_min: Number(form.duration_min) || 60,
      objective: form.objective || null,
      intensity: form.intensity || null,
      status: newStatus ?? form.status,
      notes: form.notes || null,
    };
    let lessonId = id!;
    if (isNew) {
      payload.created_by = user?.id;
      const { data, error } = await supabase.from("lessons").insert(payload).select().single();
      if (error) { setSaving(false); toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      lessonId = data.id;
    } else {
      const { error } = await supabase.from("lessons").update(payload).eq("id", lessonId);
      if (error) { setSaving(false); toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    }
    await supabase.from("lesson_items").delete().eq("lesson_id", lessonId);
    if (items.length > 0) {
      const toInsert = items.map((it, i) => ({
        lesson_id: lessonId, block: it.block, position: i,
        exercise_id: it.exercise_id, exercise_name_snapshot: it.exercise_name_snapshot,
        sets: it.sets, reps: it.reps, time_seconds: it.time_seconds,
        load: it.load, notes: it.notes, done: !!it.done,
      }));
      await supabase.from("lesson_items").insert(toInsert);
    }
    setSaving(false);
    if (newStatus === "realizada") {
      toast({ title: "Aula concluída", description: "Registro adicionado ao histórico de evolução do aluno." });
    } else {
      toast({ title: isNew ? "Aula criada" : "Aula salva" });
    }
    navigate("/app/aulas/aulas");
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link to="/app/aulas/aulas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">{isNew ? "Nova aula" : "Editar aula"}</h1>
        {!isNew && <Badge className={LESSON_STATUS_COLORS[form.status] ?? ""} variant="outline">{LESSON_STATUS_LABELS[form.status]}</Badge>}
      </div>

      <Card className="rounded-2xl border-0 shadow-soft mb-6">
        <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Aluno *</Label>
            <Select value={form.student_id} onValueChange={(v) => set("student_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o aluno" /></SelectTrigger>
              <SelectContent>{students.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Data *</Label><Input type="date" value={form.scheduled_date} onChange={(e) => set("scheduled_date", e.target.value)} /></div>
          <div><Label>Hora *</Label><Input type="time" value={form.scheduled_time?.slice(0, 5)} onChange={(e) => set("scheduled_time", e.target.value)} /></div>
          <div><Label>Duração (min)</Label><Input type="number" value={form.duration_min} onChange={(e) => set("duration_min", e.target.value)} /></div>
          <div>
            <Label>Objetivo</Label>
            <Select value={form.objective ?? ""} onValueChange={(v) => set("objective", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{OBJECTIVE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Intensidade</Label>
            <Select value={form.intensity ?? ""} onValueChange={(v) => set("intensity", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{INTENSITY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Plano de aula (opcional)</Label>
            <div className="flex gap-2">
              <Select value={form.plan_id ?? ""} onValueChange={(v) => set("plan_id", v)}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>{plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
              <Button variant="outline" onClick={() => loadPlanIntoItems(form.plan_id)} disabled={!form.plan_id}>Carregar exercícios</Button>
            </div>
          </div>
          <div className="md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="space-y-3 mb-6">
        <h2 className="text-lg font-semibold text-purple-dark">Exercícios da aula</h2>
        {LESSON_BLOCKS.map((b) => {
          const blockItems = items.map((it, i) => ({ it, i })).filter((o) => o.it.block === b.key);
          if (blockItems.length === 0) {
            return (
              <div key={b.key} className="flex items-center justify-between border-b py-2">
                <span className="text-sm text-muted-foreground">{b.label}</span>
                <Button size="sm" variant="ghost" onClick={() => addItem(b.key)}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
              </div>
            );
          }
          return (
            <Card key={b.key} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-purple-dark">{b.label}</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem(b.key)}><Plus className="w-4 h-4 mr-1" /> Adicionar</Button>
                </div>
                <div className="space-y-3">
                  {blockItems.map(({ it, i }) => (
                    <div key={i} className="border rounded-xl p-3 space-y-2 bg-secondary/30">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <ExerciseSelect value={it.exercise_id} onChange={(id, name) => updateItem(i, { exercise_id: id, exercise_name_snapshot: name })} />
                        </div>
                        <Button size="icon" variant="ghost" className="text-destructive" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div><Label className="text-xs">Séries</Label><Input type="number" value={it.sets ?? ""} onChange={(e) => updateItem(i, { sets: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Reps</Label><Input type="number" value={it.reps ?? ""} onChange={(e) => updateItem(i, { reps: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Tempo (s)</Label><Input type="number" value={it.time_seconds ?? ""} onChange={(e) => updateItem(i, { time_seconds: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Carga</Label><Input value={it.load ?? ""} onChange={(e) => updateItem(i, { load: e.target.value || null })} /></div>
                        <div className="col-span-2 md:col-span-5"><Label className="text-xs">Obs</Label><Input value={it.notes ?? ""} onChange={(e) => updateItem(i, { notes: e.target.value || null })} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={() => save("cancelada")} disabled={saving}>Cancelar aula</Button>
        <Button variant="outline" onClick={() => save("faltou")} disabled={saving}>Marcar falta</Button>
        <Button variant="outline" onClick={() => save()} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Salvar
        </Button>
        <Button onClick={() => save("realizada")} disabled={saving}>
          <CheckCircle2 className="w-4 h-4 mr-1" /> Concluir aula
        </Button>
      </div>
    </div>
  );
}
