
-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'professor');
CREATE TYPE public.student_status AS ENUM ('ativo', 'pausado', 'encerrado', 'lista_espera');

-- ============================================================
-- HELPER: updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- USER ROLES
-- ============================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is staff (admin or professor)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'professor')
  )
$$;

-- ============================================================
-- PROFILES POLICIES (depend on has_role/is_staff)
-- ============================================================
CREATE POLICY "Staff can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);

-- ============================================================
-- USER ROLES POLICIES
-- ============================================================
CREATE POLICY "Staff can view roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Personal
  photo_url TEXT,
  full_name TEXT NOT NULL,
  cpf TEXT,
  rg TEXT,
  birth_date DATE,
  gender TEXT,
  marital_status TEXT,
  profession TEXT,
  company TEXT,
  -- Address
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  -- Contacts
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  -- Emergency contact
  emergency_name TEXT,
  emergency_relationship TEXT,
  emergency_phone TEXT,
  emergency_notes TEXT,
  -- Enrollment
  enrollment_date DATE,
  responsible_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  plan TEXT,
  weekly_classes INTEGER,
  schedule TEXT,
  status public.student_status NOT NULL DEFAULT 'ativo',
  -- Objectives
  objectives TEXT[] NOT NULL DEFAULT '{}',
  objectives_other TEXT,
  -- Meta
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff can view students"
ON public.students FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert students"
ON public.students FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update students"
ON public.students FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete students"
ON public.students FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_students_full_name ON public.students(full_name);
CREATE INDEX idx_students_status ON public.students(status);

-- ============================================================
-- ANAMNESES (1 per student)
-- ============================================================
CREATE TABLE public.anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  -- Yes/No questions
  has_pain BOOLEAN,
  had_surgery BOOLEAN,
  has_prosthesis BOOLEAN,
  is_pregnant BOOLEAN,
  is_breastfeeding BOOLEAN,
  smokes BOOLEAN,
  drinks_alcohol BOOLEAN,
  practices_activity BOOLEAN,
  uses_medication BOOLEAN,
  has_medical_recommendation BOOLEAN,
  has_limitations BOOLEAN,
  observations TEXT,
  -- Diseases
  diseases TEXT[] NOT NULL DEFAULT '{}',
  diseases_other TEXT,
  -- Free fields
  allergies TEXT,
  medications TEXT,
  -- Doctor
  doctor_name TEXT,
  doctor_specialty TEXT,
  doctor_phone TEXT,
  doctor_crm TEXT,
  -- Meta
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.anamneses TO authenticated;
GRANT ALL ON public.anamneses TO service_role;
ALTER TABLE public.anamneses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_anamneses_updated_at
BEFORE UPDATE ON public.anamneses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff can view anamneses"
ON public.anamneses FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage anamneses"
ON public.anamneses FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- PHYSICAL ASSESSMENTS (many per student, keep history)
-- ============================================================
CREATE TABLE public.physical_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  assessed_at DATE NOT NULL DEFAULT CURRENT_DATE,
  assessor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Basic
  weight NUMERIC(5,2),
  height NUMERIC(4,2),
  imc NUMERIC(4,2),
  body_fat_pct NUMERIC(4,2),
  blood_pressure TEXT,
  heart_rate INTEGER,
  -- Circumferences (cm)
  circ_arm NUMERIC(5,2),
  circ_abdomen NUMERIC(5,2),
  circ_waist NUMERIC(5,2),
  circ_hip NUMERIC(5,2),
  circ_thigh NUMERIC(5,2),
  circ_calf NUMERIC(5,2),
  -- Scales 1-5
  mobility_shoulders SMALLINT,
  mobility_hip SMALLINT,
  mobility_spine SMALLINT,
  mobility_knees SMALLINT,
  mobility_ankles SMALLINT,
  flexibility SMALLINT,
  balance SMALLINT,
  strength SMALLINT,
  endurance SMALLINT,
  -- Pain
  pain_notes TEXT,
  -- Postural
  postural_notes TEXT,
  postural_checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Meta
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.physical_assessments TO authenticated;
GRANT ALL ON public.physical_assessments TO service_role;
ALTER TABLE public.physical_assessments ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_pa_updated_at
BEFORE UPDATE ON public.physical_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff can manage assessments"
ON public.physical_assessments FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

CREATE INDEX idx_pa_student_date ON public.physical_assessments(student_id, assessed_at DESC);

-- ============================================================
-- EVOLUTIONS (timeline, history preserved)
-- ============================================================
CREATE TABLE public.evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  evolution_date DATE NOT NULL DEFAULT CURRENT_DATE,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  description TEXT,
  objectives TEXT,
  observations TEXT,
  recommended_exercises TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evolutions TO authenticated;
GRANT ALL ON public.evolutions TO service_role;
ALTER TABLE public.evolutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view evolutions"
ON public.evolutions FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert evolutions"
ON public.evolutions FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update own evolutions"
ON public.evolutions FOR UPDATE TO authenticated
USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete evolutions"
ON public.evolutions FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_evolutions_student_date ON public.evolutions(student_id, evolution_date DESC);

-- ============================================================
-- EVOLUTION ATTACHMENTS
-- ============================================================
CREATE TABLE public.evolution_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evolution_id UUID NOT NULL REFERENCES public.evolutions(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.evolution_attachments TO authenticated;
GRANT ALL ON public.evolution_attachments TO service_role;
ALTER TABLE public.evolution_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage attachments"
ON public.evolution_attachments FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));

-- ============================================================
-- TERMS ACCEPTANCES
-- ============================================================
CREATE TABLE public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL UNIQUE REFERENCES public.students(id) ON DELETE CASCADE,
  truth_accepted BOOLEAN NOT NULL DEFAULT false,
  lgpd_accepted BOOLEAN NOT NULL DEFAULT false,
  risks_accepted BOOLEAN NOT NULL DEFAULT false,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.terms_acceptances TO authenticated;
GRANT ALL ON public.terms_acceptances TO service_role;
ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_terms_updated_at
BEFORE UPDATE ON public.terms_acceptances
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Staff can manage terms"
ON public.terms_acceptances FOR ALL TO authenticated
USING (public.is_staff(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()));
