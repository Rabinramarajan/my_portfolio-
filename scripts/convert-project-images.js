const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '..', 'public');

async function convertFile(file) {
  const src = path.join(publicDir, file);
  const out = path.join(publicDir, path.basename(file, path.extname(file)) + '.webp');

  if (!fs.existsSync(src)) {
    console.warn('Missing source:', src);
    return;
  }

  try {
    await sharp(src).webp({ quality: 80 }).toFile(out);
    console.log('Converted', src, '->', out);
  } catch (err) {
    console.error('Error converting', src, err);
  }
}

async function run() {
  const files = fs.readdirSync(publicDir).filter(f => f.startsWith('proj-') && f.endsWith('.png'));
  for (const f of files) {
    await convertFile(f);
  }
}

run();
