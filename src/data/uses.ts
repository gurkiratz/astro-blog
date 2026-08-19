// The stuff you use. Edit these groups — the /uses page renders them grouped.
// Shape: "Label: Name (note)" — name links when url is set; label/note are optional.

export interface UsesItem {
  /** Shown before the colon, e.g. "Browser". Omit for a bare linked name. */
  label?: string;
  /** Tool name — link text when url is set. */
  name: string;
  url?: string;
  /** Extra detail shown in parentheses after the name. */
  note?: string;
}

export interface UsesGroup {
  category: string;
  items: UsesItem[];
}

export const uses: UsesGroup[] = [
  {
    category: "software",
    items: [
      {
        label: "Password manager",
        name: "Bitwarden",
        url: "https://bitwarden.com",
      },
      {
        label: "Notes",
        name: "Obsidian",
        url: "https://obsidian.md",
        note: "synced via iCloud",
      },
      {
        label: "Notes",
        name: "Bear",
        url: "https://bear.app",
        note: "pro",
      },
      {
        label: "Media player",
        name: "IINA",
        url: "https://iina.io",
      },
    ],
  },
  {
    category: "hardware",
    items: [
      {
        label: "Laptop",
        name: '14" MacBook Air M2',
        note: "24 GB RAM, 512 GB SSD",
      },
      {
        label: "Monitor",
        name: "ViewSonic VX3211-2K-mhd",
        url: "https://www.viewsonic.com/us/vx3211-2k-mhd-32-1440p-ips-monitor-with-hdmi-displayport-vga-and-srgb.html",
      },
      {
        label: "Phone",
        name: "iPhone 17 Pro",
      },
      {
        label: "Tablet",
        name: "iPad 11th gen",
      },
    ],
  },
  {
    category: "dev tools",
    items: [
      {
        label: "AI agents",
        name: "Claude Code",
        url: "https://claude.com/claude-code",
        note: "team plan",
      },
      {
        label: "AI agents",
        name: "Cursor",
        url: "https://cursor.com",
      },
      {
        label: "IDE",
        name: "VS Code",
        url: "https://code.visualstudio.com",
      },
      {
        label: "IDE",
        name: "IntelliJ IDEA",
        url: "https://www.jetbrains.com/idea",
        note: "Java",
      },
      {
        label: "Devtools",
        name: "Beekeeper Studio",
        url: "https://www.beekeeperstudio.io",
      },
      {
        label: "Terminal",
        name: "Ghostty",
        url: "https://ghostty.org",
      },
    ],
  },
];
