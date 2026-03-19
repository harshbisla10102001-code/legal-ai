-- Run this in Supabase SQL editor
-- Creates documents table, audit_log, and Storage bucket for document risk analysis.

-- Documents table
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_type text not null,
  file_size_bytes bigint not null,
  storage_path text not null,
  document_type text,
  risk_score int check (risk_score >= 0 and risk_score <= 100),
  analysis_json jsonb,
  extraction_method text,
  created_at timestamptz not null default now()
);

create index if not exists documents_user_id_idx on public.documents(user_id);
create index if not exists documents_created_at_idx on public.documents(created_at desc);

alter table public.documents enable row level security;

drop policy if exists "documents_select_own" on public.documents;
create policy "documents_select_own"
on public.documents for select to authenticated
using (user_id = auth.uid());

drop policy if exists "documents_insert_own" on public.documents;
create policy "documents_insert_own"
on public.documents for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "documents_update_own" on public.documents;
create policy "documents_update_own"
on public.documents for update to authenticated
using (user_id = auth.uid());

drop policy if exists "documents_delete_own" on public.documents;
create policy "documents_delete_own"
on public.documents for delete to authenticated
using (user_id = auth.uid());

-- Audit log (DPDPA 2023 compliance)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  document_id uuid references public.documents(id) on delete set null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_log_user_id_idx on public.audit_log(user_id);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_insert_own" on public.audit_log;
create policy "audit_log_insert_own"
on public.audit_log for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "audit_log_select_own" on public.audit_log;
create policy "audit_log_select_own"
on public.audit_log for select to authenticated
using (user_id = auth.uid());

-- Storage bucket: run in Supabase SQL editor (or create via Dashboard)
insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 10485760)
on conflict (id) do update set file_size_limit = 10485760;

-- Storage RLS: users can only access their own files (path: {user_id}/{doc_id}/...)
drop policy if exists "documents_upload_own" on storage.objects;
create policy "documents_upload_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_select_own" on storage.objects;
create policy "documents_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documents_delete_own" on storage.objects;
create policy "documents_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text
);
