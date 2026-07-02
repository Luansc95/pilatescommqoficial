import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function StudentNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("students")
      .insert({
        full_name: fullName.trim(),
        phone: phone || null,
        email: email || null,
        created_by: user?.id,
        updated_by: user?.id,
        enrollment_date: new Date().toISOString().slice(0, 10),
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
      return;
    }
    // Create empty anamnese and terms records
    await Promise.all([
      supabase.from("anamneses").insert({ student_id: data.id, updated_by: user?.id }),
      supabase.from("terms_acceptances").insert({ student_id: data.id }),
    ]);
    toast({ title: "Aluno cadastrado", description: "Complete o prontuário nas abas." });
    navigate(`/app/alunos/${data.id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-3xl font-bold text-purple-dark mb-2">Novo Aluno</h1>
      <p className="text-muted-foreground mb-8">
        Preencha o mínimo para criar o cadastro. O prontuário completo é editado depois.
      </p>

      <Card className="rounded-3xl border-0 shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="full_name">Nome completo *</Label>
              <Input
                id="full_name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Silva"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(24) 99999-0000" />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={saving || !fullName.trim()}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar e continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
