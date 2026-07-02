import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveIndicator, SaveState } from "@/components/app/SaveIndicator";
import { POSTURAL_CHECKLIST } from "@/lib/appConstants";
import { calculateIMC, imcCategory, formatDate } from "@/lib/appHelpers";
import { useAuth } from "@/hooks/useAuth";
import { Plus, History } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props { studentId: string; onChange?: (v: any) => void; }

const SCALES: Array<{ key: string; label: string }> = [
  { key: "mobility_shoulders", label: "Mobilidade — Ombros" },
  { key: "mobility_hip", label: "Mobilidade — Quadril" },
  { key: "mobility_spine", label: "Mobilidade — Coluna" },
  { key: "mobility_knees", label: "Mobilidade — Joelhos" },
  { key: "mobility_ankles", label: "Mobilidade — Tornozelos" },
  { key: "flexibility", label: "Flexibilidade" },
  { key: "balance", label: "Equilíbrio" },
  { key: "strength", label: "Força" },
  { key: "endurance", label: "Resistência" },
];

export default function AvaliacaoTab({ studentId, onChange }: Props) {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const load = async () => {
    const { data } = await supabase
      .from("physical_assessments")
      .select("*")
      .eq("student_id", studentId)
      .order("assessed_at", { ascending: false });
    setAssessments(data ?? []);
    if (data && data.length > 0) setCurrent(data[0]);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [studentId]);

  useAutoSave(current, 800, async (v) => {
    if (!v || !v.id) return;
    setSaveState("saving");
    const { id, created_at, updated_at, student_id, ...rest } = v;
    // Recalculate IMC
    rest.imc = calculateIMC(v.weight, v.height);
    const { error } = await supabase.from("physical_assessments").update({ ...rest, updated_by: user?.id }).eq("id", id);
    setSaveState(error ? "error" : "saved");
    if (!error) {
      setTimeout(() => setSaveState("idle"), 2000);
      onChange?.(v);
    }
  });

  const createNew = async (dup = false) => {
    const base: any = {
      student_id: studentId,
      assessed_at: new Date().toISOString().slice(0, 10),
      assessor_id: user?.id,
      updated_by: user?.id,
      postural_checklist: {},
    };
    if (dup && current) {
      const { id, created_at, updated_at, ...copy } = current;
      Object.assign(base, copy);
      base.assessed_at = new Date().toISOString().slice(0, 10);
    }
    const { data, error } = await supabase.from("physical_assessments").insert(base).select("*").single();
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    setCurrent(data);
    await load();
    toast({ title: dup ? "Reavaliação criada" : "Nova avaliação criada" });
  };

  const set = (patch: any) => setCurrent((c: any) => ({ ...c, ...patch }));

  const toggleChecklist = (key: string) => {
    const cl = { ...(current?.postural_checklist ?? {}) };
    cl[key] = !cl[key];
    set({ postural_checklist: cl });
  };

  const imc = calculateIMC(current?.weight, current?.height);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-purple-dark">Avaliação Física</h3>
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} />
          <Button onClick={() => createNew(false)} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
          {current && (
            <Button onClick={() => createNew(true)} size="sm">
              <History className="w-4 h-4 mr-1" /> Nova Reavaliação
            </Button>
          )}
        </div>
      </div>

      {assessments.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {assessments.map((a) => (
            <button
              key={a.id}
              onClick={() => setCurrent(a)}
              className={`px-3 py-1.5 rounded-lg text-xs border ${
                current?.id === a.id ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
              }`}
            >
              {formatDate(a.assessed_at)}
            </button>
          ))}
        </div>
      )}

      {!current ? (
        <Card className="rounded-2xl border-dashed">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma avaliação registrada.</p>
            <Button onClick={() => createNew(false)}><Plus className="w-4 h-4 mr-2" />Criar primeira avaliação</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Data da avaliação</Label>
              <Input type="date" value={current.assessed_at ?? ""} onChange={(e) => set({ assessed_at: e.target.value })} />
            </div>
            <div>
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={current.weight ?? ""} onChange={(e) => set({ weight: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>Altura (m)</Label>
              <Input type="number" step="0.01" value={current.height ?? ""} onChange={(e) => set({ height: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>IMC</Label>
              <Input value={imc ? `${imc} — ${imcCategory(imc)}` : ""} disabled />
            </div>
            <div>
              <Label>% Gordura</Label>
              <Input type="number" step="0.1" value={current.body_fat_pct ?? ""} onChange={(e) => set({ body_fat_pct: e.target.value ? Number(e.target.value) : null })} />
            </div>
            <div>
              <Label>Pressão arterial</Label>
              <Input value={current.blood_pressure ?? ""} onChange={(e) => set({ blood_pressure: e.target.value })} placeholder="120x80" />
            </div>
            <div>
              <Label>Frequência cardíaca</Label>
              <Input type="number" value={current.heart_rate ?? ""} onChange={(e) => set({ heart_rate: e.target.value ? Number(e.target.value) : null })} />
            </div>
          </div>

          <h4 className="text-md font-semibold text-purple-dark pt-4">Circunferências (cm)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {["circ_arm", "circ_abdomen", "circ_waist", "circ_hip", "circ_thigh", "circ_calf"].map((k) => (
              <div key={k}>
                <Label className="capitalize">{k.replace("circ_", "").replace("_", " ")}</Label>
                <Input type="number" step="0.1" value={current[k] ?? ""} onChange={(e) => set({ [k]: e.target.value ? Number(e.target.value) : null })} />
              </div>
            ))}
          </div>

          <h4 className="text-md font-semibold text-purple-dark pt-4">Escalas (1 a 5)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SCALES.map((s) => (
              <div key={s.key} className="flex items-center justify-between p-3 rounded-xl border border-border">
                <span className="text-sm font-medium">{s.label}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => set({ [s.key]: current[s.key] === n ? null : n })}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold border transition-colors ${
                        current[s.key] === n ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <Label>Observações sobre dor</Label>
            <Textarea rows={3} value={current.pain_notes ?? ""} onChange={(e) => set({ pain_notes: e.target.value })} placeholder="Descreva regiões e intensidade (0-10)" />
          </div>

          <h4 className="text-md font-semibold text-purple-dark pt-4">Avaliação Postural</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {POSTURAL_CHECKLIST.map((item) => (
              <label key={item.key} className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer hover:bg-secondary">
                <Checkbox
                  checked={!!current.postural_checklist?.[item.key]}
                  onCheckedChange={() => toggleChecklist(item.key)}
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
          <div>
            <Label>Observações posturais</Label>
            <Textarea rows={3} value={current.postural_notes ?? ""} onChange={(e) => set({ postural_notes: e.target.value })} />
          </div>
        </>
      )}
    </div>
  );
}
