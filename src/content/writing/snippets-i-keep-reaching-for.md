---
title: Snippets I keep reaching for
date: 2026-06-30
tags:
  - code
  - shell
  - typescript
description: A few small snippets I copy often — and a demo of how code blocks render on this blog.
draft: false
---

Some code I copy-paste often enough that it lives here now. It doubles as a test
of how code renders here: filenames, a copy button, and the odd highlighted
line, all applied at build time.

## find the biggest files

When a disk fills up, this is the first thing I run:

```bash
# top 20 largest files under the current directory
du -ah . | sort -rh | head -n 20
```

## a typed debounce

Small enough to remember, annoying enough to re-derive every time:

```ts title="debounce.ts" {8}
export function debounce<A extends unknown[]>(
  fn: (...args: A) => void,
  ms = 200,
): (...args: A) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
```

Use it like `const onScroll = debounce(handler, 100)` — the handler only fires
once the events settle.

## the CSS reset I always start with

```css title="reset.css"
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}
```

That's it — three things I've stopped re-googling.
