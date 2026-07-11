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

/** Shared profile / feed URLs — referenced by `site` and the footer social list. */
export const links = {
  github: "https://github.com/gurkiratz",
  linkedin: "https://www.linkedin.com/in/gurkiratz/",
  email: "mailto:gurkirat.singh@humber.ca",
  rss: "/rss.xml",
} as const;

export const site = {
  /** Shown big at the top + used in the <title> tag. */
  name: "Gurkirat Singh",

  /** The little line under your name. */
  // tagline: 'developer · linux · neovim · writing things down',
  // tagline: "Master of pushing .DS_Store",
  tagline: "",

  /** Shown in the footer clock: "3:00pm in Toronto, Canada". */
  location: "Toronto, Canada",

  /** IANA timezone for the live footer clock. */
  timezone: "America/Toronto",

  /** The prompt glyph before your name. Try '~', '$', '>', '*'. */
  prompt: "",

  /** Section heading marker (before "now" etc). Empty = no marker (quietest).
      Try '##', '❯', '//', '::' if you want the terminal flavor back. */
  marker: "",

  /** Your canonical URL. Keep in sync with `site` in astro.config.mjs. */
  url: "https://gurkiratz.co",

  /** Default meta description for pages that don't set their own. */
  description:
    "Personal site — writing about code, work life, and small things worth keeping.",

  /** Top navigation. Add /projects, /uses, etc. as you build them (v2). */
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Writing", href: "/writing" },
    // { label: "Now", href: "/now" },
    // { label: "Photography", href: "/photography" },
    // { label: "Uses", href: "/uses" },
    { label: "Slashpages", href: "/slashpages" },
  ] satisfies NavItem[],

  // Social media links
  ...links,

  /** Footer links. */
  social: [
    { label: "RSS", href: links.rss },
    { label: "GitHub", href: links.github },
    { label: "LinkedIn", href: links.linkedin },
    { label: "Email", href: links.email },
  ] satisfies SocialItem[],
};
