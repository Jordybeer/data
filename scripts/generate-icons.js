const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const outDir = path.join(__dirname, '../public/icons');
fs.mkdirSync(outDir, { recursive: true });

// Indigo #6366f1 background with white circle — matches app theme
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#6366f1"/>
  <text x="${size / 2}" y="${size * 0.65}" font-family="sans-serif" font-size="${size * 0.45}"
    text-anchor="middle" fill="white">⚗</text>
</svg>`;

async function generate(size) {
  const dest = path.join(outDir, `icon-${size}.png`);
  await sharp(Buffer.from(svg(size))).resize(size, size).png().toFile(dest);
  console.log(`Generated icon-${size}.png`);
}

Promise.all([generate(192), generate(512)]).catch((err) => {
  console.error(err);
  process.exit(1);
});
