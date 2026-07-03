// Mounts any of the four @paper-design/shaders backgrounds (see
// src/components/*Background.astro for the original, single-image versions
// these were extracted from) onto an element, given an arbitrary image path.
// Used by ThemeBackground.astro so the shader + image pair can be swapped at
// runtime from theme.config.ts instead of being fixed per-component.
import {
  ShaderMount,
  halftoneDotsFragmentShader,
  halftoneCmykFragmentShader,
  waterFragmentShader,
  paperTextureFragmentShader,
  HalftoneDotsGrids,
  HalftoneDotsTypes,
  HalftoneCmykTypes,
  ShaderFitOptions,
  getShaderColorFromString,
  getShaderNoiseTexture,
} from '@paper-design/shaders';
import type { BackgroundComponent } from '../theme.config';

function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = src;
  return waitForImage(img);
}

function waitForImage(img: HTMLImageElement): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    if (img.complete) resolve(img);
    else img.onload = () => resolve(img);
  });
}

async function mountHalftone(el: HTMLElement, imageSrc: string) {
  const source = await loadImage(imageSrc);
  return new ShaderMount(
    el,
    halftoneDotsFragmentShader,
    {
      u_image: source,
      u_colorBack: getShaderColorFromString('#16140f00'), // fully transparent — page bg shows through
      u_colorFront: getShaderColorFromString('#ab9cf714'), // accent, very low alpha
      u_size: 0.18,
      u_radius: 1,
      u_contrast: 0.9,
      u_originalColors: false,
      u_inverted: false,
      u_grid: HalftoneDotsGrids.square,
      u_type: HalftoneDotsTypes.classic,
      u_grainMixer: 0,
      u_grainOverlay: 0,
      u_grainSize: 0.5,
      u_fit: ShaderFitOptions.cover,
      u_scale: 1,
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    0, // static — this shader has no time-based animation anyway
  );
}

async function mountWater(el: HTMLElement, imageSrc: string) {
  const source = await loadImage(imageSrc);
  return new ShaderMount(
    el,
    waterFragmentShader,
    {
      u_image: source,
      u_colorBack: getShaderColorFromString('#16140f00'), // transparent — page bg shows through at the edges
      u_colorHighlight: getShaderColorFromString('#ffffffff'),
      u_highlights: 0.07,
      u_layering: 0.5,
      u_edges: 0,
      u_caustic: 0.1,
      u_waves: 0.3,
      u_size: 1,
      u_fit: ShaderFitOptions.cover,
      u_scale: 1,
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    1, // animated — this is the one shader that actually moves
  );
}

async function mountPaperTexture(el: HTMLElement, imageSrc: string) {
  const noise = getShaderNoiseTexture();
  if (!noise) throw new Error('Paper texture: no noise texture available');
  const [source] = await Promise.all([loadImage(imageSrc), waitForImage(noise)]);
  return new ShaderMount(
    el,
    paperTextureFragmentShader,
    {
      u_image: source,
      u_noiseTexture: noise,
      u_colorBack: getShaderColorFromString('#16140f'), // dark theme base, not paper white
      u_colorFront: getShaderColorFromString('#6c685c'), // theme's muted/faint tone
      u_contrast: 0.3,
      u_roughness: 0.4,
      u_fiber: 0.3,
      u_fiberSize: 0.2,
      u_crumples: 0.3,
      u_crumpleSize: 0.35,
      // Folds are computed in the shader's own pattern space, which is tied to raw
      // viewport resolution — the crease lines land at very different relative spots
      // depending on aspect ratio, so they can't scale smoothly on resize. Disabled.
      u_folds: 0,
      u_foldCount: 5,
      u_drops: 0.2,
      u_fade: 0,
      u_seed: 5.8,
      u_fit: ShaderFitOptions.cover,
      u_scale: 1, // fills the frame completely — no paper margin to shift on resize
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    0, // static texture, no time uniform in this shader
  );
}

async function mountHalftoneCmyk(el: HTMLElement, imageSrc: string) {
  const noise = getShaderNoiseTexture();
  if (!noise) throw new Error('Halftone CMYK: no noise texture available');
  const [source] = await Promise.all([loadImage(imageSrc), waitForImage(noise)]);
  return new ShaderMount(
    el,
    halftoneCmykFragmentShader,
    {
      u_image: source,
      u_noiseTexture: noise,
      u_colorBack: getShaderColorFromString('#fbfaf4'),
      u_colorC: getShaderColorFromString('#00b3ff'),
      u_colorM: getShaderColorFromString('#fc4f9d'),
      u_colorY: getShaderColorFromString('#ffd900'),
      u_colorK: getShaderColorFromString('#231f20'),
      u_size: 0.2,
      u_gridNoise: 0.2,
      u_type: HalftoneCmykTypes.ink,
      u_softness: 1,
      u_contrast: 1,
      u_floodC: 0.15,
      u_floodM: 0,
      u_floodY: 0,
      u_floodK: 0,
      u_gainC: 0.3,
      u_gainM: 0,
      u_gainY: 0.2,
      u_gainK: 0,
      u_grainMixer: 0,
      u_grainOverlay: 0,
      u_grainSize: 0.5,
      u_fit: ShaderFitOptions.cover,
      u_scale: 1,
      u_rotation: 0,
      u_originX: 0.5,
      u_originY: 0.5,
      u_offsetX: 0,
      u_offsetY: 0,
      u_worldWidth: 0,
      u_worldHeight: 0,
    },
    undefined,
    0, // no animation uniform in this shader
  );
}

const mounters: Record<
  BackgroundComponent,
  (el: HTMLElement, imageSrc: string) => Promise<ShaderMount>
> = {
  halftone: mountHalftone,
  water: mountWater,
  'paper-texture': mountPaperTexture,
  'halftone-cmyk': mountHalftoneCmyk,
};

export function mountThemeBackground(
  el: HTMLElement,
  component: BackgroundComponent,
  imageSrc: string,
) {
  return mounters[component](el, imageSrc);
}
