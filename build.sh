#!/bin/sh
# src/ altındaki dosyaları tek parça index.html olarak birleştirir.
set -e
cd "$(dirname "$0")/src"
{
  printf '<!doctype html>\n<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  cat head2.html
  echo '<script>'
  cat core.js
  for f in ist kon cap izm ant trb mer ada more; do echo; cat data/data_$f.js; done
  echo; cat info.js; echo; cat tips.js; echo; cat ui2.js
  echo '</script>'
  printf '\n</body></html>\n'
} > ../index.html
echo "index.html hazır"
