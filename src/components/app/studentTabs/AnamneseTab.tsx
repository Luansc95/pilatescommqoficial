import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveIndicator, SaveState } from "@/components/app/SaveIndicator";
import { DISEASE_OPTIONS } from "@/lib/appConstants";
import { useAuth } from "@/hooks/useAuth";

const YES_NO = [
  { key: "has_pain", label: "Possui dores atualmente?" },
  { key: "had_surgery", label: "Já realizou cirurgia?" },
  { key: "has_prosthesis", label: "Possui prótese?" },
  { key: "is_pregnant", label: "Está gestante?" },
  { key: "is_breastfeeding", label: "Está amamentando?" },
  { key: "smokes", label: "Fuma?" },
  { key: "drinks_alcohol", label: "Consome bebida alcoólica?" },
  { key: "practices_activity", label: "Pratica atividade física?" },
  { key: "uses_medication", label: "Utiliza medicamentos?" },
  { key: "has_medical_recommendation", label: "Possui recomendação médica?" },
  { key: "has_limitations", label: "Possui limitações?" },
];

interface Props { studentId: string; onChange?: (v: any) => void; }

export default function AnamneseTab({ studentId, onChange }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    (async () => {
      const { data: row } = await supabase.from("anamneses").select("*").eq("student_id", studentId).maybeSingle();
      if (row) setData(row);
      else {
        // create if missing
        const { data: created } = await supabase.from("anamneses").insert({ student_id: studentId, updated_by: user?.id }).select("*").single();
        setData(created);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useAutoSave(data, 800, async (v) => {
    if (!v || !v.id) return;
    setSaveState("saving");
    const { id, created_at, updated_at, student_id, ...rest } = v;
    const { error } = await supabase.from("anamneses").update({ ...rest, updated_by: user?.id }).eq("id", id);
    setSaveState(error ? "error" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 2000);
  });

  if (!data) return <p className="text-muted-foreground">Carregando...</p>;

  const set = (patch: any) => {
    setData((d: any) => {
      const next = { ...d, ...patch };
      onChange?.(next);
      return next;
    });
  };

  const toggleDisease = (name: string) => {
    const list: string[] = data.diseases ?? [];
    const next = list.includes(name) ? list.filter((x) => x !== name) : [...list, name];
    set({ diseases: next });
  };

  const YesNoToggle = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) => (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange(value === true ? null : true)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          value === true ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
        }`}
      >Sim</button>
      <button
        type="button"
        onClick={() => onChange(value === false ? null : false)}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
          value === false ? "bg-purple-dark text-primary-foreground border-purple-dark" : "border-border hover:bg-secondary"
        }`}
      >Não</button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-dark">Anamnese</h3>
        <SaveIndicator state={saveState} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {YES_NO.map((q) => (
          <div key={q.key} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border">
            <span className="text-sm font-medium">{q.label}</span>
            <YesNoToggle value={data[q.key]} onChange={(v) => set({ [q.key]: v })} />
          </div>
        ))}
      </div>

      <div>
        <Label>Observações da anamnese</Label>
        <Textarea rows={4} value={data.observations ?? ""} onChange={(e) => set({ observations: e.target.value })} />
      </div>

      <h4 className="text-md font-semibold text-purple-dark pt-2">Doenças pré-existentes</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {DISEASE_OPTIONS.map((d) => (
          <label key={d} className="flex items-center gap-2 p-2 rounded-lg border border-border cursor-pointer hover:bg-secondary">
            <Checkbox checked={(data.diseases ?? []).includes(d)} onCheckedChange={() => toggleDisease(d)} />
            <span className="text-sm">{d}</span>
          </label>
        ))}
      </div>
      <div>
        <Label>Outras doenças</Label>
        <Input value={data.diseases_other ?? ""} onChange={(e) => set({ diseases_other: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Alergias</Label>
          <Textarea rows={3} value={data.allergies ?? ""} onChange={(e) => set({ allergies: e.target.value })} />
        </div>
        <div>
          <Label>Medicamentos em uso</Label>
          <Textarea rows={3} value={data.medications ?? ""} onChange={(e) => set({ medications: e.target.value })} />
        </div>
      </div>

      <h4 className="text-md font-semibold text-purple-dark pt-2">Médico Responsável</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Nome</Label><Input value={data.doctor_name ?? ""} onChange={(e) => set({ doctor_name: e.target.value })} /></div>
        <div><Label>Especialidade</Label><Input value={data.doctor_specialty ?? ""} onChange={(e) => set({ doctor_specialty: e.target.value })} /></div>
        <div><Label>Telefone</Label><Input value={data.doctor_phone ?? ""} onChange={(e) => set({ doctor_phone: e.target.value })} /></div>
        <div><Label>CRM (opcional)</Label><Input value={data.doctor_crm ?? ""} onChange={(e) => set({ doctor_crm: e.target.value })} /></div>
      </div>
    </div>
  );
}
