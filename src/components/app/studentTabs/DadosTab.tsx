import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAutoSave } from "@/hooks/useAutoSave";
import { SaveIndicator, SaveState } from "@/components/app/SaveIndicator";
import { STUDENT_STATUS_LABELS } from "@/lib/appConstants";
import { calculateAge } from "@/lib/appHelpers";
import { useAuth } from "@/hooks/useAuth";
import { Upload, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props { studentId: string; initial: any; onChange?: (v: any) => void; }

export default function DadosTab({ studentId, initial, onChange }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [uploading, setUploading] = useState(false);
  const [photoDisplayUrl, setPhotoDisplayUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (data.photo_url) {
        const { data: signed } = await supabase.storage.from("student-files").createSignedUrl(data.photo_url, 3600);
        setPhotoDisplayUrl(signed?.signedUrl ?? null);
      } else {
        setPhotoDisplayUrl(null);
      }
    })();
  }, [data.photo_url]);

  const set = (patch: Partial<typeof data>) => {
    setData((d: any) => {
      const next = { ...d, ...patch };
      onChange?.(next);
      return next;
    });
  };

  useAutoSave(data, 800, async (v) => {
    setSaveState("saving");
    const { photo_url, ...rest } = v;
    const { error } = await supabase
      .from("students")
      .update({ ...rest, photo_url, updated_by: user?.id })
      .eq("id", studentId);
    setSaveState(error ? "error" : "saved");
    if (!error) setTimeout(() => setSaveState("idle"), 2000);
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${studentId}/photo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("student-files").upload(path, file, { upsert: true });
    setUploading(false);
    if (error) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
      return;
    }
    set({ photo_url: path });
  };

  const age = calculateAge(data.birth_date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-dark">Dados Pessoais</h3>
        <SaveIndicator state={saveState} />
      </div>

      {/* Photo */}
      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden">
          {photoDisplayUrl ? (
            <img src={photoDisplayUrl} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-primary" />
          )}
        </div>
        <div>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} id="photo-upload" className="hidden" />
          <Button asChild variant="outline" size="sm" disabled={uploading}>
            <label htmlFor="photo-upload" className="cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? "Enviando..." : "Trocar foto"}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label>Nome completo *</Label>
          <Input value={data.full_name ?? ""} onChange={(e) => set({ full_name: e.target.value })} />
        </div>
        <div><Label>CPF</Label><Input value={data.cpf ?? ""} onChange={(e) => set({ cpf: e.target.value })} /></div>
        <div><Label>RG</Label><Input value={data.rg ?? ""} onChange={(e) => set({ rg: e.target.value })} /></div>
        <div>
          <Label>Data de nascimento</Label>
          <Input type="date" value={data.birth_date ?? ""} onChange={(e) => set({ birth_date: e.target.value })} />
        </div>
        <div>
          <Label>Idade</Label>
          <Input value={age !== null ? `${age} anos` : ""} disabled />
        </div>
        <div>
          <Label>Sexo</Label>
          <Select value={data.gender ?? ""} onValueChange={(v) => set({ gender: v })}>
            <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Feminino">Feminino</SelectItem>
              <SelectItem value="Masculino">Masculino</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Estado civil</Label>
          <Select value={data.marital_status ?? ""} onValueChange={(v) => set({ marital_status: v })}>
            <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Solteiro(a)">Solteiro(a)</SelectItem>
              <SelectItem value="Casado(a)">Casado(a)</SelectItem>
              <SelectItem value="Divorciado(a)">Divorciado(a)</SelectItem>
              <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
              <SelectItem value="União estável">União estável</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>Profissão</Label><Input value={data.profession ?? ""} onChange={(e) => set({ profession: e.target.value })} /></div>
        <div><Label>Empresa</Label><Input value={data.company ?? ""} onChange={(e) => set({ company: e.target.value })} /></div>
      </div>

      <h3 className="text-lg font-semibold text-purple-dark pt-4">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2"><Label>Rua e número</Label><Input value={data.address ?? ""} onChange={(e) => set({ address: e.target.value })} /></div>
        <div><Label>Bairro</Label><Input value={data.neighborhood ?? ""} onChange={(e) => set({ neighborhood: e.target.value })} /></div>
        <div><Label>Cidade</Label><Input value={data.city ?? ""} onChange={(e) => set({ city: e.target.value })} /></div>
        <div><Label>Estado</Label><Input value={data.state ?? ""} onChange={(e) => set({ state: e.target.value })} /></div>
        <div><Label>CEP</Label><Input value={data.zip_code ?? ""} onChange={(e) => set({ zip_code: e.target.value })} /></div>
      </div>

      <h3 className="text-lg font-semibold text-purple-dark pt-4">Contatos</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><Label>Celular</Label><Input value={data.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} /></div>
        <div><Label>WhatsApp</Label><Input value={data.whatsapp ?? ""} onChange={(e) => set({ whatsapp: e.target.value })} /></div>
        <div><Label>E-mail</Label><Input type="email" value={data.email ?? ""} onChange={(e) => set({ email: e.target.value })} /></div>
      </div>

      <h3 className="text-lg font-semibold text-purple-dark pt-4">Contato de Emergência</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><Label>Nome</Label><Input value={data.emergency_name ?? ""} onChange={(e) => set({ emergency_name: e.target.value })} /></div>
        <div><Label>Parentesco</Label><Input value={data.emergency_relationship ?? ""} onChange={(e) => set({ emergency_relationship: e.target.value })} /></div>
        <div><Label>Telefone</Label><Input value={data.emergency_phone ?? ""} onChange={(e) => set({ emergency_phone: e.target.value })} /></div>
        <div><Label>Observações</Label><Input value={data.emergency_notes ?? ""} onChange={(e) => set({ emergency_notes: e.target.value })} /></div>
      </div>

      <h3 className="text-lg font-semibold text-purple-dark pt-4">Matrícula</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Data da matrícula</Label>
          <Input type="date" value={data.enrollment_date ?? ""} onChange={(e) => set({ enrollment_date: e.target.value })} />
        </div>
        <div>
          <Label>Status</Label>
          <Select value={data.status} onValueChange={(v) => set({ status: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STUDENT_STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div><Label>Plano contratado</Label><Input value={data.plan ?? ""} onChange={(e) => set({ plan: e.target.value })} /></div>
        <div>
          <Label>Aulas por semana</Label>
          <Input type="number" min={0} value={data.weekly_classes ?? ""} onChange={(e) => set({ weekly_classes: e.target.value ? Number(e.target.value) : null })} />
        </div>
        <div className="md:col-span-2">
          <Label>Horários</Label>
          <Textarea rows={2} value={data.schedule ?? ""} onChange={(e) => set({ schedule: e.target.value })} placeholder="Ex: Seg/Qua/Sex - 08h" />
        </div>
      </div>
    </div>
  );
}
