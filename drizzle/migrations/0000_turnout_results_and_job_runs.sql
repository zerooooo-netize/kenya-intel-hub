CREATE TABLE public.turnout_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election text NOT NULL,
  scope text NOT NULL,
  county text NOT NULL DEFAULT '',
  registered_voters integer,
  votes_cast integer,
  turnout_pct numeric(5,2),
  source_title text NOT NULL,
  source_url text NOT NULL,
  published_on date,
  verified boolean NOT NULL DEFAULT false,
  verification_note text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (election, scope, county)
);
GRANT SELECT ON public.turnout_results TO authenticated;
GRANT ALL ON public.turnout_results TO service_role;
ALTER TABLE public.turnout_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read turnout" ON public.turnout_results FOR SELECT TO authenticated USING (true);

CREATE TABLE public.job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  message text,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT ON public.job_runs TO authenticated;
GRANT ALL ON public.job_runs TO service_role;
ALTER TABLE public.job_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authed read job runs" ON public.job_runs FOR SELECT TO authenticated USING (true);
CREATE INDEX job_runs_job_started ON public.job_runs (job, started_at DESC);