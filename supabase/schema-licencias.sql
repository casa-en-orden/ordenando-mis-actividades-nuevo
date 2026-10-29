-- Esquema inicial para licencias de pago único.
-- Ejecutar en el SQL Editor del proyecto Supabase una vez creado.
-- Nunca poner claves de servicio en la app ni en el repositorio.

create extension if not exists pgcrypto;

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  license_hash text not null unique,
  status text not null default 'active' check (status in ('active', 'revoked')),
  created_at timestamptz not null default now(),
  buyer_reference text,
  notes text
);

create table if not exists public.license_activations (
  id uuid primary key default gen_random_uuid(),
  license_id uuid not null references public.licenses(id) on delete cascade,
  platform text not null check (platform in ('android', 'windows')),
  device_hash text not null,
  activated_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (license_id, platform, device_hash),
  unique (license_id, platform)
);

alter table public.licenses enable row level security;
alter table public.license_activations enable row level security;

-- No se crean políticas públicas: las operaciones se realizarán exclusivamente
-- desde funciones de servidor con la clave service role guardada como secreto.
revoke all on public.licenses from anon, authenticated;
revoke all on public.license_activations from anon, authenticated;

-- La clave de licencia se guarda como hash SHA-256, nunca en texto plano.
