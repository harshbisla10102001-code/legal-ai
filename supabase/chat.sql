-- Run this in Supabase SQL editor
-- Creates chat_sessions and chat_messages tables for persistent chat history.

-- Chat sessions (one per conversation thread)
create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists chat_sessions_user_id_idx on public.chat_sessions(user_id);

-- Keep updated_at fresh
create or replace function public.set_chat_session_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists chat_sessions_set_updated_at on public.chat_sessions;
create trigger chat_sessions_set_updated_at
before update on public.chat_sessions
for each row execute procedure public.set_chat_session_updated_at();

alter table public.chat_sessions enable row level security;

drop policy if exists "chat_sessions_select_own" on public.chat_sessions;
create policy "chat_sessions_select_own"
on public.chat_sessions for select to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_sessions_insert_own" on public.chat_sessions;
create policy "chat_sessions_insert_own"
on public.chat_sessions for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "chat_sessions_update_own" on public.chat_sessions;
create policy "chat_sessions_update_own"
on public.chat_sessions for update to authenticated
using (user_id = auth.uid());

drop policy if exists "chat_sessions_delete_own" on public.chat_sessions;
create policy "chat_sessions_delete_own"
on public.chat_sessions for delete to authenticated
using (user_id = auth.uid());

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_session_id_idx on public.chat_messages(session_id);

alter table public.chat_messages enable row level security;

-- Users can access messages that belong to their own sessions
drop policy if exists "chat_messages_select_own" on public.chat_messages;
create policy "chat_messages_select_own"
on public.chat_messages for select to authenticated
using (
  session_id in (select id from public.chat_sessions where user_id = auth.uid())
);

drop policy if exists "chat_messages_insert_own" on public.chat_messages;
create policy "chat_messages_insert_own"
on public.chat_messages for insert to authenticated
with check (
  session_id in (select id from public.chat_sessions where user_id = auth.uid())
);

drop policy if exists "chat_messages_delete_own" on public.chat_messages;
create policy "chat_messages_delete_own"
on public.chat_messages for delete to authenticated
using (
  session_id in (select id from public.chat_sessions where user_id = auth.uid())
);
