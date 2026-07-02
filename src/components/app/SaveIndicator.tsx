import { Check, Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved" | "error";

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  return (
    <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
      {state === "saving" && (<><Loader2 className="w-3 h-3 animate-spin" /> Salvando…</>)}
      {state === "saved" && (<><Check className="w-3 h-3 text-green-600" /> Salvo</>)}
      {state === "error" && (<span className="text-destructive">Erro ao salvar</span>)}
    </span>
  );
}
