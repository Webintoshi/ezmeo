-- Analytics runtime schema (sessions/pageviews/events/checkout)
-- Safe to run multiple times.

create extension if not exists "uuid-ossp";

create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null unique,
  user_agent text,
  referrer text,
  device_type text default 'desktop',
  browser text,
  os text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  started_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  is_active boolean default true,
  page_views integer default 0
);

create table if not exists public.page_views (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  page_url text not null,
  page_title text,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  event_type text not null,
  event_data jsonb default '{}'::jsonb,
  page_url text,
  created_at timestamptz default now()
);

create table if not exists public.checkout_sessions (
  id uuid primary key default uuid_generate_v4(),
  session_id text not null,
  step text default 'info',
  cart_items jsonb default '[]'::jsonb,
  cart_total numeric default 0,
  email text,
  phone text,
  order_id uuid,
  abandoned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_sessions_session_id on public.sessions(session_id);
create index if not exists idx_sessions_last_activity_at on public.sessions(last_activity_at);
create index if not exists idx_sessions_is_active on public.sessions(is_active);

create index if not exists idx_page_views_created_at on public.page_views(created_at);
create index if not exists idx_page_views_session_id on public.page_views(session_id);
create index if not exists idx_page_views_page_url on public.page_views(page_url);

create index if not exists idx_events_created_at on public.events(created_at);
create index if not exists idx_events_session_id on public.events(session_id);
create index if not exists idx_events_type on public.events(event_type);

create index if not exists idx_checkout_sessions_session_id on public.checkout_sessions(session_id);
create index if not exists idx_checkout_sessions_updated_at on public.checkout_sessions(updated_at);

create or replace function public.increment_page_views(p_session_id text)
returns void
language plpgsql
as $$
begin
  update public.sessions
  set
    page_views = coalesce(page_views, 0) + 1,
    last_activity_at = now(),
    is_active = true
  where session_id = p_session_id;
end;
$$;

-- abandoned_carts compatibility for current API usage
alter table public.abandoned_carts
  add column if not exists session_id text,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists is_anonymous boolean default true,
  add column if not exists item_count integer default 0,
  add column if not exists status text default 'active',
  add column if not exists updated_at timestamptz default now(),
  add column if not exists recovered_at timestamptz;

update public.abandoned_carts
set status = case when coalesce(recovered, false) then 'recovered' else 'active' end
where status is null;
