import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PDFDownloadLink, PDFViewer } from "@react-pdf/renderer";
import { StudentPDF } from "@/components/app/StudentPDF";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Printer, MessageCircle, FileText, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoMQ from "@/assets/logo-mq.png";

const WHATSAPP_BASE = "https://api.whatsapp.com/send";

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

interface Props { studentId: string; }

export default function PdfTab({ studentId }: Props) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);

      const [studentRes, anamneseRes, assessmentsRes, evolutionsRes] = await Promise.all([
        supabase.from("students").select("*").eq("id", studentId).single(),
        supabase.from("anamneses").select("*").eq("student_id", studentId).maybeSingle(),
        supabase.from("physical_assessments").select("*").eq("student_id", studentId).order("assessed_at", { ascending: false }),
        supabase.from("evolutions").select("*, profiles:professor_id(full_name)").eq("student_id", studentId).order("evolution_date", { ascending: false }),
      ]);

      const student = studentRes.data;
      const anamnese = anamneseRes.data;
      const assessments = assessmentsRes.data ?? [];
      const evolutions = evolutionsRes.data ?? [];

      let photoDataUrl: string | null = null;
      if (student?.photo_url) {
        const { data: signed } = await supabase.storage.from("student-files").createSignedUrl(student.photo_url, 3600);
        if (signed?.signedUrl) photoDataUrl = await fetchAsDataUrl(signed.signedUrl);
      }

      const logoDataUrl = await fetchAsDataUrl(logoMQ);

      setPdfData({
        student,
        anamnese,
        assessments,
        evolutions,
        photoDataUrl,
        logoDataUrl,
        generatedBy: profile?.full_name ?? "Profissional",
        recordNumber: studentId.slice(0, 8).toUpperCase(),
      });
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [studentId]);

  if (loading || !pdfData) {
    return (
      <div className="py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Preparando o prontuário...</p>
      </div>
    );
  }

  const filename = `Prontuario-${(pdfData.student.full_name ?? "aluno").replace(/\s+/g, "-")}.pdf`;

  const whatsappMsg = encodeURIComponent(
    `Olá ${pdfData.student.full_name?.split(" ")[0] ?? ""}, aqui está a atualização do seu prontuário PilatescomMQ.`
  );
  const whatsappNumber = (pdfData.student.whatsapp ?? pdfData.student.phone ?? "").replace(/\D/g, "");
  const whatsappUrl = whatsappNumber
    ? `${WHATSAPP_BASE}?phone=55${whatsappNumber}&text=${whatsappMsg}`
    : `${WHATSAPP_BASE}?text=${whatsappMsg}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-purple-dark">PDF do Prontuário</h3>
          <p className="text-sm text-muted-foreground">Visualize, baixe, imprima ou compartilhe.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PDFDownloadLink document={<StudentPDF {...pdfData} />} fileName={filename}>
            {({ loading: pdfLoading }) => (
              <Button size="sm" disabled={pdfLoading}>
                <Download className="w-4 h-4 mr-1" /> {pdfLoading ? "Gerando..." : "Baixar PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button size="sm" variant="outline" onClick={() => window.open(`/app/alunos/${studentId}/imprimir`, "_blank")}>
            <Printer className="w-4 h-4 mr-1" /> Imprimir
          </Button>
          <Button size="sm" variant="outline" asChild>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <Card className="rounded-2xl border-0 shadow-soft overflow-hidden">
        <CardContent className="p-0 h-[70vh]">
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <StudentPDF {...pdfData} />
          </PDFViewer>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        <FileText className="w-3 h-3 inline mr-1" />
        Para enviar o PDF anexado no WhatsApp: baixe primeiro e envie o arquivo pelo chat que abrirá.
      </p>
    </div>
  );
}
