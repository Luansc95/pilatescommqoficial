export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      anamneses: {
        Row: {
          allergies: string | null
          created_at: string
          diseases: string[]
          diseases_other: string | null
          doctor_crm: string | null
          doctor_name: string | null
          doctor_phone: string | null
          doctor_specialty: string | null
          drinks_alcohol: boolean | null
          had_surgery: boolean | null
          has_limitations: boolean | null
          has_medical_recommendation: boolean | null
          has_pain: boolean | null
          has_prosthesis: boolean | null
          id: string
          is_breastfeeding: boolean | null
          is_pregnant: boolean | null
          medications: string | null
          observations: string | null
          practices_activity: boolean | null
          smokes: boolean | null
          student_id: string
          updated_at: string
          updated_by: string | null
          uses_medication: boolean | null
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          diseases?: string[]
          diseases_other?: string | null
          doctor_crm?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          doctor_specialty?: string | null
          drinks_alcohol?: boolean | null
          had_surgery?: boolean | null
          has_limitations?: boolean | null
          has_medical_recommendation?: boolean | null
          has_pain?: boolean | null
          has_prosthesis?: boolean | null
          id?: string
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          medications?: string | null
          observations?: string | null
          practices_activity?: boolean | null
          smokes?: boolean | null
          student_id: string
          updated_at?: string
          updated_by?: string | null
          uses_medication?: boolean | null
        }
        Update: {
          allergies?: string | null
          created_at?: string
          diseases?: string[]
          diseases_other?: string | null
          doctor_crm?: string | null
          doctor_name?: string | null
          doctor_phone?: string | null
          doctor_specialty?: string | null
          drinks_alcohol?: boolean | null
          had_surgery?: boolean | null
          has_limitations?: boolean | null
          has_medical_recommendation?: boolean | null
          has_pain?: boolean | null
          has_prosthesis?: boolean | null
          id?: string
          is_breastfeeding?: boolean | null
          is_pregnant?: boolean | null
          medications?: string | null
          observations?: string | null
          practices_activity?: boolean | null
          smokes?: boolean | null
          student_id?: string
          updated_at?: string
          updated_by?: string | null
          uses_medication?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_attachments: {
        Row: {
          created_at: string
          evolution_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          evolution_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          evolution_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_attachments_evolution_id_fkey"
            columns: ["evolution_id"]
            isOneToOne: false
            referencedRelation: "evolutions"
            referencedColumns: ["id"]
          },
        ]
      }
      evolutions: {
        Row: {
          created_at: string
          description: string | null
          evolution_date: string
          id: string
          objectives: string | null
          observations: string | null
          professor_id: string | null
          recommended_exercises: string | null
          student_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          evolution_date?: string
          id?: string
          objectives?: string | null
          observations?: string | null
          professor_id?: string | null
          recommended_exercises?: string | null
          student_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          evolution_date?: string
          id?: string
          objectives?: string | null
          observations?: string | null
          professor_id?: string | null
          recommended_exercises?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolutions_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolutions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          archived_at: string | null
          benefits: string | null
          category: string | null
          cautions: string | null
          code: string | null
          contraindications: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_min: number | null
          equipment: string | null
          id: string
          level: string | null
          muscle_group: string | null
          name: string
          objective: string | null
          photo_url: string | null
          reps: number | null
          rest_seconds: number | null
          sets: number | null
          tags: string[] | null
          tips: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          archived_at?: string | null
          benefits?: string | null
          category?: string | null
          cautions?: string | null
          code?: string | null
          contraindications?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          equipment?: string | null
          id?: string
          level?: string | null
          muscle_group?: string | null
          name: string
          objective?: string | null
          photo_url?: string | null
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          tags?: string[] | null
          tips?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          archived_at?: string | null
          benefits?: string | null
          category?: string | null
          cautions?: string | null
          code?: string | null
          contraindications?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          equipment?: string | null
          id?: string
          level?: string | null
          muscle_group?: string | null
          name?: string
          objective?: string | null
          photo_url?: string | null
          reps?: number | null
          rest_seconds?: number | null
          sets?: number | null
          tags?: string[] | null
          tips?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      lesson_items: {
        Row: {
          block: string
          created_at: string
          done: boolean
          exercise_id: string | null
          exercise_name_snapshot: string | null
          id: string
          lesson_id: string
          load: string | null
          notes: string | null
          position: number
          reps: number | null
          sets: number | null
          time_seconds: number | null
        }
        Insert: {
          block: string
          created_at?: string
          done?: boolean
          exercise_id?: string | null
          exercise_name_snapshot?: string | null
          id?: string
          lesson_id: string
          load?: string | null
          notes?: string | null
          position?: number
          reps?: number | null
          sets?: number | null
          time_seconds?: number | null
        }
        Update: {
          block?: string
          created_at?: string
          done?: boolean
          exercise_id?: string | null
          exercise_name_snapshot?: string | null
          id?: string
          lesson_id?: string
          load?: string | null
          notes?: string | null
          position?: number
          reps?: number | null
          sets?: number | null
          time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_items_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plan_items: {
        Row: {
          block: string
          created_at: string
          exercise_id: string | null
          exercise_name_snapshot: string | null
          id: string
          load: string | null
          notes: string | null
          plan_id: string
          position: number
          reps: number | null
          sets: number | null
          time_seconds: number | null
        }
        Insert: {
          block: string
          created_at?: string
          exercise_id?: string | null
          exercise_name_snapshot?: string | null
          id?: string
          load?: string | null
          notes?: string | null
          plan_id: string
          position?: number
          reps?: number | null
          sets?: number | null
          time_seconds?: number | null
        }
        Update: {
          block?: string
          created_at?: string
          exercise_id?: string | null
          exercise_name_snapshot?: string | null
          id?: string
          load?: string | null
          notes?: string | null
          plan_id?: string
          position?: number
          reps?: number | null
          sets?: number | null
          time_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_plan_items_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_plan_items_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_plans: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_min: number | null
          id: string
          level: string | null
          name: string
          objective: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          level?: string | null
          name: string
          objective?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_min?: number | null
          id?: string
          level?: string | null
          name?: string
          objective?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lessons: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          duration_min: number
          id: string
          intensity: string | null
          notes: string | null
          objective: string | null
          plan_id: string | null
          professor_id: string | null
          scheduled_date: string
          scheduled_time: string
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          duration_min?: number
          id?: string
          intensity?: string | null
          notes?: string | null
          objective?: string | null
          plan_id?: string | null
          professor_id?: string | null
          scheduled_date: string
          scheduled_time: string
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          duration_min?: number
          id?: string
          intensity?: string | null
          notes?: string | null
          objective?: string | null
          plan_id?: string | null
          professor_id?: string | null
          scheduled_date?: string
          scheduled_time?: string
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "lesson_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lessons_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      physical_assessments: {
        Row: {
          assessed_at: string
          assessor_id: string | null
          balance: number | null
          blood_pressure: string | null
          body_fat_pct: number | null
          circ_abdomen: number | null
          circ_arm: number | null
          circ_calf: number | null
          circ_hip: number | null
          circ_thigh: number | null
          circ_waist: number | null
          created_at: string
          endurance: number | null
          flexibility: number | null
          heart_rate: number | null
          height: number | null
          id: string
          imc: number | null
          mobility_ankles: number | null
          mobility_hip: number | null
          mobility_knees: number | null
          mobility_shoulders: number | null
          mobility_spine: number | null
          pain_notes: string | null
          postural_checklist: Json
          postural_notes: string | null
          strength: number | null
          student_id: string
          updated_at: string
          updated_by: string | null
          weight: number | null
        }
        Insert: {
          assessed_at?: string
          assessor_id?: string | null
          balance?: number | null
          blood_pressure?: string | null
          body_fat_pct?: number | null
          circ_abdomen?: number | null
          circ_arm?: number | null
          circ_calf?: number | null
          circ_hip?: number | null
          circ_thigh?: number | null
          circ_waist?: number | null
          created_at?: string
          endurance?: number | null
          flexibility?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          imc?: number | null
          mobility_ankles?: number | null
          mobility_hip?: number | null
          mobility_knees?: number | null
          mobility_shoulders?: number | null
          mobility_spine?: number | null
          pain_notes?: string | null
          postural_checklist?: Json
          postural_notes?: string | null
          strength?: number | null
          student_id: string
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Update: {
          assessed_at?: string
          assessor_id?: string | null
          balance?: number | null
          blood_pressure?: string | null
          body_fat_pct?: number | null
          circ_abdomen?: number | null
          circ_arm?: number | null
          circ_calf?: number | null
          circ_hip?: number | null
          circ_thigh?: number | null
          circ_waist?: number | null
          created_at?: string
          endurance?: number | null
          flexibility?: number | null
          heart_rate?: number | null
          height?: number | null
          id?: string
          imc?: number | null
          mobility_ankles?: number | null
          mobility_hip?: number | null
          mobility_knees?: number | null
          mobility_shoulders?: number | null
          mobility_spine?: number | null
          pain_notes?: string | null
          postural_checklist?: Json
          postural_notes?: string | null
          strength?: number | null
          student_id?: string
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "physical_assessments_assessor_id_fkey"
            columns: ["assessor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "physical_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          company: string | null
          cpf: string | null
          created_at: string
          created_by: string | null
          email: string | null
          emergency_name: string | null
          emergency_notes: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          enrollment_date: string | null
          full_name: string
          gender: string | null
          id: string
          marital_status: string | null
          neighborhood: string | null
          objectives: string[]
          objectives_other: string | null
          phone: string | null
          photo_url: string | null
          plan: string | null
          profession: string | null
          responsible_teacher_id: string | null
          rg: string | null
          schedule: string | null
          state: string | null
          status: Database["public"]["Enums"]["student_status"]
          updated_at: string
          updated_by: string | null
          weekly_classes: number | null
          whatsapp: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          emergency_name?: string | null
          emergency_notes?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          enrollment_date?: string | null
          full_name: string
          gender?: string | null
          id?: string
          marital_status?: string | null
          neighborhood?: string | null
          objectives?: string[]
          objectives_other?: string | null
          phone?: string | null
          photo_url?: string | null
          plan?: string | null
          profession?: string | null
          responsible_teacher_id?: string | null
          rg?: string | null
          schedule?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          updated_by?: string | null
          weekly_classes?: number | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          company?: string | null
          cpf?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          emergency_name?: string | null
          emergency_notes?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          enrollment_date?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          marital_status?: string | null
          neighborhood?: string | null
          objectives?: string[]
          objectives_other?: string | null
          phone?: string | null
          photo_url?: string | null
          plan?: string | null
          profession?: string | null
          responsible_teacher_id?: string | null
          rg?: string | null
          schedule?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          updated_at?: string
          updated_by?: string | null
          weekly_classes?: number | null
          whatsapp?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_responsible_teacher_id_fkey"
            columns: ["responsible_teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      terms_acceptances: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          lgpd_accepted: boolean
          risks_accepted: boolean
          student_id: string
          truth_accepted: boolean
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          lgpd_accepted?: boolean
          risks_accepted?: boolean
          student_id: string
          truth_accepted?: boolean
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          lgpd_accepted?: boolean
          risks_accepted?: boolean
          student_id?: string
          truth_accepted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_acceptances_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "professor"
      student_status: "ativo" | "pausado" | "encerrado" | "lista_espera"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "professor"],
      student_status: ["ativo", "pausado", "encerrado", "lista_espera"],
    },
  },
} as const
