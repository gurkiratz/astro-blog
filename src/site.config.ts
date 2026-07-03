// ─────────────────────────────────────────────────────────────
//  Everything you'd change to make this site YOURS lives here.
//  Edit this file, not the markup.
// ─────────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialItem {
  label: string;
  href: string;
}

export const site = {
  /** Shown big at the top + used in the <title> tag. */
  name: 'Gurkirat Singh',

  /** The little line under your name. */
  tagline: 'developer · linux · neovim · writing things down',

  /** The prompt glyph before your name. Try '~', '$', '>', '*'. */
  prompt: '~',

  /** Section heading marker (before "## now" etc). Try '##', '❯', '//', '::'. */
  marker: '##',

  /** Your canonical URL. Keep in sync with `site` in astro.config.mjs. */
  url: 'https://example.com',

  /** Default meta description for pages that don't set their own. */
  description:
    'Personal site — writing about code, Linux, and small things worth keeping.',

  /** Top navigation. Add /projects, /uses, etc. as you build them (v2). */
  nav: [
    { label: 'home', href: '/' },
    { label: 'about', href: '/about' },
    { label: 'now', href: '/now' },
    { label: 'writing', href: '/writing' },
    { label: 'photography', href: '/photography' },
    { label: 'projects', href: '/projects' },
    { label: 'uses', href: '/uses' },
  ] satisfies NavItem[],

  /** Footer links. */
  social: [
    { label: 'rss', href: '/rss.xml' },
    { label: 'github', href: 'https://github.com/your-handle' },
    { label: 'email', href: 'mailto:you@example.com' },
  ] satisfies SocialItem[],
};
