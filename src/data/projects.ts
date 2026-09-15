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
  Hackathon: "pink",
  Client: "green",
  Personal: "blue",
};

export function labelTone(label: string): LabelTone {
  return LABEL_TONES[label] ?? "neutral";
}

export const projects: Project[] = [
  {
    name: "Global Sikhs NGO",
    year: "2026",
    labels: ["Building", "Client"],
    description: "A redesign of the theglobalsikhs.org website",
    links: [{ label: "live", href: "https://global-sikhs-delta.vercel.app" }],
  },
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
    description: "A personal blog site built with Astro and Tailwind",
    links: [
      { label: "source", href: "https://github.com/gurkiratz/astro-blog" },
    ],
  },

  // {
  //   name: "Keertan",
  //   year: "2025",
  //   description: "A collection of audio content related to the Sikh faith.",
  //   links: [
  //     { label: "live", href: "https://keertan.co" },
  //     { label: "source", href: "https://github.com/gurkiratz/keertan.co" },
  //   ],
  // },

  {
    name: "6ix City Immigration Inc.",
    year: "2024",
    labels: ["Client"],
    description: "Website for 6ix City Immigration Inc. made in Next.js.",
    links: [{ label: "live", href: "https://www.6ixcityimmigration.ca/" }],
  },

  {
    name: "iOS World Clock",
    year: "2023",
    labels: ["Handmade"],
    description:
      "A world clock web app inspired by the iOS Clock app. I made this one when I was learning web development",
    links: [
      { label: "live", href: "https://gurkiratz.github.io/ios-world-clock/" },
      { label: "source", href: "https://github.com/gurkiratz/ios-world-clock" },
    ],
  },
];

export const hackathonProjects: Project[] = [
  {
    name: "Repo360",
    year: "2025",
    labels: ["Hackathon"],
    description:
      "AI-powered repository analyzer that transforms overwhelming codebases into clear insights.",
    links: [
      { label: "demo", href: "https://youtu.be/LAD-kBDGYUk" },
      { label: "live", href: "https://repo360.vercel.app/" },
      { label: "source", href: "https://github.com/gurkiratz/Repo360" },
    ],
  },
  {
    name: "Marvin QA",
    year: "2025",
    labels: ["Hackathon"],
    description:
      "Diagnose web scraper failures, analyze patterns, and provide actionable insights.",
    links: [
      { label: "source", href: "https://github.com/gurkiratz/marvin" },
      { label: "devpost", href: "https://devpost.com/software/marvin-qa" },
      { label: "live", href: "https://www.marvinqa.co/" },
      {
        label: "demo",
        href: "https://youtu.be/CtyYhvahKmI?si=1H4e0pEWYKE24ZMY",
      },
    ],
  },
  {
    name: "DeltaHealth",
    year: "2025",
    labels: ["Hackathon"],
    description:
      "DeltaHealth AI evaluates your symptoms, assesses your condition, and offers guidance on next steps.",
    links: [
      { label: "live", href: "http://deltahealth.vercel.app/" },
      { label: "demo", href: "https://youtu.be/SSvVJ4bAd1Y" },
      { label: "source", href: "https://github.com/jasooh/deltahealth" },
      { label: "devpost", href: "https://devpost.com/software/deltahealth" },
    ],
  },
  {
    name: "Roast My Wallet",
    year: "2025",
    labels: ["Hackathon"],
    description:
      "Generate roasts based on your crypto wallet balance. Winner $400 NEAR Agent Bounty Track.",
    links: [
      { label: "source", href: "https://github.com/gurkiratz/RoastMyWallet" },
      { label: "devpost", href: "https://dorahacks.io/buidl/23077/" },
      { label: "demo", href: "https://youtu.be/NQGAmm0PQ8U" },
    ],
  },
  {
    name: "We Broke The Ice",
    year: "2024",
    labels: ["Hackathon"],
    description:
      "Generate AI-powered icebreaker ideas with intuitive instructions. Winner Best UI @ GDSC Hacks 2024.",
    links: [
      { label: "live", href: "https://webroketheice.gurkiratz.co" },
      { label: "source", href: "https://github.com/gurkiratz/webroketheice" },
      { label: "devpost", href: "https://devpost.com/software/breaktheice" },
    ],
  },
  {
    name: "Crowdfund",
    year: "2024",
    labels: ["Hackathon"],
    description:
      "A decentralized crowdfunding platform. Winner 4th place Starknet @ Hack Western 11.",
    links: [
      { label: "live", href: "https://crowdfund-hackwestern.vercel.app/" },
      {
        label: "source",
        href: "https://github.com/gurkiratz/crowdfund-hackwestern",
      },
      {
        label: "blog",
        href: "https://v2.gurkiratsingh.xyz/posts/how-i-built-a-crowdfunding-platform-solo-at-hackwestern",
      },
    ],
  },
];
