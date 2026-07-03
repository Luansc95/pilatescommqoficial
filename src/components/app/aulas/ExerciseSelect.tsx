import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Exercise = { id: string; name: string; category: string | null };

export default function ExerciseSelect({
  value,
  onChange,
  placeholder = "Selecione um exercício",
}: {
  value?: string | null;
  onChange: (id: string, name: string) => void;
  placeholder?: string;
}) {
  const [items, setItems] = useState<Exercise[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("exercises")
        .select("id, name, category")
        .is("archived_at", null)
        .order("name");
      setItems(data ?? []);
    })();
  }, []);

  return (
    <Select
      value={value ?? undefined}
      onValueChange={(v) => {
        const it = items.find((i) => i.id === v);
        onChange(v, it?.name ?? "");
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((i) => (
          <SelectItem key={i.id} value={i.id}>
            {i.name}
            {i.category ? ` • ${i.category}` : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
