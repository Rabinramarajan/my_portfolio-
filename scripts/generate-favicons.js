#!/usr/bin/env node
/**
 * Generate favicons from SVG monogram using sharp.
 * Run: npm run favicon:generate
 */

const sharp = require('sharp');
const path = require('path');

const svgPath = path.join(__dirname, '../public/brand/monogram.svg');
const outputDir = path.join(__dirname, '../public');

const specs = [
  { size: 16, output: 'favicon-16x16.png' },
  { size: 32, output: 'favicon-32x32.png' },
  { size: 180, output: 'apple-touch-icon.png' },
  { size: 512, output: 'favicon-512x512.png' },
];

async function generateFavicons() {
  console.log('⏳ Rendering SVG favicons...\n');

  try {
    for (const spec of specs) {
      const outputPath = path.join(outputDir, spec.output);

      await sharp(svgPath)
        .resize(spec.size, spec.size, { fit: 'fill' })
        .png()
        .toFile(outputPath);

      console.log(`✓ ${spec.output} (${spec.size}x${spec.size})`);
    }

    // Create favicon.ico from 32x32 (browsers handle PNG as ICO)
    console.log('\n⏳ Creating favicon.ico...');

    const icoPath = path.join(outputDir, 'favicon.ico');
    await sharp(svgPath)
      .resize(32, 32, { fit: 'fill' })
      .png()
      .toFile(icoPath);

    console.log('✓ favicon.ico (32x32)');

    console.log('\n✅ Favicon generation complete!\n');
    console.log('Generated files:');
    console.log('  • public/favicon.ico');
    console.log('  • public/favicon-16x16.png');
    console.log('  • public/favicon-32x32.png');
    console.log('  • public/apple-touch-icon.png (180x180)');
    console.log('  • public/favicon-512x512.png');

  } catch (error) {
    console.error('❌ Error generating favicons:', error.message);
    process.exit(1);
  }
}

generateFavicons();
