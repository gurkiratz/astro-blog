-- /canvas access: public to view, owner to edit.
--
-- The anon key ships in the page source, so every rule that matters is here.
-- "authenticated" on its own is NOT "me" — anyone can sign up through the
-- public auth endpoint and get an authenticated JWT. Writes are therefore
-- gated on an explicit email allowlist, not merely on being signed in.

-- ── Who may edit ────────────────────────────────────────────────────────
create table if not exists public.canvas_editors (
  email text primary key,
  note text
);

-- Nobody reads this table directly through the API; it is consulted only by
-- the security-definer function below. RLS on with no policies = deny all.
alter table public.canvas_editors enable row level security;

-- Security definer so the check can read the allowlist even though the
-- caller can't. The pinned empty search_path means every reference has to be
-- schema-qualified, which is the point: a caller-controlled search_path must
-- not be able to swap `canvas_editors` for a table of their own.
create or replace function public.is_canvas_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.canvas_editors e
    where lower(e.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

revoke execute on function public.is_canvas_editor() from public;
-- Exposed to signed-in callers so the client can ask "may I edit?" and put
-- the canvas in read-only mode up front, rather than discovering it from a
-- failed write after the user has already drawn something.
grant execute on function public.is_canvas_editor() to authenticated;

-- ── The document ────────────────────────────────────────────────────────
drop policy if exists "canvas is readable by everyone" on public.canvas_documents;
create policy "canvas is readable by everyone"
  on public.canvas_documents for select
  to anon, authenticated
  using (true);

drop policy if exists "canvas is insertable by editors" on public.canvas_documents;
create policy "canvas is insertable by editors"
  on public.canvas_documents for insert
  to authenticated
  with check (public.is_canvas_editor());

drop policy if exists "canvas is updatable by editors" on public.canvas_documents;
create policy "canvas is updatable by editors"
  on public.canvas_documents for update
  to authenticated
  using (public.is_canvas_editor())
  with check (public.is_canvas_editor());

-- No delete policy: the client only ever upserts, and losing the single row
-- to a stray request would take the whole canvas with it.

-- ── Pasted images ───────────────────────────────────────────────────────
drop policy if exists "canvas assets are readable by everyone" on storage.objects;
create policy "canvas assets are readable by everyone"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'canvas-assets');

drop policy if exists "canvas assets are insertable by editors" on storage.objects;
create policy "canvas assets are insertable by editors"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'canvas-assets' and public.is_canvas_editor());

-- Deliberately no update/delete on storage.objects: uploads use unique keys,
-- so nothing ever needs overwriting, and deleting an object would break the
-- undo of the shape that referenced it.
