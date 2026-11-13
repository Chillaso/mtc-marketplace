// Genera public/img/logo-verde.png: el logo sin fondo blanco y en verde corporativo oscuro (#0a4a4d).
// Uso: node scripts/logo-verde.mjs
import sharp from 'sharp';
const src = 'public/img/logo.png';
const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const [R, G, B] = [0x0a, 0x4a, 0x4d];
for (let i = 0; i < data.length; i += 4) {
  const d = Math.max(255 - data[i], 255 - data[i + 1], 255 - data[i + 2]) / 255; // distancia al blanco
  const a = Math.min(1, Math.max(0, (d - 0.06) * 1.9));
  data[i] = R; data[i + 1] = G; data[i + 2] = B; data[i + 3] = Math.round(a * 255);
}
await sharp(data, { raw: info }).png().toFile('public/img/logo-verde.png');
console.log('ok logo-verde.png');
