import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2, Trash2, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface StaffMember { user_id: string; role: string; full_name: string; }

export default function Team() {
  const { user: currentUser } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", full_name: "", role: "professor" as "admin" | "professor" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");
    if (!roles) { setLoading(false); return; }
    const ids = [...new Set(roles.map((r) => r.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
    const merged = roles.map((r) => ({
      user_id: r.user_id,
      role: r.role,
      full_name: profiles?.find((p) => p.id === r.user_id)?.full_name ?? "—",
    }));
    setStaff(merged);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase.functions.invoke("create-staff-user", { body: newUser });
    setSaving(false);
    if (error || data?.error) {
      toast({ title: "Erro", description: data?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Usuário criado" });
    setDialogOpen(false);
    setNewUser({ email: "", password: "", full_name: "", role: "professor" });
    load();
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`Remover ${name} da equipe? Isso apaga a conta permanentemente.`)) return;
    const { data, error } = await supabase.functions.invoke("delete-staff-user", { body: { user_id: userId } });
    if (error || data?.error) {
      toast({ title: "Erro", description: data?.error ?? error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Usuário removido" });
    load();
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-purple-dark">Equipe</h1>
          <p className="text-muted-foreground">{staff.length} membros</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="rounded-full">
          <Plus className="w-4 h-4 mr-2" /> Novo membro
        </Button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
          {staff.map((s) => (
            <Card key={s.user_id + s.role} className="rounded-2xl border-0 shadow-soft">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{s.full_name} {s.user_id === currentUser?.id && <span className="text-xs text-muted-foreground">(você)</span>}</p>
                    <Badge variant="outline" className="text-xs mt-0.5">{s.role === "admin" ? "Administrador" : "Professor"}</Badge>
                  </div>
                </div>
                {s.user_id !== currentUser?.id && (
                  <button onClick={() => handleDelete(s.user_id, s.full_name)} className="text-destructive hover:opacity-70">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar membro da equipe</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Nome completo</Label><Input value={newUser.full_name} onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })} /></div>
            <div><Label>E-mail</Label><Input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} /></div>
            <div><Label>Senha (mín. 8)</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} /></div>
            <div>
              <Label>Papel</Label>
              <Select value={newUser.role} onValueChange={(v) => setNewUser({ ...newUser, role: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professor">Professor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
