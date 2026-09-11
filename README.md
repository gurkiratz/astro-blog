# personal site

A hand-built personal site + blog. Astro + Tailwind v4, dark "terminal" theme.

## stack

- [Astro](https://astro.build) — static site generator
- [Tailwind CSS v4](https://tailwindcss.com) — via the `@tailwindcss/vite` plugin
- Content collections for `/writing`
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
    rss.xml.ts          # RSS feed at /rss.xml
  content/writing/      # markdown posts
public/                 # static assets (favicon, images)
```

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
