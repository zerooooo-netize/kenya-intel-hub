CREATE TABLE IF NOT EXISTS public.officeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('president','deputy_president','governor','senator','woman_rep','mp','mca')),
  full_name text NOT NULL,
  party text,
  county text,
  constituency text,
  ward text,
  photo_url text,
  source_title text NOT NULL,
  source_url text NOT NULL,
  verified_on date,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.officeholders TO authenticated;
GRANT ALL ON public.officeholders TO service_role;
ALTER TABLE public.officeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authed read officeholders" ON public.officeholders;
CREATE POLICY "Authed read officeholders" ON public.officeholders FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff add officeholders" ON public.officeholders;
CREATE POLICY "Staff add officeholders" ON public.officeholders FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'analyst'));
DROP POLICY IF EXISTS "Staff edit officeholders" ON public.officeholders;
CREATE POLICY "Staff edit officeholders" ON public.officeholders FOR UPDATE TO authenticated USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'analyst'));
DROP POLICY IF EXISTS "Admins delete officeholders" ON public.officeholders;
CREATE POLICY "Admins delete officeholders" ON public.officeholders FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));
CREATE TRIGGER officeholders_updated BEFORE UPDATE ON public.officeholders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();