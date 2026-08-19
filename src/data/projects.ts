// Your projects. Edit this list — the /projects page renders it automatically.

export interface Project {
  name: string;
  year: string;
  /**
   * Pill badges shown next to the name, e.g. ["Building"], ["New"], or any
   * custom string. Known labels get a fixed color from LABEL_TONES below;
   * anything else renders as a quiet neutral pill.
   */
  labels?: string[];
  description: string;
  links?: { label: string; href: string }[];
}

/** Pill color tones — styled per light/dark scheme in global.css. */
export type LabelTone = "blue" | "green" | "orange" | "pink" | "neutral";

/**
 * One place that decides what color a label is, so "Building" looks the
 * same everywhere. Add custom labels here when they deserve a color;
 * unknown labels fall back to neutral.
 */
export const LABEL_TONES: Record<string, LabelTone> = {
  Building: "blue",
  New: "orange",
  Archived: "neutral",
};

export function labelTone(label: string): LabelTone {
  return LABEL_TONES[label] ?? "neutral";
}

export const projects: Project[] = [
  {
    name: "Kirtan Sewa Player",
    year: "2026",
    labels: ["New"],
    description:
      "A web app for playing kirtan sewa audio files from kirtansewa.net.",
    links: [{ label: "live", href: "https://kirtansewa-player.vercel.app/" }],
  },
  {
    name: "this site",
    year: "2026",
    labels: ["Building"],
    description: "A personal blog-like site with Astro and Tailwind",
    links: [],
  },
];
