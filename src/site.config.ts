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
  url: "https://example.com",

  /** Default meta description for pages that don't set their own. */
  description:
    "Personal site — writing about code, work life, and small things worth keeping.",

  /** Top navigation. Add /projects, /uses, etc. as you build them (v2). */
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Now", href: "/now" },
    { label: "Writing", href: "/writing" },
    { label: "Photography", href: "/photography" },
    { label: "Projects", href: "/projects" },
    { label: "Uses", href: "/uses" },
  ] satisfies NavItem[],

  /** Footer links. */
  social: [
    { label: "RSS", href: "/rss.xml" },
    { label: "GitHub", href: "https://github.com/gurkiratz" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/gurkiratz/" },
    { label: "Email", href: "mailto:gurkirat.singh@humber.ca" },
  ] satisfies SocialItem[],
};
