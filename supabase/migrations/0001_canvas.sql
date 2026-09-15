-- /canvas storage: one tldraw document + a bucket for pasted images.
--
-- Applied against the live project already; kept here so the schema is
-- reproducible and reviewable. Row-level security is ON for both the table
-- and the bucket, and the policies live in 0002_canvas_policies.sql — without
-- that second file nothing is readable or writable by the anon key.

-- ── Document ────────────────────────────────────────────────────────────
-- tldraw splits a snapshot into `document` (shapes, pages, bindings — shared)
-- and `session` (camera, selection — per browser). Only the document half
-- belongs on the server; session state stays in localStorage.
create table if not exists public.canvas_documents (
  id text primary key,
  document jsonb not null,
  -- tldraw's store serialization version, so a future schema bump can be
  -- detected rather than guessed at.
  schema_version integer,
  updated_at timestamptz not null default now()
);

alter table public.canvas_documents enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
-- Pinned search_path: this runs as the table owner, so an empty one would let
-- a caller-controlled path resolve `now()` to something else.
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists canvas_documents_touch_updated_at on public.canvas_documents;
create trigger canvas_documents_touch_updated_at
  before update on public.canvas_documents
  for each row execute function public.touch_updated_at();

-- ── Image bucket ────────────────────────────────────────────────────────
-- Public read: tldraw's asset `resolve()` hands the browser a plain URL, and
-- signed URLs would expire inside a long-lived document. Writes are still
-- gated by the storage.objects policies.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'canvas-assets',
  'canvas-assets',
  true,
  10485760, -- 10 MB, matching the client-side guard in Canvas.tsx
  array[
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
