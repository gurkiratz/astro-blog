// Keeps the colors behind mobile Safari's status bar and bottom toolbar in
// step with what the page actually shows at its top and bottom edges.
//
// The visible background is a viewport-fixed theme image (cover-cropped) under
// a scrim of --color-base, so the edge colors depend on the active theme and on
// the viewport's shape — not on scroll offset. This module calculates the
// top/bottom pair once per change and applies that single pair everywhere:
//   --edge-top-background / --edge-bottom-background on <html>, which paint
//   the .edge-top / .edge-bottom strips (::after), the <html> background (top),
//   the <body> background (bottom) — see global.css — and <meta theme-color>.
import { themes, getActiveThemeIndex, themePosition } from '../theme.config';

type Rgb = [number, number, number];

const FALLBACK_BASE = '#16140f';
const MIN_BAND = 12;
const TOP_VAR = '--edge-top-background';
const BOTTOM_VAR = '--edge-bottom-background';

const images = new Map<string, Promise<HTMLImageElement | null>>();
let scratch: CanvasRenderingContext2D | null = null;

function context(width: number, height: number) {
  if (!scratch) {
    scratch = document
      .createElement('canvas')
      .getContext('2d', { willReadFrequently: true });
  }
  if (scratch) {
    scratch.canvas.width = width;
    scratch.canvas.height = height;
    scratch.imageSmoothingQuality = 'high';
  }
  return scratch;
}

function parseColor(value: string): Rgb {
  const ctx = context(1, 1);
  if (!ctx) return [22, 20, 15];
  ctx.fillStyle = '#000';
  ctx.fillStyle = value || FALLBACK_BASE;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function toHex([r, g, b]: Rgb) {
  return (
    '#' +
    [r, g, b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('')
  );
}

function loadImage(src: string) {
  let pending = images.get(src);
  if (!pending) {
    pending = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
    images.set(src, pending);
  }
  return pending;
}

/** "center bottom" -> [0.5, 1] as fractions of the overflow on each axis. */
function parsePosition(position: string): [number, number] {
  const fraction: Record<string, number> = {
    left: 0,
    top: 0,
    center: 0.5,
    right: 1,
    bottom: 1,
  };
  const [a = 'center', b] = position.trim().split(/\s+/);
  if (b === undefined) {
    return a === 'top' || a === 'bottom'
      ? [0.5, fraction[a]]
      : [fraction[a] ?? 0.5, 0.5];
  }
  return a === 'top' || a === 'bottom'
    ? [fraction[b] ?? 0.5, fraction[a]]
    : [fraction[a] ?? 0.5, fraction[b] ?? 0.5];
}

/** Average color of a band of the cover-cropped image at the top or bottom. */
function sampleEdge(
  img: HTMLImageElement,
  box: { width: number; height: number },
  position: [number, number],
  band: number,
  edge: 'top' | 'bottom',
): Rgb | null {
  const scale = Math.max(box.width / img.naturalWidth, box.height / img.naturalHeight);
  const sw = box.width / scale;
  const sh = box.height / scale;
  const sx = (img.naturalWidth - sw) * position[0];
  const sy = (img.naturalHeight - sh) * position[1];
  const bandSrc = Math.min(sh, band / scale);
  const srcY = edge === 'top' ? sy : sy + sh - bandSrc;

  const ctx = context(32, 4);
  if (!ctx) return null;
  ctx.drawImage(img, sx, srcY, sw, bandSrc, 0, 0, 32, 4);
  const { data } = ctx.getImageData(0, 0, 32, 4);
  const total = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    total[0] += data[i];
    total[1] += data[i + 1];
    total[2] += data[i + 2];
  }
  const count = data.length / 4;
  return [total[0] / count, total[1] / count, total[2] / count];
}

function mix(under: Rgb, over: Rgb, overAlpha: number): Rgb {
  return [0, 1, 2].map(
    (i) => over[i] * overAlpha + under[i] * (1 - overAlpha),
  ) as Rgb;
}

interface Palette {
  top: string;
  bottom: string;
}

export function mountEdgeColors(): () => void {
  const root = document.documentElement;
  let mounted = false;
  let palette: Palette | null = null;
  let paletteKey = '';
  let generation = 0;
  let frame = 0;
  let initialMeta: { el: HTMLMetaElement; created: boolean; content: string } | null =
    null;

  function meta() {
    let el = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!el) {
      el = document.createElement('meta');
      el.name = 'theme-color';
      document.head.append(el);
      initialMeta ??= { el, created: true, content: '' };
    } else {
      initialMeta ??= { el, created: false, content: el.content };
    }
    return el;
  }

  function apply(next: Palette) {
    root.style.setProperty(TOP_VAR, next.top);
    root.style.setProperty(BOTTOM_VAR, next.bottom);
    meta().content = next.top;
  }

  async function compute() {
    const theme = themes[getActiveThemeIndex()];
    const bg = document.querySelector<HTMLElement>('[data-theme-bg]');
    const box = bg?.getBoundingClientRect();
    const width = Math.round(box?.width || window.innerWidth);
    const height = Math.round(box?.height || window.innerHeight);
    const band = Math.max(
      MIN_BAND,
      document.querySelector<HTMLElement>('.edge-top')?.offsetHeight ?? 0,
      document.querySelector<HTMLElement>('.edge-bottom')?.offsetHeight ?? 0,
    );

    const key = [getActiveThemeIndex(), width, height, band].join('|');
    if (key === paletteKey && palette) {
      apply(palette);
      return;
    }

    const token = ++generation;
    const styles = getComputedStyle(root);
    const base = parseColor(styles.getPropertyValue('--color-base').trim());
    let next: Palette = { top: toHex(base), bottom: toHex(base) };

    if (theme.image) {
      const img = await loadImage(theme.image);
      if (token !== generation) return; // a newer change superseded this one
      if (img && img.naturalWidth && width && height) {
        const scrim = Number(styles.getPropertyValue('--scrim-opacity')) || 0;
        const position = parsePosition(themePosition(theme));
        const box = { width, height };
        const top = sampleEdge(img, box, position, band, 'top');
        const bottom = sampleEdge(img, box, position, band, 'bottom');
        if (top && bottom) {
          // The scrim is --color-base at `scrim` opacity over the image.
          next = {
            top: toHex(mix(top, base, scrim)),
            bottom: toHex(mix(bottom, base, scrim)),
          };
        }
      }
    }

    palette = next;
    paletteKey = key;
    apply(next);
  }

  function schedule() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      void compute();
    });
  }

  // Page swaps rebuild <html>'s attributes and <head>, dropping our styles.
  function reapply() {
    initialMeta = null; // the swapped-in <head> brought its own meta element
    if (palette) apply(palette);
    schedule();
  }

  const onPageShow = (event: PageTransitionEvent) => {
    if (event.persisted && !mounted) mount();
    else schedule();
  };
  const onPageHide = (event: PageTransitionEvent) => {
    if (!event.persisted) teardown();
  };
  const vv = window.visualViewport;

  function mount() {
    if (mounted) return;
    mounted = true;
    window.addEventListener('themechange', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('load', schedule);
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    document.addEventListener('astro:after-swap', reapply);
    document.addEventListener('astro:page-load', schedule);
    schedule();
  }

  function teardown() {
    if (!mounted) return;
    mounted = false;
    generation++;
    cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener('themechange', schedule);
    window.removeEventListener('resize', schedule);
    window.removeEventListener('orientationchange', schedule);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('load', schedule);
    vv?.removeEventListener('resize', schedule);
    vv?.removeEventListener('scroll', schedule);
    document.removeEventListener('astro:after-swap', reapply);
    document.removeEventListener('astro:page-load', schedule);

    root.style.removeProperty(TOP_VAR);
    root.style.removeProperty(BOTTOM_VAR);
    if (initialMeta) {
      if (initialMeta.created) initialMeta.el.remove();
      else initialMeta.el.content = initialMeta.content;
      initialMeta = null;
    }
    palette = null;
    paletteKey = '';
  }

  window.addEventListener('pageshow', onPageShow);
  window.addEventListener('pagehide', onPageHide);
  mount();

  return () => {
    teardown();
    window.removeEventListener('pageshow', onPageShow);
    window.removeEventListener('pagehide', onPageHide);
  };
}
