// ─────────────────────────────────────────────────────────────
//  Background themes: each entry pairs an image (from /public)
//  with an accent color and a scrim strength. The image is shown
//  as a plain fixed, cover-cropped background — no shaders.
//  Picked from the "theme" button in the header, persisted in
//  localStorage.
// ─────────────────────────────────────────────────────────────

export interface ThemeEntry {
  /** Shown in the theme picker. Falls back to the image filename if omitted. */
  name?: string;
  /** Path to an image in /public. */
  image: string;
  /** Applied to --color-accent (see global.css) while this theme is active. */
  color: string;
  /**
   * CSS background-position for the image, e.g. "center bottom" to keep the
   * interesting part of the image anchored to the bottom edge on every
   * viewport shape. Defaults to "center".
   */
  position?: string;
  /**
   * Dark scrim strength over the image, 0-100, same number you'd put after
   * the slash in a Tailwind class like `bg-base/90` (this just isn't one —
   * Tailwind only generates CSS for classes it can see literally in source,
   * not ones built from a runtime value, so this drives a CSS variable
   * instead). Higher = more scrim = more legible text, less visible image.
   * Defaults to 85 if omitted.
   */
  opacity?: number;
}

const DEFAULT_SCRIM_OPACITY = 85;
const DEFAULT_POSITION = "center";

export const themes: ThemeEntry[] = [
  {
    name: "Bloom",
    image: "/flowers-bottom.jpg",
    color: "#f2d478",
    position: "center bottom",
    opacity: 80,
  },
  {
    name: "Alpine",
    image: "/painting.jpg",
    color: "#a9c491",
    position: "center bottom",
    opacity: 80,
  },
  {
    name: "After Hours",
    image: "/cafe.jpg",
    color: "#e89a5d",
    opacity: 82,
  },
  {
    name: "Dusk",
    image: "/purple.jpg",
    color: "#b48ce0",
    opacity: 76,
  },
];

/** A theme's scrim opacity as a 0-1 fraction for direct use as a CSS `opacity` value. */
export function themeOpacityFraction(theme: ThemeEntry): number {
  return (theme.opacity ?? DEFAULT_SCRIM_OPACITY) / 100;
}

/** A theme's CSS background-position. */
export function themePosition(theme: ThemeEntry): string {
  return theme.position ?? DEFAULT_POSITION;
}

/** Display label for a theme: its custom name, or the image filename without extension. */
export function themeLabel(theme: ThemeEntry): string {
  if (theme.name) return theme.name;
  const filename = theme.image.split("/").pop() ?? theme.image;
  return filename.replace(/\.[a-z0-9]+$/i, "");
}

// Also hardcoded (deliberately, see the comment there) in the FOUC-avoiding
// inline script in Base.astro's <head> — keep both in sync if this changes.
export const THEME_STORAGE_KEY = "theme";

export function getStoredThemeIndex(): number {
  const raw = localStorage.getItem(THEME_STORAGE_KEY);
  const index = raw === null ? 0 : Number(raw);
  return Number.isInteger(index) && index >= 0 && index < themes.length
    ? index
    : 0;
}
