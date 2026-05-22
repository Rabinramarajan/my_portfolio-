const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convert(file) {
  const src = path.resolve(__dirname, '..', 'public', file);
  const out = path.resolve(__dirname, '..', 'public', path.basename(file, path.extname(file)) + '.webp');

  if (!fs.existsSync(src)) {
    console.error('Source not found:', src);
    return;
  }

  try {
    await sharp(src)
      .webp({ quality: 80 })
      .toFile(out);
    console.log('Converted', src, '->', out);
  } catch (err) {
    console.error('Error converting', src, err);
  }
}

(async () => {
  await convert('profile.png');
})();
