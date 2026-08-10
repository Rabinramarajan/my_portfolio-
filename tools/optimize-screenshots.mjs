/**
 * Generates responsive WebP variants beside every project screenshot PNG.
 *
 * The photographs in `public/media/working` already ship WebP at several widths
 * (see the `photo()` helper); the product screenshots never did, so the site
 * served ~7MB of raw PNG. A single card on the home page cost 127kB for an
 * image displayed 414px wide.
 *
 * Output is `<name>-<width>.webp` next to the source, which is the naming the
 * `shot()` helper builds its srcset from. The PNG stays as the `<img src>`
 * fallback, exactly as the JPEG does for photographs.
 *
 * Idempotent: a variant newer than its source is left alone.
 *
 *   node tools/optimize-screenshots.mjs [--force]
 */
import { readdirSync, statSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

/** Folders holding product screenshots. `working` and `og` are excluded: the
 *  first already has WebP, the second is social card art read by scrapers that
 *  do not all speak WebP. */
const FOLDERS = [
  'fiji_external_application',
  'fiji_internal_application',
  'insuremet',
  'prims_member_portal',
  'vnpf_mobile',
];

/** Matches the widths the cards and case-study pages actually request. */
export const SCREENSHOT_WIDTHS = [640, 960, 1366];

const MEDIA = fileURLToPath(new URL('../public/media/', import.meta.url));
const force = process.argv.includes('--force');

let written = 0;
let skipped = 0;
let savedBytes = 0;

for (const folder of FOLDERS) {
  const dir = join(MEDIA, folder);

  for (const entry of readdirSync(dir)) {
    if (extname(entry).toLowerCase() !== '.png') continue;

    const source = join(dir, entry);
    const name = basename(entry, extname(entry));
    const sourceStat = statSync(source);
    const meta = await sharp(source).metadata();

    for (const width of SCREENSHOT_WIDTHS) {
      // Never upscale — a 640px-wide source has no 1366px variant to give, and
      // inventing one would cost bytes for blur.
      if (meta.width && width > meta.width) continue;

      const target = join(dir, `${name}-${width}.webp`);
      const current = tryStat(target);

      if (!force && current && current.mtimeMs >= sourceStat.mtimeMs) {
        skipped += 1;
        continue;
      }

      const { size } = await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 5 })
        .toFile(target);

      written += 1;
      if (width === SCREENSHOT_WIDTHS.at(-1)) savedBytes += sourceStat.size - size;
    }
  }
}

console.info(
  `screenshots: ${written} variant(s) written, ${skipped} up to date` +
    (savedBytes > 0 ? ` — ~${Math.round(savedBytes / 1024)}kB saved at full width` : ''),
);

function tryStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}
