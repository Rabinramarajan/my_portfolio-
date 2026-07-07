#!/bin/bash
# Download and prepare self-hosted fonts (Inter + JetBrains Mono)
# Using Fontsource for pre-converted WOFF2 subsets (latin only)
# See: https://fontsource.org/

FONTS_DIR="public/fonts"
mkdir -p "$FONTS_DIR"

echo "📥 Downloading self-hosted fonts from Fontsource..."

# Inter — prebuilt WOFF2 subsets (latin only)
# Versions: 400, 500, 600, 700 available
echo "Downloading Inter..."
curl -L "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-400-normal.woff2" \
  -o "$FONTS_DIR/Inter-Regular.woff2" \
  && echo "✅ Inter-Regular (400)" || echo "❌ Failed"

curl -L "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-500-normal.woff2" \
  -o "$FONTS_DIR/Inter-Medium.woff2" \
  && echo "✅ Inter-Medium (500)" || echo "❌ Failed"

curl -L "https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files/inter-latin-600-normal.woff2" \
  -o "$FONTS_DIR/Inter-Semibold.woff2" \
  && echo "✅ Inter-Semibold (600)" || echo "❌ Failed"

# JetBrains Mono — prebuilt WOFF2 subsets (latin only)
echo "Downloading JetBrains Mono..."
curl -L "https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.16/files/jetbrains-mono-latin-400-normal.woff2" \
  -o "$FONTS_DIR/JetBrains-Mono-Regular.woff2" \
  && echo "✅ JetBrains-Mono-Regular (400)" || echo "❌ Failed"

echo ""
echo "📊 Font sizes:"
ls -lh "$FONTS_DIR"/*.woff2 2>/dev/null | awk '{print $5 "\t" $9}'

TOTAL=$(du -sh "$FONTS_DIR" 2>/dev/null | cut -f1)
echo ""
echo "✨ Font self-hosting complete!"
echo "   Total size: $TOTAL (all fonts self-hosted, no external CDN)"
