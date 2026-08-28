const fs = require('fs');
const path = require('path');

const manifest = require('./photo-manifest.json');

const ALBUMS = [
  { slug: 'familia', label: 'Família', altBase: 'Ensaio de fotografia de família em Curitiba' },
  { slug: 'gestantes', label: 'Gestantes', altBase: 'Ensaio gestante em Curitiba' },
  { slug: 'newborn', label: 'Newborn', altBase: 'Fotografia newborn em Curitiba' },
  { slug: 'nascimentos', label: 'Nascimentos', altBase: 'Fotografia de nascimento em Curitiba' },
  { slug: 'acompanhamentos', label: 'Acompanhamentos', altBase: 'Acompanhamento de bebê em Curitiba' },
  { slug: 'ensaio-kids', label: 'Kids', altBase: 'Ensaio kids em Curitiba' },
  { slug: 'smash-the-cake', label: 'Smash the Cake', altBase: 'Smash the cake em Curitiba' },
  { slug: 'aniversarios', label: 'Aniversários', altBase: 'Fotografia de aniversário infantil em Curitiba' },
  { slug: 'ensaio-tematico', label: 'Ensaio Temático', altBase: 'Ensaio temático infantil em Curitiba' }
];

let filterBtns = '<button class="filter-btn active" data-filter="todos">Todos</button>\n';
ALBUMS.forEach(a => {
  filterBtns += `      <button class="filter-btn" data-filter="${a.slug}">${a.label}</button>\n`;
});

let items = '';
ALBUMS.forEach(a => {
  const photos = manifest[a.slug] || [];
  photos.forEach((p, i) => {
    const alt = `${a.altBase} — AQ Studio & Co., foto ${i + 1}`;
    items += `      <div class="gallery-item" data-cat="${a.slug}"><img src="${p.file}" alt="${alt}" loading="lazy" width="${p.width}" height="${p.height}"></div>\n`;
  });
});

const totalCount = Object.values(manifest).reduce((sum, arr) => sum + arr.length, 0);

const template = fs.readFileSync(path.join(__dirname, 'portfolio.template.html'), 'utf8');
const out = template
  .replace('{{FILTER_BUTTONS}}', filterBtns.trim())
  .replace('{{GALLERY_ITEMS}}', items.trim())
  .replace('{{TOTAL_COUNT}}', totalCount);

fs.writeFileSync(path.join(__dirname, 'portfolio.html'), out);
console.log('portfolio.html gerado com', totalCount, 'fotos.');
