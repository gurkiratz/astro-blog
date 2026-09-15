-- Restrict sign-in to the canvas editor allowlist.
--
-- Before this, anyone who found /canvas?edit could send themselves a magic
-- link and create an account. They still couldn't draw (0002 gates writes),
-- but they could burn the project's email quota and fill auth.users.
--
-- This has to live in the database, not in the client. `shouldCreateUser:
-- false` in CanvasSignIn.tsx only changes what our own form asks for — the
-- auth endpoint is public, and anyone can post to it with that flag set back
-- to true. A trigger on auth.users is the gate that can't be talked around.
--
-- Consequence worth knowing: public.canvas_editors is now the single source
-- of truth for both signing in AND writing. Empty that table and nobody can
-- get in — to add a collaborator, insert their email there FIRST, then have
-- them request a link.

create or replace function public.enforce_canvas_editor_signup()
returns trigger
language plpgsql
security definer
-- Pinned empty search_path: this runs as the function owner on every new
-- auth user, so an unqualified reference must not be resolvable to a table
-- the caller controls.
set search_path = ''
as $$
begin
  -- A null email (phone or anonymous sign-in) fails this too, which is what
  -- we want: the canvas only ever authenticates by email.
  if not exists (
    select 1
    from public.canvas_editors e
    where lower(e.email) = lower(new.email)
  ) then
    raise exception 'sign-up is restricted to canvas editors'
      using errcode = 'insufficient_privilege';
  end if;

  return new;
end;
$$;

-- BEFORE INSERT only. Existing users must keep working — an UPDATE guard
-- would break token refresh and email changes for the owner.
drop trigger if exists canvas_restrict_signups on auth.users;
create trigger canvas_restrict_signups
  before insert on auth.users
  for each row execute function public.enforce_canvas_editor_signup();
