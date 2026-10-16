create extension if not exists pgcrypto;

create table if not exists public.t08_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique check (username ~ '^[a-z0-9_-]{3,24}$'),
  display_name text not null check (char_length(display_name) between 1 and 40),
  webauthn_user_id text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.t08_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.t08_users(id) on delete cascade,
  credential_id text not null unique,
  public_key_jwk jsonb not null,
  sign_count bigint not null default 0 check (sign_count >= 0),
  label text not null check (char_length(label) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.t08_challenges (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('registration', 'authentication')),
  challenge text not null unique,
  user_id uuid references public.t08_users(id) on delete cascade,
  pending_username text,
  pending_display_name text,
  pending_webauthn_user_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.t08_sessions (
  token_hash text primary key,
  user_id uuid not null references public.t08_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.t08_private_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.t08_users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists t08_passkeys_user_id_idx on public.t08_passkeys(user_id);
create index if not exists t08_challenges_expires_at_idx on public.t08_challenges(expires_at);
create index if not exists t08_sessions_user_id_idx on public.t08_sessions(user_id);
create index if not exists t08_sessions_expires_at_idx on public.t08_sessions(expires_at);
create index if not exists t08_private_items_user_id_idx on public.t08_private_items(user_id);

alter table public.t08_users enable row level security;
alter table public.t08_passkeys enable row level security;
alter table public.t08_challenges enable row level security;
alter table public.t08_sessions enable row level security;
alter table public.t08_private_items enable row level security;

revoke all on public.t08_users from anon, authenticated;
revoke all on public.t08_passkeys from anon, authenticated;
revoke all on public.t08_challenges from anon, authenticated;
revoke all on public.t08_sessions from anon, authenticated;
revoke all on public.t08_private_items from anon, authenticated;

grant all on public.t08_users to service_role;
grant all on public.t08_passkeys to service_role;
grant all on public.t08_challenges to service_role;
grant all on public.t08_sessions to service_role;
grant all on public.t08_private_items to service_role;

create or replace function public.t08_consume_challenge(
  p_id uuid,
  p_kind text
)
returns setof public.t08_challenges
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  delete from public.t08_challenges
  where id = p_id
    and kind = p_kind
    and expires_at > now()
  returning *;
end;
$$;

create or replace function public.t08_register_first_passkey(
  p_username text,
  p_display_name text,
  p_webauthn_user_id text,
  p_credential_id text,
  p_public_key_jwk jsonb,
  p_sign_count bigint,
  p_label text
)
returns table(user_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  new_user_id uuid;
begin
  insert into public.t08_users (
    username,
    display_name,
    webauthn_user_id
  ) values (
    p_username,
    p_display_name,
    p_webauthn_user_id
  )
  returning id into new_user_id;

  insert into public.t08_passkeys (
    user_id,
    credential_id,
    public_key_jwk,
    sign_count,
    label
  ) values (
    new_user_id,
    p_credential_id,
    p_public_key_jwk,
    p_sign_count,
    p_label
  );

  insert into public.t08_private_items (user_id, title, content)
  values
    (
      new_user_id,
      '진행 중 프로젝트 메모',
      p_display_name || ' 계정용 가상 메모: API 인증 흐름과 테스트 항목을 정리합니다.'
    ),
    (
      new_user_id,
      '다음 준비 목록',
      p_display_name || ' 계정용 가상 메모: 포트폴리오 근거 링크와 기술 설명을 점검합니다.'
    ),
    (
      new_user_id,
      '주간 회고',
      p_display_name || ' 계정용 가상 메모: 문제의 증상보다 원인을 먼저 확인한 작업을 기록합니다.'
    );

  return query select new_user_id;
end;
$$;

create or replace function public.t08_delete_passkey_if_redundant(
  p_user_id uuid,
  p_passkey_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  passkey_count integer;
begin
  select count(*)
  into passkey_count
  from public.t08_passkeys
  where user_id = p_user_id;

  if passkey_count <= 1 then
    return false;
  end if;

  delete from public.t08_passkeys
  where id = p_passkey_id
    and user_id = p_user_id;

  return found;
end;
$$;

revoke all on function public.t08_consume_challenge(uuid, text) from public, anon, authenticated;
revoke all on function public.t08_register_first_passkey(text, text, text, text, jsonb, bigint, text) from public, anon, authenticated;
revoke all on function public.t08_delete_passkey_if_redundant(uuid, uuid) from public, anon, authenticated;

grant execute on function public.t08_consume_challenge(uuid, text) to service_role;
grant execute on function public.t08_register_first_passkey(text, text, text, text, jsonb, bigint, text) to service_role;
grant execute on function public.t08_delete_passkey_if_redundant(uuid, uuid) to service_role;
