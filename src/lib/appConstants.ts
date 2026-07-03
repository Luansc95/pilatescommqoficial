export const OBJECTIVE_OPTIONS = [
  "Emagrecimento",
  "Fortalecimento",
  "Flexibilidade",
  "Correção Postural",
  "Condicionamento",
  "Hipertrofia",
  "Reabilitação",
  "Gestação",
  "Qualidade de Vida",
  "Redução de dores",
] as const;

export const DISEASE_OPTIONS = [
  "Hipertensão",
  "Diabetes",
  "Problemas cardíacos",
  "Hérnia de Disco",
  "Escoliose",
  "Osteoporose",
  "Fibromialgia",
  "Artrose",
  "Artrite",
  "Asma",
  "Labirintite",
] as const;

export const POSTURAL_CHECKLIST = [
  { key: "cabeca_anteriorizada", label: "Cabeça anteriorizada" },
  { key: "hiperlordose", label: "Hiperlordose" },
  { key: "hipercifose", label: "Hipercifose" },
  { key: "escoliose", label: "Escoliose" },
  { key: "assimetria_ombros", label: "Assimetria de ombros" },
  { key: "assimetria_quadril", label: "Assimetria de quadril" },
  { key: "joelho_valgo", label: "Joelho valgo" },
  { key: "joelho_varo", label: "Joelho varo" },
  { key: "pe_plano", label: "Pé plano" },
  { key: "pe_cavo", label: "Pé cavo" },
] as const;

export const STUDENT_STATUS_LABELS: Record<string, string> = {
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
  lista_espera: "Lista de Espera",
};

export const STUDENT_STATUS_COLORS: Record<string, string> = {
  ativo: "bg-green-100 text-green-800 border-green-200",
  pausado: "bg-yellow-100 text-yellow-800 border-yellow-200",
  encerrado: "bg-gray-100 text-gray-800 border-gray-200",
  lista_espera: "bg-blue-100 text-blue-800 border-blue-200",
};

export const STUDIO_INFO = {
  name: "PilatescomMQ",
  address: "Rua Paulo de Frontin, Nº 129 - Loja 03",
  neighborhood: "Centro",
  city: "Barra do Piraí - RJ",
  phone: "(24) 99836-8014",
};

// ============ AULAS ============
export const EXERCISE_CATEGORIES = [
  "Aquecimento",
  "Mobilidade",
  "Alongamento",
  "Fortalecimento",
  "Equilíbrio",
  "Coordenação",
  "Relaxamento",
  "Cardio",
  "Core",
  "Postura",
] as const;

export const MUSCLE_GROUPS = [
  "Membros superiores",
  "Membros inferiores",
  "Core / Abdômen",
  "Coluna / Dorsal",
  "Glúteos",
  "Peitoral",
  "Corpo inteiro",
] as const;

export const EQUIPMENT_OPTIONS = [
  "Solo / Mat",
  "Reformer",
  "Cadillac",
  "Chair",
  "Barrel",
  "Ladder Barrel",
  "Wall Unit",
  "Magic Circle",
  "Bola Suíça",
  "Bosu",
  "Faixa Elástica",
  "Halteres",
  "TRX",
  "Rolo",
] as const;

export const LEVEL_OPTIONS = ["Iniciante", "Intermediário", "Avançado"] as const;

export const INTENSITY_OPTIONS = ["Leve", "Moderada", "Intensa"] as const;

export const LESSON_BLOCKS = [
  { key: "aquecimento", label: "Aquecimento" },
  { key: "mobilidade", label: "Mobilidade" },
  { key: "alongamento", label: "Alongamento" },
  { key: "fortalecimento", label: "Fortalecimento" },
  { key: "equilibrio", label: "Equilíbrio" },
  { key: "coordenacao", label: "Coordenação" },
  { key: "relaxamento", label: "Relaxamento" },
] as const;

export const LESSON_STATUS_LABELS: Record<string, string> = {
  agendada: "Agendada",
  realizada: "Realizada",
  faltou: "Faltou",
  cancelada: "Cancelada",
};

export const LESSON_STATUS_COLORS: Record<string, string> = {
  agendada: "bg-blue-100 text-blue-800 border-blue-200",
  realizada: "bg-green-100 text-green-800 border-green-200",
  faltou: "bg-orange-100 text-orange-800 border-orange-200",
  cancelada: "bg-gray-100 text-gray-800 border-gray-200",
};
