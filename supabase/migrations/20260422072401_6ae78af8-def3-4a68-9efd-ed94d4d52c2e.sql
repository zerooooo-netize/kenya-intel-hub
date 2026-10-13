CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.aspired_position AS ENUM (
  'president', 'deputy_president', 'governor', 'senator',
  'woman_representative', 'mp', 'mca'
);

CREATE TABLE public.candidate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  full_name text NOT NULL,
  aspired_position public.aspired_position NOT NULL,
  party text,
  county text,
  constituency text,
  ward text,
  campaign_slogan text,
  campaign_topics text[] DEFAULT '{}',
  bio text,
  website text,
  social_handles jsonb DEFAULT '{}'::jsonb,
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete candidate profile"
  ON public.candidate_profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER candidate_profiles_updated_at
  BEFORE UPDATE ON public.candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();