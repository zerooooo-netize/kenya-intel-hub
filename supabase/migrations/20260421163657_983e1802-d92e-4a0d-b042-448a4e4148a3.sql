ALTER TABLE public.alerts REPLICA IDENTITY FULL;

CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  resource text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_usage_events_created ON public.usage_events(created_at DESC);
CREATE INDEX idx_usage_events_user ON public.usage_events(user_id);
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users insert own usage" ON public.usage_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own usage" ON public.usage_events
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  stripe_customer_id text,
  subscribed boolean NOT NULL DEFAULT false,
  subscription_tier text DEFAULT 'free',
  subscription_end timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON public.subscribers
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Edge functions update subscriptions" ON public.subscribers
  FOR UPDATE USING (true);
CREATE POLICY "Edge functions insert subscriptions" ON public.subscribers
  FOR INSERT WITH CHECK (true);

CREATE TABLE public.ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authed read ai_settings" ON public.ai_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage ai_settings" ON public.ai_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.ai_settings (key, value, description) VALUES
  ('default_model', '"google/gemini-3-flash-preview"'::jsonb, 'Default AI model for analysis'),
  ('temperature', '0.7'::jsonb, 'Creativity level (0-1)'),
  ('max_tokens', '2048'::jsonb, 'Max output tokens per response'),
  ('tone', '"analytical"'::jsonb, 'Output tone: analytical | persuasive | neutral | bold'),
  ('language', '"en"'::jsonb, 'Default output language (en/sw)');

CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authed read system_settings" ON public.system_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage system_settings" ON public.system_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.system_settings (key, value) VALUES
  ('platform_name', '"ZERO"'::jsonb),
  ('alerts_enabled', 'true'::jsonb),
  ('realtime_polling_seconds', '30'::jsonb),
  ('data_retention_days', '90'::jsonb);