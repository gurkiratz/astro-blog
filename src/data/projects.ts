// Your projects. Edit this list — the /projects page renders it automatically.

export interface Project {
  name: string;
  year: string;
  status: 'active' | 'wip' | 'archived';
  description: string;
  links?: { label: string; href: string }[];
}

export const projects: Project[] = [
  {
    name: 'this site',
    year: '2026',
    status: 'active',
    description: 'A hand-built personal site + blog. Astro, Tailwind, no templates.',
    links: [{ label: 'repo', href: 'https://github.com/your-handle/site' }],
  },
  {
    name: 'dotfiles',
    year: '2025',
    status: 'active',
    description: 'My Arch + Hyprland + Neovim setup, kept reproducible.',
    links: [{ label: 'repo', href: 'https://github.com/your-handle/dotfiles' }],
  },
  {
    name: 'example project',
    year: '2024',
    status: 'archived',
    description:
      'A placeholder — replace these with your real work in src/data/projects.ts.',
    links: [
      { label: 'repo', href: '#' },
      { label: 'live', href: '#' },
    ],
  },
];
