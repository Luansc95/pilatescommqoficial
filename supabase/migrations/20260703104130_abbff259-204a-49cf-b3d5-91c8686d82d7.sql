
-- ============ EXERCISES ============
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  category text,
  muscle_group text,
  objective text,
  level text,
  equipment text,
  duration_min int,
  sets int,
  reps int,
  rest_seconds int,
  description text,
  benefits text,
  contraindications text,
  cautions text,
  tips text,
  photo_url text,
  video_url text,
  tags text[] DEFAULT '{}',
  archived_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exercises TO authenticated;
GRANT ALL ON public.exercises TO service_role;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage exercises" ON public.exercises FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER exercises_updated BEFORE UPDATE ON public.exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LESSON PLANS ============
CREATE TABLE public.lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  objective text,
  level text,
  duration_min int,
  archived_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plans TO authenticated;
GRANT ALL ON public.lesson_plans TO service_role;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage plans" ON public.lesson_plans FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER lesson_plans_updated BEFORE UPDATE ON public.lesson_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ LESSON PLAN ITEMS ============
CREATE TABLE public.lesson_plan_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
  block text NOT NULL, -- aquecimento, mobilidade, alongamento, fortalecimento, equilibrio, coordenacao, relaxamento
  position int NOT NULL DEFAULT 0,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name_snapshot text,
  sets int,
  reps int,
  time_seconds int,
  load text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_plan_items TO authenticated;
GRANT ALL ON public.lesson_plan_items TO service_role;
ALTER TABLE public.lesson_plan_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage plan items" ON public.lesson_plan_items FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX ON public.lesson_plan_items(plan_id);

-- ============ LESSONS ============
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  professor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id uuid REFERENCES public.lesson_plans(id) ON DELETE SET NULL,
  scheduled_date date NOT NULL,
  scheduled_time time NOT NULL,
  duration_min int NOT NULL DEFAULT 60,
  objective text,
  intensity text,
  status text NOT NULL DEFAULT 'agendada', -- agendada, realizada, faltou, cancelada
  notes text,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage lessons" ON public.lessons FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE TRIGGER lessons_updated BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX ON public.lessons(student_id);
CREATE INDEX ON public.lessons(scheduled_date);

-- ============ LESSON ITEMS ============
CREATE TABLE public.lesson_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  block text NOT NULL,
  position int NOT NULL DEFAULT 0,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL,
  exercise_name_snapshot text,
  sets int,
  reps int,
  time_seconds int,
  load text,
  notes text,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_items TO authenticated;
GRANT ALL ON public.lesson_items TO service_role;
ALTER TABLE public.lesson_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage lesson items" ON public.lesson_items FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE INDEX ON public.lesson_items(lesson_id);

-- ============ TRIGGER: on lesson completed => create evolution entry ============
CREATE OR REPLACE FUNCTION public.on_lesson_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_summary text;
  v_plan_name text;
BEGIN
  IF NEW.status = 'realizada' AND (OLD.status IS DISTINCT FROM 'realizada') THEN
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
    SELECT name INTO v_plan_name FROM public.lesson_plans WHERE id = NEW.plan_id;
    v_summary := 'Aula realizada'
      || COALESCE(' • Plano: ' || v_plan_name, '')
      || COALESCE(' • Objetivo: ' || NEW.objective, '')
      || COALESCE(' • Intensidade: ' || NEW.intensity, '')
      || ' • Duração: ' || NEW.duration_min || ' min'
      || COALESCE(E'\nObservações: ' || NEW.notes, '');
    INSERT INTO public.evolutions (student_id, professor_id, session_date, content)
    VALUES (NEW.student_id, NEW.professor_id, NEW.scheduled_date, v_summary);
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER lessons_on_completed BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.on_lesson_completed();
