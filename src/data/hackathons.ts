// Hackathons & competitions. Edit this list — /hackathons renders it.

export interface Hackathon {
  name: string;
  /** Event or host, e.g. "Skills Ontario". */
  event: string;
  year: string;
  /**
   * Pill badges, e.g. ["Gold"], ["Winner"], ["Participant"].
   * Known labels get colors from LABEL_TONES; others are neutral.
   */
  labels?: string[];
  description: string;
  links?: { label: string; href: string }[];
}

export type LabelTone = "blue" | "green" | "orange" | "pink" | "neutral";

export const LABEL_TONES: Record<string, LabelTone> = {
  Gold: "blue",
  Silver: "neutral",
  Bronze: "orange",
  Winner: "green",
  Finalist: "blue",
  Participant: "neutral",
};

export function labelTone(label: string): LabelTone {
  return LABEL_TONES[label] ?? "neutral";
}

export const hackathons: Hackathon[] = [
  {
    name: "Gold Medal @ Coding/Programming Track",
    event: "Skills Ontario",
    year: "2026",
    labels: ["Gold", "Winner"],
    description: "Competed against students from 20 colleges.",
    links: [
      {
        label: "linkedin",
        href: "https://www.linkedin.com/posts/gurkiratz_soc2026-oco2026-humberfast-ugcPost-7458635966560448512-0Z0Q",
      },
      {
        label: "news",
        href: "https://humber.ca/today/news/humber-students-shine-bright-skills-ontario-15-medals",
      },
    ],
  },
];
