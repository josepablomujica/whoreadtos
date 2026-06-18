-- whoreadtos schema
-- Run this in the Supabase SQL editor

create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sector      text not null,
  tos_url     text not null,
  logo_color  text not null default '#1D9E75',
  created_at  timestamptz not null default now(),
  unique (name)
);

create table if not exists analyses (
  id          uuid primary key default gen_random_uuid(),
  company_id  uuid not null references companies(id) on delete cascade,
  score       text not null check (score in ('A','B','C','D','F')),
  items       jsonb not null,
  word_count  integer,
  analyzed_at timestamptz not null default now()
);

create index if not exists analyses_company_id_idx on analyses(company_id);
create index if not exists analyses_analyzed_at_idx on analyses(analyzed_at desc);

-- View: latest analysis per company, used by GET /api/companies
create or replace view company_rankings as
select distinct on (c.id)
  c.id,
  c.name,
  c.sector,
  c.tos_url,
  c.logo_color,
  c.created_at,
  a.id          as analysis_id,
  a.score,
  a.items,
  a.word_count,
  a.analyzed_at
from companies c
left join analyses a on a.company_id = c.id
order by c.id, a.analyzed_at desc;

-- RLS: public read, anon write (scraper uses anon key)
alter table companies enable row level security;
alter table analyses  enable row level security;

create policy "public read companies"
  on companies for select using (true);

create policy "anon insert companies"
  on companies for insert with check (true);

create policy "anon update companies"
  on companies for update using (true);

create policy "public read analyses"
  on analyses for select using (true);

create policy "anon insert analyses"
  on analyses for insert with check (true);
