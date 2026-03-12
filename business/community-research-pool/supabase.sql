-- Community Research Pool (CRP) — v0 schema

create table if not exists public.crp_topics (
  slug text primary key,
  title text not null,
  description text not null,
  solved boolean not null default false,
  solved_criteria jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crp_runs (
  id text primary key,
  topic_slug text not null references public.crp_topics(slug) on delete cascade,
  run_date date not null,
  contributor_id text not null,
  duration_minutes int not null default 60,
  summary text not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists crp_runs_topic_date_idx on public.crp_runs(topic_slug, run_date);

create table if not exists public.crp_sources (
  id text primary key,
  topic_slug text not null references public.crp_topics(slug) on delete cascade,
  url text not null,
  url_hash text not null,
  title text,
  published_at date,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(topic_slug, url_hash)
);
create index if not exists crp_sources_topic_idx on public.crp_sources(topic_slug);

create table if not exists public.crp_findings (
  id text primary key,
  topic_slug text not null references public.crp_topics(slug) on delete cascade,
  run_id text not null references public.crp_runs(id) on delete cascade,
  finding text not null,
  confidence text not null, -- low|med|high
  why text not null,
  source_ids text[] not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists crp_findings_topic_idx on public.crp_findings(topic_slug);
create index if not exists crp_findings_run_idx on public.crp_findings(run_id);

create table if not exists public.crp_open_questions (
  id text primary key,
  topic_slug text not null references public.crp_topics(slug) on delete cascade,
  run_id text not null references public.crp_runs(id) on delete cascade,
  question text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.crp_failed_paths (
  id text primary key,
  topic_slug text not null references public.crp_topics(slug) on delete cascade,
  run_id text not null references public.crp_runs(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

-- Seed baked-in topic
insert into public.crp_topics (slug, title, description, solved_criteria)
values (
  'cure-cancer',
  'Curing cancer (research frontier)',
  'Public delta reports focused on Milestone B: mechanism + target class w/ Phase 2 signals across tumor types and validated biomarkers.',
  jsonb_build_object(
    'milestone', 'B',
    'definition', 'Mechanistic + translation milestone',
    'requirements', jsonb_build_array(
      'Mechanism identified and clearly described',
      'Target class plausibly generalizes beyond one cancer type',
      'Phase 2 efficacy signals across multiple tumor types',
      'Validated biomarkers for responders'
    )
  )
)
on conflict (slug) do nothing;

-- RLS: keep OFF for v0 until policies are written.
