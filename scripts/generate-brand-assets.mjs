/**
 * Generates the social share card, PWA icon set and delivery variants of the
 * profile photo.
 *
 * profile.png is a 2MB 943x1667 PNG — a photograph in a lossless format. It was
 * being served as-is to the hero and to 48px avatars alike, and was the single
 * largest resource on the site by a wide margin (larger than every JS bundle
 * combined). It is now treated as a source: it stays out of the build (see the
 * assets `ignore` in angular.json) and only these variants ship.
 *
 * Outputs (all committed — the build does not run this script):
 *   src/assets/images/og-cover.jpg            1200x630 share card
 *   src/assets/images/profile-hero.webp       943w  portrait for hero/about
 *   src/assets/images/profile-hero.jpg        943w  fallback + JSON-LD Person
 *   src/assets/images/profile-avatar.webp     640w  small round avatars
 *   src/assets/images/icons/icon-192.png      any-purpose PWA icon
 *   src/assets/images/icons/icon-512.png      any-purpose PWA icon
 *   src/assets/images/icons/maskable-512.png  padded for Android mask cropping
 *
 * Run: npm run brand
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const PROFILE = join(root, 'src/assets/images/profile.png');
const IMAGES = join(root, 'src/assets/images');
const ICONS = join(IMAGES, 'icons');

// Mirrors the design tokens in src/styles.scss — keep in sync with
// --color-bg-base and the --gradient-brand stops.
const BG = '#08080c';
const BRAND_PURPLE = '#8b5cf6';
const BRAND_BLUE = '#3b82f6';

const OG = { width: 1200, height: 630 };

// Inter is a webfont and is not installed system-wide, so the SVG text below
// resolves through whatever the host has. The stack is ordered to land on a
// geometric sans on any dev machine or CI runner.
const FONT = "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

/**
 * The photo is a 943x1667 portrait; the card gives it the right third. Cropping
 * with `position: top` keeps the face in frame — a centred crop lands on the
 * torso at this aspect ratio.
 */
function photoPanel(width, height) {
  return sharp(PROFILE).resize({ width, height, fit: 'cover', position: 'top' }).png().toBuffer();
}

/**
 * Feathers the photo's left edge into the card background. `dest-in` weighs the
 * photo by this mask's *alpha*, not its luminance — a black-to-white ramp is
 * opaque throughout and leaves a hard seam.
 */
function fadeMask(width, height) {
  const svg = `<svg width="${width}" height="${height}">
    <defs>
      <linearGradient id="f" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/>
        <stop offset="0.45" stop-color="#fff" stop-opacity="1"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#f)"/>
  </svg>`;
  return Buffer.from(svg);
}

function cardText() {
  const svg = `<svg width="${OG.width}" height="${OG.height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${BRAND_PURPLE}"/>
        <stop offset="1" stop-color="${BRAND_BLUE}"/>
      </linearGradient>
      <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stop-color="${BRAND_PURPLE}" stop-opacity="0.20"/>
        <stop offset="1" stop-color="${BRAND_PURPLE}" stop-opacity="0"/>
      </linearGradient>
    </defs>

    <rect width="${OG.width}" height="${OG.height}" fill="${BG}"/>
    <rect width="${OG.width}" height="${OG.height}" fill="url(#glow)"/>
    <rect x="0" y="0" width="${OG.width}" height="6" fill="url(#brand)"/>

    <text x="80" y="250" font-family="${FONT}" font-size="72" font-weight="700" fill="#f8fafc">Rabin R</text>
    <text x="80" y="318" font-family="${FONT}" font-size="34" font-weight="600" fill="url(#brand)">Senior Frontend Angular Developer</text>
    <text x="80" y="392" font-family="${FONT}" font-size="25" font-weight="400" fill="#94a3b8">Enterprise web &amp; mobile apps for government</text>
    <text x="80" y="428" font-family="${FONT}" font-size="25" font-weight="400" fill="#94a3b8">and financial platforms — 10,000+ users.</text>

    <circle cx="88" cy="502" r="5" fill="${BRAND_PURPLE}"/>
    <text x="108" y="510" font-family="${FONT}" font-size="22" font-weight="500" fill="#64748b">www.rabinr.in</text>
  </svg>`;
  return Buffer.from(svg);
}

async function buildOgCover() {
  const panelW = 430;
  const panel = await photoPanel(panelW, OG.height);
  const faded = await sharp(panel)
    .composite([{ input: fadeMask(panelW, OG.height), blend: 'dest-in' }])
    .png()
    .toBuffer();

  // JPEG, not PNG: the card is mostly photograph and smooth gradient, which PNG
  // stores at ~750KB versus ~90KB here. Share-card crawlers fetch this eagerly
  // and some (WhatsApp) skip previews over their own size ceilings. 4:4:4 keeps
  // the small gradient-filled subtitle text from smearing.
  const out = join(IMAGES, 'og-cover.jpg');
  await sharp(cardText())
    .composite([{ input: faded, left: OG.width - panelW, top: 0 }])
    .jpeg({ quality: 90, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(out);

  return out;
}

/**
 * An "R" monogram on the brand gradient.
 *
 * The profile photo is deliberately not used here. It is a wide environmental
 * shot, and a launcher renders these at roughly 48px — at that size the face is
 * a few pixels against busy background bokeh and reads as noise. Icons need one
 * high-contrast shape; the share card above is where the photo does its work.
 *
 * `scale` shrinks the glyph for the maskable variant, whose outer 20% a
 * launcher may crop to a circle or squircle.
 */
function monogram(size, scale = 1) {
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${BRAND_PURPLE}"/>
        <stop offset="1" stop-color="${BRAND_BLUE}"/>
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" fill="url(#brand)"/>
    <text x="50%" y="50%" font-family="${FONT}" font-size="${size * 0.58 * scale}"
          font-weight="700" fill="#ffffff" text-anchor="middle"
          dominant-baseline="central">R</text>
  </svg>`;
  return Buffer.from(svg);
}

async function buildIcons() {
  // `any` icons are shown as-authored, so the glyph fills the square.
  for (const size of [192, 512]) {
    await sharp(monogram(size))
      .png({ compressionLevel: 9 })
      .toFile(join(ICONS, `icon-${size}.png`));
  }

  // `maskable` icons get cropped to a platform-chosen shape. Only the centre
  // 80% is guaranteed visible, so the glyph is inset to that safe zone while
  // the gradient still bleeds to the edge.
  await sharp(monogram(512, 0.8))
    .png({ compressionLevel: 9 })
    .toFile(join(ICONS, 'maskable-512.png'));
}

/**
 * Delivery variants of the portrait.
 *
 * Two sizes rather than one: the hero renders the portrait at hundreds of
 * pixels wide, while the résumé card and blog byline render it at well under
 * 100. Handing the same file to both means the avatars pay for detail they
 * cannot show.
 */
async function buildProfileVariants() {
  const results = [];

  await sharp(PROFILE)
    .webp({ quality: 84, effort: 6 })
    .toFile(join(IMAGES, 'profile-hero.webp'));
  results.push('profile-hero.webp');

  // JPEG twin: <img src> cannot negotiate formats, and the JSON-LD Person image
  // is read by crawlers with no WebP guarantee.
  await sharp(PROFILE)
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(join(IMAGES, 'profile-hero.jpg'));
  results.push('profile-hero.jpg');

  await sharp(PROFILE)
    .resize({ width: 640, withoutEnlargement: true, kernel: 'lanczos3' })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 2 })
    .webp({ quality: 82, effort: 6 })
    .toFile(join(IMAGES, 'profile-avatar.webp'));
  results.push('profile-avatar.webp');

  return results;
}

async function main() {
  await mkdir(ICONS, { recursive: true });

  const og = await buildOgCover();
  const meta = await sharp(og).metadata();
  console.log(`og-cover.jpg            ${meta.width}x${meta.height}`);

  const variants = await buildProfileVariants();
  for (const v of variants) {
    const m = await sharp(join(IMAGES, v)).metadata();
    console.log(`${v.padEnd(24)}${m.width}x${m.height}`);
  }

  await buildIcons();
  console.log('icons/                  192, 512, maskable-512');
}

main();
