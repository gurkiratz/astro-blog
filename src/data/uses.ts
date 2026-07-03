// The stuff you use. Edit these groups — the /uses page renders them grouped.

export interface UsesGroup {
  category: string;
  items: { name: string; note?: string }[];
}

export const uses: UsesGroup[] = [
  {
    category: 'editor & terminal',
    items: [
      { name: 'neovim', note: 'my whole editing life lives here' },
      { name: 'kitty', note: 'gpu terminal, fast and simple' },
      { name: 'tmux', note: 'sessions that survive everything' },
      { name: 'zsh + starship', note: 'a prompt that tells me just enough' },
    ],
  },
  {
    category: 'desktop',
    items: [
      { name: 'arch linux', note: 'btw' },
      { name: 'hyprland', note: 'tiling wayland compositor' },
    ],
  },
  {
    category: 'hardware',
    items: [{ name: 'replace me', note: 'add your laptop, keyboard, etc.' }],
  },
];
