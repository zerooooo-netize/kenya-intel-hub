-- Roles enum
create type public.app_role as enum ('admin', 'analyst', 'viewer');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can view own roles" on public.user_roles
  for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default viewer role on signup; first user gets admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));

  select count(*) into user_count from auth.users;
  if user_count = 1 then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles (user_id, role) values (new.id, 'viewer');
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- API Connections (admin-managed keys for data sources)
create table public.api_connections (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  category text not null, -- social | news | osint | ai | comms
  display_name text not null,
  api_key text,
  api_secret text,
  extra_config jsonb default '{}'::jsonb,
  enabled boolean not null default false,
  rate_limit_per_min int default 60,
  last_tested_at timestamptz,
  status text default 'unconfigured',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.api_connections enable row level security;

create policy "Admins manage api_connections" on public.api_connections
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Analysts can view connection status" on public.api_connections
  for select using (public.has_role(auth.uid(), 'analyst') or public.has_role(auth.uid(), 'admin'));

-- Module / Bot settings
create table public.module_settings (
  id uuid primary key default gen_random_uuid(),
  module_key text not null unique,
  display_name text not null,
  enabled boolean not null default true,
  ai_model text default 'google/gemini-3-flash-preview',
  config jsonb default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.module_settings enable row level security;
create policy "All users read modules" on public.module_settings
  for select using (auth.uid() is not null);
create policy "Admins manage modules" on public.module_settings
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- System logs
create table public.system_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'info',
  source text not null,
  message text not null,
  metadata jsonb default '{}'::jsonb,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.system_logs enable row level security;
create policy "Admins read logs" on public.system_logs
  for select using (public.has_role(auth.uid(), 'admin'));
create policy "Authed insert logs" on public.system_logs
  for insert with check (auth.uid() is not null);

-- Alerts (realtime)
create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  severity text not null default 'info',
  title text not null,
  description text,
  source text,
  metadata jsonb default '{}'::jsonb,
  acknowledged boolean default false,
  created_at timestamptz not null default now()
);
alter table public.alerts enable row level security;
create policy "Authed read alerts" on public.alerts
  for select using (auth.uid() is not null);
create policy "Admins manage alerts" on public.alerts
  for all using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Authed insert alerts" on public.alerts
  for insert with check (auth.uid() is not null);

alter publication supabase_realtime add table public.alerts;
alter table public.alerts replica identity full;

-- Seed providers + modules
insert into public.api_connections (provider, category, display_name) values
  ('x_twitter','social','X (Twitter)'),
  ('meta','social','Meta (Facebook/Instagram)'),
  ('tiktok','social','TikTok'),
  ('youtube','social','YouTube'),
  ('newsapi','news','NewsAPI'),
  ('gnews','news','GNews'),
  ('mediastack','news','MediaStack'),
  ('kenyan_rss','news','Kenyan RSS (Nation/Standard/Citizen)'),
  ('hibp','osint','Have I Been Pwned'),
  ('intelx','osint','IntelligenceX'),
  ('shodan','osint','Shodan'),
  ('dehashed','osint','DeHashed'),
  ('openai','ai','OpenAI (BYO)'),
  ('anthropic','ai','Anthropic (BYO)'),
  ('gemini','ai','Google Gemini (BYO)'),
  ('twilio','comms','Twilio SMS'),
  ('resend','comms','Resend Email'),
  ('slack','comms','Slack Webhook');

insert into public.module_settings (module_key, display_name) values
  ('recon','Recon Bot'),
  ('vulnerability','Vulnerability Bot'),
  ('identity','Identity Bot'),
  ('threat_intel','Threat Intel Bot'),
  ('brand_protection','Brand Protection Bot'),
  ('deep_dive','Deep Dive Bot');