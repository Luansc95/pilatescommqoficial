CREATE OR REPLACE FUNCTION public.on_lesson_completed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_desc text;
  v_plan_name text;
BEGIN
  IF NEW.status = 'realizada' AND (OLD.status IS DISTINCT FROM 'realizada') THEN
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;
    SELECT name INTO v_plan_name FROM public.lesson_plans WHERE id = NEW.plan_id;
    v_desc := 'Aula realizada'
      || COALESCE(' • Plano: ' || v_plan_name, '')
      || COALESCE(' • Objetivo: ' || NEW.objective, '')
      || COALESCE(' • Intensidade: ' || NEW.intensity, '')
      || ' • Duração: ' || NEW.duration_min || ' min';
    INSERT INTO public.evolutions (student_id, professor_id, evolution_date, description, observations)
    VALUES (NEW.student_id, NEW.professor_id, NEW.scheduled_date, v_desc, NEW.notes);
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.on_lesson_completed() FROM PUBLIC, anon, authenticated;