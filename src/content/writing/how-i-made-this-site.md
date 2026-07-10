---
title: How I made this site
date: 2026-07-04
tags:
  - personal
  - web
  - astro
description: The inspirations, the stack, and why I hand-built this instead of using a platform.
draft: false
---

I've been collecting personal sites for years — quietly bookmarking the ones
that felt like _someone_ actually lived there. The folder got big enough that I
had to build my own.

## the inspiration

A few that shaped this one:

- [alexwlchan.net](https://alexwlchan.net) — hand-coded, data-rich, colorful without being loud. The gold standard.
- [areyouelectronic.com](https://www.areyouelectronic.com) and [cassidoo.co](https://cassidoo.co) — proof that monospace + dark can feel warm, not clinical.
- [lazybea.rs](https://lazybea.rs) and [helgesver.re](https://helgesver.re) — for the sheer vibe.

I borrowed ideas as much as looks: the [now page](https://nownownow.com), the
[slash pages](https://slashpages.net) convention, and [uses.tech](https://uses.tech).

## the stack

I got as far as eyeing a hosted platform before the itch to own every line won.
So it's hand-built:

- **[Astro](https://astro.build)** — static, markdown-first.
- **Tailwind v4** — design tokens in one CSS file, no config soup.
- **MDX** — so a post can drop in a component when words aren't enough.
- **Expressive Code** — the framed, copy-buttoned code blocks you're looking at.
- **Cloudflare Pages** — free hosting, room to grow into.

Underneath it's basically markdown files and a bit of CSS, which is exactly the
point: it should still build in five years.

## the look

Dark, monospace, `##` for section markers, a little theme switcher up top that
recolors the accent. It should read like a terminal someone actually enjoys
living in.

More soon.
