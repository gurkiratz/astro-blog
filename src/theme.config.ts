// ─────────────────────────────────────────────────────────────
//  Background themes: each entry pairs an image (from /public),
//  an accent color, and one of the shader components in
//  src/lib/shaderBackgrounds.ts. Picked from the "theme" button
//  in the header, persisted in localStorage.
// ─────────────────────────────────────────────────────────────

export type BackgroundComponent =
  | "halftone"
  | "halftone-cmyk"
  | "water"
  | "paper-texture";

export interface ThemeEntry {
  /** Shown in the theme picker. Falls back to the image filename if omitted. */
  name?: string;
  /** Path to an image in /public. */
  image: string;
  /** Applied to --color-accent (see global.css) while this theme is active. */
  color: string;
  component: BackgroundComponent;
  /**
   * Dark scrim strength over the shader, 0-100, same number you'd put after
   * the slash in a Tailwind class like `bg-base/90` (this just isn't one —
   * Tailwind only generates CSS for classes it can see literally in source,
   * not ones built from a runtime value, so this drives a CSS variable
   * instead). Higher = more scrim = more legible text, less visible shader.
   * Defaults to 85 if omitted.
   */
  opacity?: number;
}

const DEFAULT_SCRIM_OPACITY = 85;

export const themes: ThemeEntry[] = [
  {
    name: "Daisies",
    image: "/flower.png",
    color: "#fff384",
    component: "halftone-cmyk",
    opacity: 95,
  },
  {
    name: "Flowers",
    image: "/flower-2.jpg",
    color: "#f79c9c",
    component: "halftone-cmyk",
    opacity: 90,
  },
  {
    name: "Roadtrip",
    image: "/van.jpg",
    color: "#f7c29c",
    component: "halftone-cmyk",
    opacity: 90,
  },
  {
    image: "/purple.jpg",
    color: "#b48ce0",
    component: "halftone-cmyk",
    opacity: 85,
  },
  { image: "/sea.jpg", color: "#80B9D1", component: "water", opacity: 90 },
];

/** A theme's scrim opacity as a 0-1 fraction for direct use as a CSS `opacity` value. */
export function themeOpacityFraction(theme: ThemeEntry): number {
  return (theme.opacity ?? DEFAULT_SCRIM_OPACITY) / 100;
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
