import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Save, Upload } from "lucide-react";
import { EXERCISE_CATEGORIES, MUSCLE_GROUPS, EQUIPMENT_OPTIONS, LEVEL_OPTIONS, OBJECTIVE_OPTIONS } from "@/lib/appConstants";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const empty = {
  name: "",
  code: "",
  category: "",
  muscle_group: "",
  objective: "",
  level: "",
  equipment: "",
  duration_min: "",
  sets: "",
  reps: "",
  rest_seconds: "",
  description: "",
  benefits: "",
  contraindications: "",
  cautions: "",
  tips: "",
  photo_url: "",
  video_url: "",
  tags: "",
};

export default function ExercicioForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = !id || id === "novo";
  const [form, setForm] = useState<any>(empty);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      const { data } = await supabase.from("exercises").select("*").eq("id", id!).single();
      if (data) {
        setForm({
          ...empty,
          ...data,
          tags: (data.tags ?? []).join(", "),
          duration_min: data.duration_min ?? "",
          sets: data.sets ?? "",
          reps: data.reps ?? "",
          rest_seconds: data.rest_seconds ?? "",
        });
      }
      setLoading(false);
    })();
  }, [id, isNew]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    const path = `${user?.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("exercise-media").upload(path, file, { upsert: false });
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } else {
      const { data } = await supabase.storage.from("exercise-media").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
      if (data) set("photo_url", data.signedUrl);
    }
    setUploading(false);
  };

  const save = async () => {
    if (!form.name?.trim()) {
      toast({ title: "Nome obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      name: form.name.trim(),
      code: form.code || null,
      category: form.category || null,
      muscle_group: form.muscle_group || null,
      objective: form.objective || null,
      level: form.level || null,
      equipment: form.equipment || null,
      duration_min: form.duration_min ? Number(form.duration_min) : null,
      sets: form.sets ? Number(form.sets) : null,
      reps: form.reps ? Number(form.reps) : null,
      rest_seconds: form.rest_seconds ? Number(form.rest_seconds) : null,
      description: form.description || null,
      benefits: form.benefits || null,
      contraindications: form.contraindications || null,
      cautions: form.cautions || null,
      tips: form.tips || null,
      photo_url: form.photo_url || null,
      video_url: form.video_url || null,
      tags: form.tags ? String(form.tags).split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    };
    if (isNew) payload.created_by = user?.id;
    const { error } = isNew
      ? await supabase.from("exercises").insert(payload)
      : await supabase.from("exercises").update(payload).eq("id", id!);
    setSaving(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: isNew ? "Exercício criado" : "Alterações salvas" });
      navigate("/app/aulas/exercicios");
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <Link to="/app/aulas/exercicios" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-purple-dark mb-6">
        {isNew ? "Novo exercício" : "Editar exercício"}
      </h1>

      <div className="space-y-4">
        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="p-4 md:p-6 grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Nome *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
            <div><Label>Código interno</Label><Input value={form.code} onChange={(e) => set("code", e.target.value)} /></div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.category} onValueChange={(v) => set("category", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{EXERCISE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grupo muscular</Label>
              <Select value={form.muscle_group} onValueChange={(v) => set("muscle_group", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{MUSCLE_GROUPS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Objetivo</Label>
              <Select value={form.objective} onValueChange={(v) => set("objective", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{OBJECTIVE_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nível</Label>
              <Select value={form.level} onValueChange={(v) => set("level", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{LEVEL_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Equipamento</Label>
              <Select value={form.equipment} onValueChange={(v) => set("equipment", v)}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{EQUIPMENT_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Duração (min)</Label><Input type="number" value={form.duration_min} onChange={(e) => set("duration_min", e.target.value)} /></div>
            <div><Label>Séries</Label><Input type="number" value={form.sets} onChange={(e) => set("sets", e.target.value)} /></div>
            <div><Label>Repetições</Label><Input type="number" value={form.reps} onChange={(e) => set("reps", e.target.value)} /></div>
            <div><Label>Descanso (segundos)</Label><Input type="number" value={form.rest_seconds} onChange={(e) => set("rest_seconds", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div><Label>Descrição detalhada</Label><Textarea rows={4} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div><Label>Benefícios</Label><Textarea rows={2} value={form.benefits} onChange={(e) => set("benefits", e.target.value)} /></div>
            <div><Label>Contraindicações</Label><Textarea rows={2} value={form.contraindications} onChange={(e) => set("contraindications", e.target.value)} /></div>
            <div><Label>Cuidados</Label><Textarea rows={2} value={form.cautions} onChange={(e) => set("cautions", e.target.value)} /></div>
            <div><Label>Dicas do professor</Label><Textarea rows={2} value={form.tips} onChange={(e) => set("tips", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-soft">
          <CardContent className="p-4 md:p-6 space-y-4">
            <div>
              <Label>Foto</Label>
              <div className="flex items-center gap-3">
                {form.photo_url && <img src={form.photo_url} alt="" className="w-24 h-24 object-cover rounded-xl border" />}
                <label className="inline-flex items-center gap-2 px-4 py-2 border rounded-md cursor-pointer hover:bg-accent">
                  <Upload className="w-4 h-4" />
                  {uploading ? "Enviando..." : "Enviar foto"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
                </label>
                {form.photo_url && <Button variant="ghost" size="sm" onClick={() => set("photo_url", "")}>Remover</Button>}
              </div>
            </div>
            <div><Label>Link para vídeo externo (YouTube, Vimeo...)</Label><Input value={form.video_url} onChange={(e) => set("video_url", e.target.value)} placeholder="https://..." /></div>
            <div><Label>Tags (separadas por vírgula)</Label><Input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="core, iniciante, coluna" /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button variant="outline" asChild><Link to="/app/aulas/exercicios">Cancelar</Link></Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
