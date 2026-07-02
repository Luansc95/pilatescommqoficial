import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveIndicator, SaveState } from "@/components/app/SaveIndicator";
import { OBJECTIVE_OPTIONS } from "@/lib/appConstants";
import { useAuth } from "@/hooks/useAuth";

interface Props { studentId: string; initial: any; onChange?: (v: any) => void; }

export default function ObjetivosTab({ studentId, initial, onChange }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<any>({
    objectives: initial.objectives ?? [],
    objectives_other: initial.objectives_other ?? "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const toggle = (opt: string) => {
    const list: string[] = data.objectives ?? [];
    const next = list.includes(opt) ? list.filter((x) => x !== opt) : [...list, opt];
    const patch = { objectives: next };
    setData((d: any) => ({ ...d, ...patch }));
    onChange?.({ ...data, ...patch });
  };

  useAutoSave(data, 800, async (v) => {
    setSaveState("saving");
    const { error } = await supabase
      .from("students")
      .update({ objectives: v.objectives, objectives_other: v.objectives_other, updated_by: user?.id })
      .eq("id", studentId);
    setSaveState(error ? "error" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 2000);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-dark">Objetivos do Aluno</h3>
        <SaveIndicator state={saveState} />
      </div>
      <p className="text-sm text-muted-foreground">Selecione todos os objetivos aplicáveis:</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {OBJECTIVE_OPTIONS.map((opt) => (
          <label key={opt} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary cursor-pointer transition-colors">
            <Checkbox checked={data.objectives.includes(opt)} onCheckedChange={() => toggle(opt)} />
            <span className="text-sm font-medium">{opt}</span>
          </label>
        ))}
      </div>

      <div>
        <Label htmlFor="obj-other">Outros objetivos / observações</Label>
        <Textarea
          id="obj-other"
          rows={4}
          value={data.objectives_other}
          onChange={(e) => {
            const patch = { objectives_other: e.target.value };
            setData((d: any) => ({ ...d, ...patch }));
            onChange?.({ ...data, ...patch });
          }}
        />
      </div>
    </div>
  );
}
