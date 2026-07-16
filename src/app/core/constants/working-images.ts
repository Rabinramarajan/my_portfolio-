// GENERATED FILE — do not edit by hand.
// Run `npm run images` to regenerate from src/assets/images/my_working_img/.

export interface WorkingImageMeta {
  /** Widths that exist on disk as `<name>-<width>.webp`. */
  readonly widths: readonly number[];
  readonly aspectRatio: number;
  readonly intrinsic: { readonly width: number; readonly height: number };
}

export const WORKING_IMAGES = {
  'hero-golden-hour': {
    widths: [640, 1280, 1600],
    aspectRatio: 1.7778,
    intrinsic: { width: 1600, height: 900 },
  },
  'about-coffee-shop': {
    widths: [640, 1280, 1600],
    aspectRatio: 1.7778,
    intrinsic: { width: 1600, height: 900 },
  },
  'about-portrait': {
    widths: [640, 1122],
    aspectRatio: 0.8003,
    intrinsic: { width: 1122, height: 1402 },
  },
  'services-whiteboard': {
    widths: [640, 1280, 1536],
    aspectRatio: 1.5,
    intrinsic: { width: 1536, height: 1024 },
  },
  'experience-collaboration': {
    widths: [640, 1280, 1536],
    aspectRatio: 1.5,
    intrinsic: { width: 1536, height: 1024 },
  },
  'skills-keyboard': {
    widths: [640, 1280, 1536],
    aspectRatio: 1.5,
    intrinsic: { width: 1536, height: 1024 },
  },
  'projects-flatlay': {
    widths: [640, 1280, 1600],
    aspectRatio: 1.7778,
    intrinsic: { width: 1600, height: 900 },
  },
  'divider-night-desk': {
    widths: [640, 1280, 1600],
    aspectRatio: 2.3358,
    intrinsic: { width: 1600, height: 685 },
  },
  'contact-portrait': {
    widths: [640, 1122],
    aspectRatio: 0.8003,
    intrinsic: { width: 1122, height: 1402 },
  },
  'about-monitors': {
    widths: [640, 1280, 1600],
    aspectRatio: 1.7778,
    intrinsic: { width: 1600, height: 900 },
  },
} as const satisfies Record<string, WorkingImageMeta>;

export type WorkingImageName = keyof typeof WORKING_IMAGES;
