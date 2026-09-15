# personal site

A hand-built personal site + blog. Astro + Tailwind v4, dark "terminal" theme.

## stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — via the `@tailwindcss/vite` plugin
- Content collections for `/writing`
- [tldraw](https://tldraw.dev) + [Supabase](https://supabase.com) — the `/canvas` page
- Deploys to Vercel

## develop

```sh
npm install      # install dependencies
npm run dev      # local dev server at http://localhost:4321
npm run build    # build to ./dist
npm run preview  # preview the production build locally
```

## make it yours

- **`src/site.config.ts`** — name, tagline, nav, social links. Start here.
- **`src/styles/global.css`** — the design tokens live in the `@theme` block;
  change the colors there to re-skin the whole site.
- **`src/content/writing/*.md`** — your posts. Frontmatter: `title`, `date`,
  `tags`, optional `description`, optional `draft: true`.

## structure

```
src/
  site.config.ts        # all your personal settings
  content.config.ts     # the /writing collection schema
  styles/global.css     # tailwind import + theme tokens + prose styles
  layouts/Base.astro    # page shell (head, nav, footer)
  pages/
    index.astro         # home
    about.astro
    now.astro
    writing/
      index.astro       # post list, grouped by year
      [id].astro        # individual post
    canvas.astro        # tldraw infinite canvas (full-bleed, no footer)
    rss.xml.ts          # RSS feed at /rss.xml
  components/
    Canvas.tsx          # the tldraw island (client:only)
    CanvasSignIn.tsx    # owner magic-link form, shown only at ?edit
  lib/canvas-store.ts   # Supabase persistence + image upload
  content/writing/      # markdown posts
public/                 # static assets (favicon, images)
supabase/migrations/    # canvas schema + row-level security policies
```

## /canvas (tldraw + Supabase)

An infinite canvas at `/canvas`. Public to read, owner to edit.

- The document (shapes, pages) lives in Postgres: `public.canvas_documents`,
  one row, `id = 'main'`.
- Camera and selection stay in `localStorage` — they're per browser, not
  shared.
- Pasted images and video go to the `canvas-assets` Storage bucket; the
  document only stores their public URL.
- Schema and policies are in `supabase/migrations/`. Read them before
  changing anything: the anon key ships in the page source, so those policies
  are the only thing standing between your canvas and the internet.

### who can edit

Writes are gated on an email allowlist, not merely on being signed in —
anyone can create an account through the public auth endpoint:

```sql
insert into public.canvas_editors (email, note) values ('you@example.com', 'me');
```

That table gates **both** signing in and writing. A trigger on `auth.users`
(`0003_restrict_signups.sql`) refuses to create an account for any address
that isn't on it, so a stranger requesting a link gets no account and no
email. To add a collaborator, insert their email **first**, then have them
request a link — and don't empty the table, or nobody can get back in.

That gate lives in the database on purpose. `shouldCreateUser: false` in the
sign-in form is only a courtesy: the auth endpoint is public, and anyone can
post to it with that flag flipped back on.

Sign in at **`/canvas?edit`** (a magic link to that address). The form is
hidden on the plain `/canvas` URL on purpose, and `?edit` is dropped from the
URL once you're signed in so the panel isn't sitting in the corner you're
drawing in — revisit `/canvas?edit` to sign out. Everyone else gets the canvas
in tldraw's read-only mode: pan, zoom, select, no edits.

The form answers the same way for every address, so it can't be used to find
out who may edit your canvas. Real failures are logged to the console.

### setup

1. Copy `.env.example` to `.env` and fill in `PUBLIC_SUPABASE_ANON_KEY`
   (Supabase dashboard → Project Settings → API). Both vars are `PUBLIC_*`
   and are inlined into the browser bundle, which is correct for these two.
   The service_role key and the database password must never go in here.
2. Supabase dashboard → Authentication → URL Configuration: set the Site URL
   to your domain and add `http://localhost:4321/canvas?edit` and
   `https://<your-domain>/canvas?edit` to the redirect allowlist, or the
   magic link will bounce.
3. Set the same two `PUBLIC_*` vars in the Cloudflare Pages build settings —
   they're read at build time, so a deploy without them ships a canvas that
   can't reach the database.

## deploy (Cloudflare Pages)

Connect the repo in the Cloudflare dashboard, or use Wrangler:

- Build command: `npm run build`
- Build output directory: `dist`

Set the real domain in `astro.config.mjs` (`site:`) and `src/site.config.ts`
(`url:`) before launch — it's used for canonical URLs and the RSS feed.

## roadmap (v2+)

- `/projects`, `/uses`, `/notes`, `/contact`
- photo gallery + `photos.` subdomain
- `/guestbook` + "tell me something" (Cloudflare Workers + KV)
- custom 404, light/dark toggle
