import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { LEVEL_OPTIONS, OBJECTIVE_OPTIONS, LESSON_BLOCKS } from "@/lib/appConstants";
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
};

export default function PlanoEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === "novo";
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [plan, setPlan] = useState<any>({ name: "", description: "", objective: "", level: "", duration_min: "" });
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("lesson_plans").select("*").eq("id", id!).single();
      if (data) setPlan({ ...data, duration_min: data.duration_min ?? "" });
      const { data: its } = await supabase.from("lesson_plan_items").select("*").eq("plan_id", id!).order("block").order("position");
      setItems((its as any) ?? []);
      setLoading(false);
    })();
  }, [id, isNew]);

  const setP = (k: string, v: any) => setPlan((p: any) => ({ ...p, [k]: v }));

  const addItem = (block: string) => {
    setItems((arr) => [...arr, {
      block, position: arr.filter((i) => i.block === block).length,
      exercise_id: null, exercise_name_snapshot: null,
      sets: null, reps: null, time_seconds: null, load: null, notes: null,
    }]);
  };
  const updateItem = (idx: number, patch: Partial<Item>) => setItems((arr) => arr.map((it, i) => i === idx ? { ...it, ...patch } : it));
  const removeItem = (idx: number) => setItems((arr) => arr.filter((_, i) => i !== idx));
  const move = (idx: number, dir: -1 | 1) => {
    setItems((arr) => {
      const it = arr[idx];
      const sameBlock = arr.map((x, i) => ({ x, i })).filter((o) => o.x.block === it.block);
      const pos = sameBlock.findIndex((o) => o.i === idx);
      const swap = sameBlock[pos + dir];
      if (!swap) return arr;
      const next = [...arr];
      [next[idx], next[swap.i]] = [next[swap.i], next[idx]];
      return next;
    });
  };

  const save = async () => {
    if (!plan.name?.trim()) { toast({ title: "Nome obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const payload = {
      name: plan.name.trim(),
      description: plan.description || null,
      objective: plan.objective || null,
      level: plan.level || null,
      duration_min: plan.duration_min ? Number(plan.duration_min) : null,
    };
    let planId = id!;
    if (isNew) {
      const { data, error } = await supabase.from("lesson_plans").insert({ ...payload, created_by: user?.id }).select().single();
      if (error) { setSaving(false); toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      planId = data.id;
    } else {
      const { error } = await supabase.from("lesson_plans").update(payload).eq("id", planId);
      if (error) { setSaving(false); toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    }
    // Replace items
    await supabase.from("lesson_plan_items").delete().eq("plan_id", planId);
    if (items.length > 0) {
      const toInsert = items.map((it, i) => ({
        plan_id: planId,
        block: it.block,
        position: i,
        exercise_id: it.exercise_id,
        exercise_name_snapshot: it.exercise_name_snapshot,
        sets: it.sets, reps: it.reps, time_seconds: it.time_seconds,
        load: it.load, notes: it.notes,
      }));
      const { error } = await supabase.from("lesson_plan_items").insert(toInsert);
      if (error) { setSaving(false); toast({ title: "Erro nos exercícios", description: error.message, variant: "destructive" }); return; }
    }
    setSaving(false);
    toast({ title: isNew ? "Plano criado" : "Plano salvo" });
    navigate("/app/aulas/planos");
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <Link to="/app/aulas/planos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-purple-dark mb-6">{isNew ? "Novo plano de aula" : "Editar plano"}</h1>

      <Card className="rounded-2xl border-0 shadow-soft mb-6">
        <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Label>Nome do plano *</Label><Input value={plan.name} onChange={(e) => setP("name", e.target.value)} placeholder="Ex: Pilates Iniciante — Coluna" /></div>
          <div><Label>Objetivo</Label>
            <Select value={plan.objective ?? ""} onValueChange={(v) => setP("objective", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{OBJECTIVE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Nível</Label>
            <Select value={plan.level ?? ""} onValueChange={(v) => setP("level", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>{LEVEL_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Duração total (min)</Label><Input type="number" value={plan.duration_min} onChange={(e) => setP("duration_min", e.target.value)} /></div>
          <div className="md:col-span-2"><Label>Descrição</Label><Textarea rows={2} value={plan.description ?? ""} onChange={(e) => setP("description", e.target.value)} /></div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {LESSON_BLOCKS.map((b) => {
          const blockItems = items.map((it, i) => ({ it, i })).filter((o) => o.it.block === b.key);
          return (
            <Card key={b.key} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-purple-dark">{b.label}</h3>
                  <Button size="sm" variant="outline" onClick={() => addItem(b.key)}><Plus className="w-4 h-4 mr-1" /> Adicionar exercício</Button>
                </div>
                {blockItems.length === 0 && <p className="text-sm text-muted-foreground italic">Nenhum exercício.</p>}
                <div className="space-y-3">
                  {blockItems.map(({ it, i }, localIdx) => (
                    <div key={i} className="border rounded-xl p-3 space-y-2 bg-secondary/30">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1">
                          <Label className="text-xs">Exercício</Label>
                          <ExerciseSelect value={it.exercise_id} onChange={(id, name) => updateItem(i, { exercise_id: id, exercise_name_snapshot: name })} />
                        </div>
                        <div className="flex flex-col gap-1 pt-5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, -1)} disabled={localIdx === 0}><ChevronUp className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => move(i, 1)} disabled={localIdx === blockItems.length - 1}><ChevronDown className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(i)}><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        <div><Label className="text-xs">Séries</Label><Input type="number" value={it.sets ?? ""} onChange={(e) => updateItem(i, { sets: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Reps</Label><Input type="number" value={it.reps ?? ""} onChange={(e) => updateItem(i, { reps: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Tempo (seg)</Label><Input type="number" value={it.time_seconds ?? ""} onChange={(e) => updateItem(i, { time_seconds: e.target.value ? Number(e.target.value) : null })} /></div>
                        <div><Label className="text-xs">Carga</Label><Input value={it.load ?? ""} onChange={(e) => updateItem(i, { load: e.target.value || null })} /></div>
                        <div className="col-span-2 md:col-span-5"><Label className="text-xs">Observações</Label><Input value={it.notes ?? ""} onChange={(e) => updateItem(i, { notes: e.target.value || null })} /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" asChild><Link to="/app/aulas/planos">Cancelar</Link></Button>
        <Button onClick={save} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          Salvar plano
        </Button>
      </div>
    </div>
  );
}
