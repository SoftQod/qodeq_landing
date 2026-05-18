/**
 * Меняет дефолтный чёрный (0,0,0) в .splinecode на rgb(13,13,13).
 * Запуск: node scripts/patch-spline-scene-bg.js
 */
const fs = require('fs');
const path = require('path');

const RGBA_BLACK = Buffer.from([0xa1, 0x72, 0xa1, 0x67, 0xa1, 0x62, 0xa1, 0x61, 0x00, 0x00, 0x00, 0x01]);
const RGBA_QODEQ = Buffer.from([0xa1, 0x72, 0xa1, 0x67, 0xa1, 0x62, 0xa1, 0x61, 0x0d, 0x0d, 0x0d, 0x01]);

const targets = [
  path.join(__dirname, '../public/scene.splinecode'),
  path.join(__dirname, '../src/scene.splinecode')
];

for (const file of targets) {
  if (!fs.existsSync(file)) {
    continue;
  }
  const buf = fs.readFileSync(file);
  const idx = buf.indexOf(RGBA_BLACK);
  if (idx === -1) {
    console.warn(`[skip] ${file}: default rgba black not found`);
    continue;
  }
  RGBA_QODEQ.copy(buf, idx);
  fs.writeFileSync(file, buf);
  console.log(`[ok] ${file} patched at offset ${idx}`);
}
