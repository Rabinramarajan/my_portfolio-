#!/usr/bin/env node

/**
 * AVIF Image Generator
 * Generates AVIF variants for all PNG/JPG images in public directory
 * AVIF provides 20-30% size reduction compared to WebP
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Recursively find all image files
function findImageFiles(dir, fileList = []) {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        findImageFiles(filePath, fileList);
      } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
        fileList.push(filePath);
      }
    });
  } catch (error) {
    // Silently skip if directory doesn't exist
  }
  return fileList;
}

async function generateAVIFVariants() {
  console.log('🖼️  Starting AVIF generation...\n');

  try {
    // Find all image files to process
    let allFiles = findImageFiles(PUBLIC_DIR);

    let totalSize = 0;
    let avifSize = 0;
    let processedCount = 0;

    for (const file of allFiles) {
      // Skip already processed AVIF files
      if (file.endsWith('.avif')) {
        continue;
      }

      // Skip icon files (favicons are not worth converting to AVIF)
      if (file.includes('favicon') || file.includes('android-chrome') || file.includes('apple-touch')) {
        console.log(`⏭️  Skipped: ${path.basename(file)} (favicon/icon)`);
        continue;
      }

      const ext = path.extname(file);
      const base = file.slice(0, -ext.length);
      const avifPath = `${base}.avif`;

      // Check if AVIF already exists
      if (fs.existsSync(avifPath)) {
        const avifStat = fs.statSync(avifPath);
        console.log(`✓ Already exists: ${path.basename(avifPath)} (${formatBytes(avifStat.size)})`);
        continue;
      }

      try {
        // Get original file size
        const originalStat = fs.statSync(file);
        totalSize += originalStat.size;

        // Generate AVIF with optimal settings
        // quality: 75-80 provides good balance between size and quality
        // effort: 4 is a good balance (1-9, higher = smaller but slower)
        await sharp(file)
          .avif({ quality: 75, effort: 4 })
          .toFile(avifPath);

        const avifStat = fs.statSync(avifPath);
        avifSize += avifStat.size;
        const savings = ((1 - avifStat.size / originalStat.size) * 100).toFixed(1);

        console.log(
          `✓ Generated: ${path.basename(avifPath)} ` +
          `(${formatBytes(originalStat.size)} → ${formatBytes(avifStat.size)}, ↓${savings}%)`
        );

        processedCount++;
      } catch (error) {
        console.error(`✗ Error processing ${file}: ${error.message}`);
      }
    }

    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 AVIF Generation Summary');
    console.log(`${'='.repeat(60)}`);
    console.log(`✓ Files processed: ${processedCount}`);
    console.log(`  Original total: ${formatBytes(totalSize)}`);
    console.log(`  AVIF total:     ${formatBytes(avifSize)}`);
    const totalSavings = totalSize > 0 ? ((1 - avifSize / totalSize) * 100).toFixed(1) : 0;
    console.log(`  💾 Total savings: ${totalSavings}% (${formatBytes(totalSize - avifSize)})\n`);

    if (processedCount > 0) {
      console.log('✅ AVIF generation complete!');
      console.log('   Images are ready to be served with srcset fallbacks.\n');
    } else {
      console.log('ℹ️  No new images to process.\n');
    }
  } catch (error) {
    console.error('❌ AVIF generation failed:', error);
    process.exit(1);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// Run with optional --force flag to regenerate all AVIF files
if (process.argv.includes('--force')) {
  console.log('🔄 Force regenerating all AVIF files...\n');
  const avifFiles = findImageFiles(PUBLIC_DIR).filter(f => f.endsWith('.avif'));

  for (const file of avifFiles) {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️  Deleted: ${path.basename(file)}`);
    } catch (error) {
      console.error(`Error deleting ${file}: ${error.message}`);
    }
  }
  console.log('');
}

generateAVIFVariants();
