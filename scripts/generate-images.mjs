/**
 * Generates responsive WebP variants for the working-photo set.
 *
 * Source JPEGs live in src/assets/images/my_working_img/ and are never shipped.
 * Output goes to src/assets/images/working/<name>-<width>.webp plus a
 * <name>.jpg fallback at the largest width.
 *
 * Run: node scripts/generate-images.mjs
 */
import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(root, 'src/assets/images/my_working_img');
const OUT = join(root, 'src/assets/images/working');
const MANIFEST_TS = join(root, 'src/app/core/constants/working-images.ts');

const WIDTHS = [640, 1280, 1920];

// The sources are phone photos that have already been through one lossy pass, so
// they arrive soft. Re-encoding them cheaply stacks a second generation of
// artefacts on top; these values buy the headroom back for a modest size cost.
const QUALITY = { webp: 88, jpeg: 86 };

// Per-image WebP overrides.
//
// hero-golden-hour is the LCP element: it fills the viewport, so it is the last
// thing to paint and it sets the metric. It is also an ambient backdrop that
// renders darkened far below text contrast and under a gradient mask, so the
// detail the default quality preserves is never visible. Encoding it harder
// takes it from ~95KB to ~35KB, which is the difference between the hero
// painting mid-load and painting early on a phone connection.
const QUALITY_OVERRIDES = { 'hero-golden-hour': 55 };

/**
 * Resize with a sharper kernel than the default, then restore the micro-contrast
 * that any downscale removes. Sharpening is skipped when no resize happens —
 * there is no resampling softness to correct, and it would only crunch the
 * source's existing artefacts.
 */
function encode(input, width, meta) {
  const pipeline = sharp(input).resize({
    width,
    withoutEnlargement: true,
    kernel: 'lanczos3',
  });

  return width < meta.width ? pipeline.sharpen({ sigma: 0.6, m1: 0.5, m2: 2 }) : pipeline;
}

/** Maps source basename -> semantic output name used by the templates. */
const MAP = {
  'WhatsApp Image 2026-07-15 at 12.58.20 AM.jpeg': 'hero-golden-hour',
  'WhatsApp Image 2026-07-15 at 12.58.22 AM.jpeg': 'about-coffee-shop',
  'WhatsApp Image 2026-07-15 at 12.58.23 AM (3).jpeg': 'about-portrait',
  'WhatsApp Image 2026-07-15 at 12.58.22 AM (1).jpeg': 'services-whiteboard',
  'WhatsApp Image 2026-07-15 at 12.58.21 AM.jpeg': 'experience-collaboration',
  'WhatsApp Image 2026-07-15 at 12.58.22 AM (2).jpeg': 'skills-keyboard',
  'WhatsApp Image 2026-07-15 at 12.58.23 AM (1).jpeg': 'projects-flatlay',
  'WhatsApp Image 2026-07-15 at 12.58.21 AM (2).jpeg': 'divider-night-desk',
  'WhatsApp Image 2026-07-15 at 12.58.21 AM (3).jpeg': 'contact-portrait',
  'WhatsApp Image 2026-07-15 at 12.58.23 AM (2).jpeg': 'about-monitors',
};

// Deliberately not generated — every entry above is referenced by a template,
// and unreferenced variants would ship as dead bytes. Add a source here only
// alongside the template that uses it:
//   12.58.24        night desk, wide      — screen shows a "FID PORTAL" dashboard
//                                           with invented stats; next to the real
//                                           Fiji Immigration case study it would
//                                           read as a genuine product screenshot
//   12.58.21 (1)    multi-device testing  — mock WorkPermit UI on screen
//   12.58.23        Storybook / npm       — mock @rabin/ui package
//   12.58.22 (3)    bright office         — mock dashboard on screen
//   12.58.20 (1)    split-screen graphic  — has baked-in text, fights our type
//   12.58.20 (2)    isometric 3D desk     — illustrated, clashes with photos

async function main() {
  await mkdir(OUT, { recursive: true });
  const present = new Set(await readdir(SRC));

  const missing = Object.keys(MAP).filter((f) => !present.has(f));
  if (missing.length) {
    console.error('Missing source files:\n  ' + missing.join('\n  '));
    process.exitCode = 1;
    return;
  }

  const manifest = {};

  for (const [file, name] of Object.entries(MAP)) {
    const input = join(SRC, file);
    const meta = await sharp(input).metadata();

    // Only widths the source can actually fill, plus the native width so large
    // viewports still get WebP instead of falling back to the JPEG.
    const widths = WIDTHS.filter((w) => w < meta.width);
    if (!widths.includes(meta.width)) widths.push(meta.width);

    const webpQuality = QUALITY_OVERRIDES[name] ?? QUALITY.webp;

    for (const w of widths) {
      await encode(input, w, meta)
        .webp({ quality: webpQuality, smartSubsample: true, effort: 6 })
        .toFile(join(OUT, `${name}-${w}.webp`));
    }

    const fallbackWidth = Math.min(1280, meta.width);
    await encode(input, fallbackWidth, meta)
      .jpeg({ quality: QUALITY.jpeg, mozjpeg: true, chromaSubsampling: '4:4:4' })
      .toFile(join(OUT, `${name}.jpg`));

    manifest[name] = {
      widths,
      aspectRatio: +(meta.width / meta.height).toFixed(4),
      intrinsic: { width: meta.width, height: meta.height },
    };

    console.log(`${name.padEnd(26)} ${meta.width}x${meta.height}  ->  ${widths.join(', ')}`);
  }

  await writeFile(MANIFEST_TS, renderManifest(manifest));
  console.log(`\nWrote ${Object.keys(manifest).length} entries to working-images.ts`);
}

/** Emits the manifest as a typed TS constant (tsconfig has no resolveJsonModule). */
function renderManifest(manifest) {
  const entries = Object.entries(manifest)
    .map(([name, m]) => {
      const w = m.widths.join(', ');
      return (
        `  '${name}': {\n` +
        `    widths: [${w}],\n` +
        `    aspectRatio: ${m.aspectRatio},\n` +
        `    intrinsic: { width: ${m.intrinsic.width}, height: ${m.intrinsic.height} },\n` +
        `  },`
      );
    })
    .join('\n');

  return (
    `// GENERATED FILE — do not edit by hand.\n` +
    `// Run \`npm run images\` to regenerate from src/assets/images/my_working_img/.\n\n` +
    `export interface WorkingImageMeta {\n` +
    `  /** Widths that exist on disk as \`<name>-<width>.webp\`. */\n` +
    `  readonly widths: readonly number[];\n` +
    `  readonly aspectRatio: number;\n` +
    `  readonly intrinsic: { readonly width: number; readonly height: number };\n` +
    `}\n\n` +
    `export const WORKING_IMAGES = {\n${entries}\n} as const satisfies Record<string, WorkingImageMeta>;\n\n` +
    `export type WorkingImageName = keyof typeof WORKING_IMAGES;\n`
  );
}

main();
