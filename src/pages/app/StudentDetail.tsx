import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trash2, Loader2 } from "lucide-react";
import DadosTab from "@/components/app/studentTabs/DadosTab";
import ObjetivosTab from "@/components/app/studentTabs/ObjetivosTab";
import AnamneseTab from "@/components/app/studentTabs/AnamneseTab";
import AvaliacaoTab from "@/components/app/studentTabs/AvaliacaoTab";
import EvolucaoTab from "@/components/app/studentTabs/EvolucaoTab";
import PdfTab from "@/components/app/studentTabs/PdfTab";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/appHelpers";

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anamneseState, setAnamneseState] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("students").select("*").eq("id", id).single();
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        navigate("/app");
        return;
      }
      setStudent(data);
      const { data: anam } = await supabase.from("anamneses").select("*").eq("student_id", id).maybeSingle();
      setAnamneseState(anam);
      setLoading(false);
    })();
  }, [id, navigate]);

  const progress = useMemo(() => {
    if (!student) return 0;
    let filled = 0;
    let total = 0;
    const fields = ["full_name","cpf","birth_date","gender","phone","email","address","city","emergency_name","emergency_phone","enrollment_date","plan","weekly_classes"];
    for (const f of fields) { total++; if (student[f]) filled++; }
    if (anamneseState) {
      const anFields = ["has_pain","practices_activity","uses_medication","observations","doctor_name"];
      for (const f of anFields) { total++; if (anamneseState[f] !== null && anamneseState[f] !== "") filled++; }
    }
    if ((student.objectives ?? []).length > 0) filled++;
    total++;
    return Math.round((filled / total) * 100);
  }, [student, anamneseState]);

  const handleDelete = async () => {
    if (!confirm(`Excluir permanentemente o aluno "${student.full_name}"? Toda a ficha, evoluções e avaliações serão apagadas.`)) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Aluno excluído" });
    navigate("/app");
  };

  if (loading || !student) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Link>
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-1" /> Excluir aluno
          </Button>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-purple-dark">{student.full_name}</h1>
        <p className="text-sm text-muted-foreground">
          Atualizado em {formatDateTime(student.updated_at)}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs font-medium text-muted-foreground w-12 text-right">{progress}%</span>
        </div>
      </div>

      <Card className="rounded-3xl border-0 shadow-soft">
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="dados" className="w-full">
            <TabsList className="grid grid-cols-3 md:grid-cols-6 h-auto mb-6">
              <TabsTrigger value="dados" className="text-xs md:text-sm">Dados</TabsTrigger>
              <TabsTrigger value="objetivos" className="text-xs md:text-sm">Objetivos</TabsTrigger>
              <TabsTrigger value="anamnese" className="text-xs md:text-sm">Anamnese</TabsTrigger>
              <TabsTrigger value="avaliacao" className="text-xs md:text-sm">Avaliação</TabsTrigger>
              <TabsTrigger value="evolucao" className="text-xs md:text-sm">Evolução</TabsTrigger>
              <TabsTrigger value="pdf" className="text-xs md:text-sm">PDF</TabsTrigger>
            </TabsList>

            <TabsContent value="dados">
              <DadosTab studentId={student.id} initial={student} onChange={(v) => setStudent(v)} />
            </TabsContent>
            <TabsContent value="objetivos">
              <ObjetivosTab studentId={student.id} initial={student} onChange={(v) => setStudent((s: any) => ({ ...s, ...v }))} />
            </TabsContent>
            <TabsContent value="anamnese">
              <AnamneseTab studentId={student.id} onChange={setAnamneseState} />
            </TabsContent>
            <TabsContent value="avaliacao">
              <AvaliacaoTab studentId={student.id} />
            </TabsContent>
            <TabsContent value="evolucao">
              <EvolucaoTab studentId={student.id} />
            </TabsContent>
            <TabsContent value="pdf">
              <PdfTab studentId={student.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
