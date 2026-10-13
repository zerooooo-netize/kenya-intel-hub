CREATE TABLE public.analyst_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL,
  election text NOT NULL,
  county text NOT NULL,
  registered_voters bigint NOT NULL CHECK (registered_voters > 0),
  votes_cast bigint NOT NULL CHECK (votes_cast >= 0),
  turnout_pct numeric GENERATED ALWAYS AS (round(votes_cast::numeric * 100 / registered_voters, 2)) STORED,
  source_title text NOT NULL,
  source_url text NOT NULL,
  published_on date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (votes_cast <= registered_voters)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.analyst_results TO authenticated;
GRANT ALL ON public.analyst_results TO service_role;
ALTER TABLE public.analyst_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read analyst results" ON public.analyst_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Analysts add results" ON public.analyst_results FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = submitted_by AND (public.has_role(auth.uid(),'analyst') OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Owners or admins edit results" ON public.analyst_results FOR UPDATE TO authenticated
  USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Owners or admins delete results" ON public.analyst_results FOR DELETE TO authenticated
  USING (auth.uid() = submitted_by OR public.has_role(auth.uid(),'admin'));

CREATE TABLE public.turnout_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  election text NOT NULL,
  counties text[] NOT NULL,
  report text NOT NULL,
  unavailable text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.turnout_comparisons TO authenticated;
GRANT ALL ON public.turnout_comparisons TO service_role;
ALTER TABLE public.turnout_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read comparisons" ON public.turnout_comparisons FOR SELECT TO authenticated USING (true);
CREATE POLICY "Own comparisons insert" ON public.turnout_comparisons FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Own comparisons delete" ON public.turnout_comparisons FOR DELETE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(),'admin'));

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'zero@gmail.com'
ON CONFLICT DO NOTHING;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
SELECT cron.schedule('collect-turnout-6h', '0 */6 * * *', $$
  SELECT net.http_post(
    url := 'https://tqbnktbtzfxqrtbhvnic.supabase.co/functions/v1/collect-turnout',
    headers := '{"Content-Type":"application/json","apikey":"sb_publishable_mQDNXXYwRA1E8jQ_IBEQIw_Pu71nN2N"}'::jsonb,
    body := '{}'::jsonb);
$$);