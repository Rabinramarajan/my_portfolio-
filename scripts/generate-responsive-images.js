#!/usr/bin/env node
/**
 * Generate responsive image variants using Sharp
 * Usage: node scripts/generate-responsive-images.js
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '../public');
const PROFILE_PNG = path.join(PUBLIC_DIR, 'profile.png');
const PROFILE_WEBP = path.join(PUBLIC_DIR, 'profile.webp');

// Use WebP source if PNG fails
const PROFILE_SRC = fs.existsSync(PROFILE_WEBP) ? PROFILE_WEBP : PROFILE_PNG;

// Responsive breakpoints
const breakpoints = [480, 768, 1200];

async function generateResponsiveImages() {
  try {
    if (!fs.existsSync(PROFILE_SRC)) {
      console.error(`❌ Source image not found: ${PROFILE_SRC}`);
      process.exit(1);
    }

    console.log(`🖼️  Generating responsive image variants from ${path.basename(PROFILE_SRC)}...\n`);

    for (const width of breakpoints) {
      const webpPath = path.join(PUBLIC_DIR, `profile-${width}w.webp`);

      try {
        await sharp(PROFILE_SRC)
          .resize(width, Math.round(width * 1.33), { fit: 'cover' })
          .webp({ quality: 85 })
          .toFile(webpPath);

        const stats = fs.statSync(webpPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        console.log(`✅ profile-${width}w.webp (${sizeKB} KB)`);
      } catch (err) {
        console.error(`❌ Failed to generate profile-${width}w.webp:`, err.message);
      }
    }

    console.log('\n📊 Generated image sizes:');
    let totalSize = 0;
    for (const width of breakpoints) {
      const webpPath = path.join(PUBLIC_DIR, `profile-${width}w.webp`);
      if (fs.existsSync(webpPath)) {
        const stats = fs.statSync(webpPath);
        const sizeKB = (stats.size / 1024).toFixed(1);
        totalSize += stats.size;
        console.log(`   ${width}w: ${sizeKB} KB`);
      }
    }
    console.log(`   Total: ${(totalSize / 1024).toFixed(1)} KB\n`);

    console.log('✨ Responsive image generation complete!');
    console.log('   Images are ready for srcset in <img> tags');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

generateResponsiveImages();
