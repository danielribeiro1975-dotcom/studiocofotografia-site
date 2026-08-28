const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_ROOT = 'C:\\Users\\danie\\Downloads\\_fotos_extraidas\\fotos studio eco';
const OUT_ROOT = 'C:\\Users\\danie\\Downloads\\aq-studio-familia-site\\images\\portfolio';

const ALBUMS = {
  'acompanhamentos': 'acompanhamentos',
  'aniversários': 'aniversarios',
  'ensaios kids': 'ensaio-kids',
  'ensaios tematicos': 'ensaio-tematico',
  'familia': 'familia',
  'gestantes': 'gestantes',
  'nascimentos': 'nascimentos',
  'newborn': 'newborn',
  'smash the cake': 'smash-the-cake'
};

const MAX_DIM = 1900;
const QUALITY = 78;

async function run() {
  const manifest = {};

  for (const [srcDir, slug] of Object.entries(ALBUMS)) {
    const srcPath = path.join(SRC_ROOT, srcDir);
    const outPath = path.join(OUT_ROOT, slug);
    fs.mkdirSync(outPath, { recursive: true });

    const files = fs.readdirSync(srcPath).filter(f => /\.(jpe?g|png)$/i.test(f));
    files.sort();

    manifest[slug] = [];
    let i = 1;
    for (const file of files) {
      const inFile = path.join(srcPath, file);
      const outName = `${slug}-${String(i).padStart(3, '0')}.webp`;
      const outFile = path.join(outPath, outName);
      try {
        const img = sharp(inFile).rotate();
        const meta = await img.metadata();
        let width = meta.width, height = meta.height;
        if (width > height && width > MAX_DIM) {
          height = Math.round(height * (MAX_DIM / width));
          width = MAX_DIM;
        } else if (height >= width && height > MAX_DIM) {
          width = Math.round(width * (MAX_DIM / height));
          height = MAX_DIM;
        }
        await img.resize(width, height).webp({ quality: QUALITY }).toFile(outFile);
        manifest[slug].push({ file: `images/portfolio/${slug}/${outName}`, width, height });
        i++;
      } catch (err) {
        console.error('ERRO', inFile, err.message);
      }
    }
    console.log(slug, '->', manifest[slug].length, 'fotos');
  }

  fs.writeFileSync(
    path.join(__dirname, 'photo-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  console.log('Manifest salvo.');
}

run();
