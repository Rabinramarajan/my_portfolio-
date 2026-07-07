#!/bin/bash
# Optimize profile image to responsive srcset + AVIF
# Requires: ImageMagick or ffmpeg installed
# Usage: bash scripts/optimize-profile-image.sh

SOURCE="public/profile.png"
OUTPUT_DIR="public"

if [ ! -f "$SOURCE" ]; then
  echo "❌ Source image not found: $SOURCE"
  exit 1
fi

echo "🖼️  Optimizing profile image..."

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick not found. Install with:"
  echo "   macOS: brew install imagemagick"
  echo "   Ubuntu: sudo apt install imagemagick"
  echo "   Windows: https://imagemagick.org/script/download.php#windows"
  exit 1
fi

# Generate WebP at multiple sizes
echo "Creating WebP variants..."
for size in 480 768 1200; do
  convert "$SOURCE" -resize "${size}x!" -quality 85 "$OUTPUT_DIR/profile-${size}w.webp"
  echo "✅ profile-${size}w.webp"
done

# Generate AVIF at multiple sizes (experimental, optional)
echo "Creating AVIF variants (if supported)..."
for size in 480 768 1200; do
  convert "$SOURCE" -resize "${size}x!" -quality 85 "$OUTPUT_DIR/profile-${size}w.avif" 2>/dev/null && \
    echo "✅ profile-${size}w.avif" || \
    echo "⚠️  Skipping AVIF (requires libheif support)"
done

echo ""
echo "📊 Generated image sizes:"
ls -lh "$OUTPUT_DIR"/profile-*.{webp,avif} 2>/dev/null | awk '{print $5 "\t" $9}'

echo ""
echo "✨ Profile image optimization complete!"
echo "   Use srcset in <img> tag:"
echo '   <img srcset="profile-480w.webp 480w, profile-768w.webp 768w, profile-1200w.webp 1200w"'
echo '        sizes="(max-width: 480px) 100vw, (max-width: 768px) 95vw, 1200px"'
echo '        src="profile.webp" alt="Profile" />'
