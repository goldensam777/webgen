begin;

-- Extensions
create extension if not exists pgcrypto;

-- Clean total
drop table if exists public.chat_messages cascade;
drop table if exists public.submissions cascade;
drop table if exists public.posts cascade;
drop table if exists public.sites cascade;
drop table if exists public.users cascade;

-- USERS
create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_email_idx on public.users (email);

-- SITES
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  title text,
  config jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sites_user_id_idx on public.sites (user_id);
create index sites_slug_idx on public.sites (slug);

-- POSTS (blog)
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  site_slug text not null references public.sites(slug) on delete cascade,
  slug text not null,
  title text not null,
  excerpt text,
  content text not null,
  cover_url text,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_slug, slug)
);

create index posts_site_slug_idx on public.posts (site_slug);
create index posts_published_idx on public.posts (published);

-- CHAT MESSAGES
create table public.chat_messages (
  id bigserial primary key,
  site_slug text not null references public.sites(slug) on delete cascade,
  session_id text not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index chat_messages_site_slug_idx on public.chat_messages (site_slug);
create index chat_messages_session_id_idx on public.chat_messages (session_id);

-- CONTACT SUBMISSIONS
create table public.submissions (
  id bigserial primary key,
  site_slug text not null references public.sites(slug) on delete cascade,
  name text,
  email text,
  message text,
  created_at timestamptz not null default now()
);

create index submissions_site_slug_idx on public.submissions (site_slug);

-- updated_at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger trg_sites_updated_at
before update on public.sites
for each row execute function public.set_updated_at();

create trigger trg_posts_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

commit;
