// Recorta imágenes de la presentación (Maria_te_Cuida.pptx) para usarlas en la demo.
// Uso: node scripts/crop-assets.mjs <carpeta ppt/media extraída>
import sharp from 'sharp';
import path from 'node:path';
const media = process.argv[2];
const out = path.resolve('public/img');
const jobs = [
  ['image1.png', { left: 75, top: 18, width: 290, height: 102 }, 'logo.png'],
  ['image1.png', { left: 650, top: 215, width: 549, height: 640 }, 'hero.jpg'],
  ['image2.png', { left: 12, top: 355, width: 440, height: 690 }, 'registro.jpg'],
  ['image10.png', { left: 760, top: 98, width: 457, height: 222 }, 'manos.jpg'],
  ['image12.png', { left: 62, top: 334, width: 160, height: 156 }, 'carmen.jpg'],
  ['image12.png', { left: 62, top: 536, width: 160, height: 156 }, 'laura.jpg'],
  ['image12.png', { left: 62, top: 738, width: 160, height: 156 }, 'ana-s.jpg'],
];
for (const [src, box, dst] of jobs) {
  let img = sharp(path.join(media, src)).extract(box);
  img = dst.endsWith('.png') ? img.png() : img.jpeg({ quality: 86 });
  await img.toFile(path.join(out, dst));
  console.log('ok', dst);
}
