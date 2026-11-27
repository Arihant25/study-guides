#!/usr/bin/env bash
# Usage: tools/slide.sh L06 12 [13 ...]   (run from smai/)
# Renders those PDF pages of a lecture to assets/slides/L06/p12.webp (1000px wide, WebP q70) and prints the size.
set -euo pipefail
L=$1; shift
SRC="/g/My Drive/College/4-2/Statistical Methods in AI/2026/Lectures/$L.pdf"
case $L in Quiz1*) SRC="/g/My Drive/College/4-2/Statistical Methods in AI/2026/Quiz 1/$L.pdf";; esac
OUT="assets/slides/$L"; mkdir -p "$OUT"
TMP=$(mktemp -d)
for P in "$@"; do
  pdftoppm -f "$P" -l "$P" -scale-to-x 1000 -scale-to-y -1 -png "$SRC" "$TMP/s" >/dev/null 2>&1
  PNG=$(ls "$TMP"/s*.png | head -1)
  ffmpeg -loglevel error -y -i "$PNG" -c:v libwebp -quality 70 "$OUT/p$(printf %02d "$P").webp"
  rm -f "$TMP"/s*.png
  echo "$OUT/p$(printf %02d "$P").webp $(stat -c%s "$OUT/p$(printf %02d "$P").webp") bytes"
done
rm -rf "$TMP"
