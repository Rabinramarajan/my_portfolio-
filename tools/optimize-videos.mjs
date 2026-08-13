/**
 * Re-encodes the showcase videos in `public/media/videos` so the site stops
 * shipping ~2.6MB H.264 clips for 10-second decorative/concept pieces.
 *
 * Each source is 1280×720 @ 24fps with no audio track. This script:
 *   1. Re-encodes it in place as a smaller H.264 MP4 (CRF 31, faststart).
 *   2. Generates a VP9 WebM sibling, which the `clip()` helper serves first.
 *
 * Output is idempotent: a `.webm` newer than its source `.mp4` means the pair
 * was already processed, so both are skipped. Re-encoding the MP4 always keeps
 * `-movflags +faststart` intact, which browsers need to start playback before
 * the whole file arrives.
 *
 *   node tools/optimize-videos.mjs [--force]
 */
import { readdirSync, renameSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

import ffmpegPath from 'ffmpeg-static';

const VIDEOS = fileURLToPath(new URL('../public/media/videos/', import.meta.url));
const force = process.argv.includes('--force');

if (!ffmpegPath) {
  console.error('ffmpeg-static did not provide a binary. Run `npm install` again.');
  process.exit(1);
}

const MP4_ARGS = [
  '-c:v', 'libx264',
  '-crf', '31',
  '-preset', 'slow',
  '-vf', 'scale=1280:-2',
  '-pix_fmt', 'yuv420p',
  '-an',
  '-movflags', '+faststart',
];

const WEBM_ARGS = [
  '-c:v', 'libvpx-vp9',
  '-crf', '40',
  '-b:v', '0',
  '-vf', 'scale=1280:-2',
  '-an',
  '-deadline', 'good',
  '-cpu-used', '2',
  '-row-mt', '1',
];

let written = 0;
let skipped = 0;
let savedBytes = 0;

for (const entry of readdirSync(VIDEOS)) {
  if (extname(entry).toLowerCase() !== '.mp4') continue;

  const source = join(VIDEOS, entry);
  const sourceStat = statSync(source);
  const webm = join(VIDEOS, `${entry.slice(0, -4)}.webm`);
  const webmStat = tryStat(webm);

  // A `.webm` newer than its source means this pair was already optimised —
  // the MP4 was re-encoded just before the WebM was produced.
  if (!force && webmStat && webmStat.mtimeMs >= sourceStat.mtimeMs) {
    skipped += 1;
    continue;
  }

  const mp4Tmp = join(VIDEOS, `.${entry}.tmp`);
  const webmTmp = join(VIDEOS, `.${entry.slice(0, -4)}.webm.tmp`);

  run(ffmpegPath, ['-y', '-i', source, ...MP4_ARGS, '-f', 'mp4', mp4Tmp]);
  run(ffmpegPath, ['-y', '-i', source, ...WEBM_ARGS, '-f', 'webm', webmTmp]);

  const mp4Size = statSync(mp4Tmp).size;
  const webmSize = statSync(webmTmp).size;
  renameSync(mp4Tmp, source);
  renameSync(webmTmp, webm);

  written += 1;
  savedBytes += sourceStat.size - mp4Size;
}

console.info(
  `videos: ${written} optimised, ${skipped} up to date` +
    (savedBytes > 0 ? ` — ~${Math.round(savedBytes / 1024)}kB saved across MP4s` : ''),
);

function run(binary, args) {
  try {
    execFileSync(binary, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  } catch (error) {
    if (error.stderr) process.stderr.write(error.stderr);
    throw error;
  }
}

function tryStat(path) {
  try {
    return statSync(path);
  } catch {
    return null;
  }
}