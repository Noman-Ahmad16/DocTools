const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://doctools.app'; // Replace with real domain

const routes = [
  '/', '/blog', '/about', '/admin',
  '/scanner/image-to-pdf', '/pdf/merge', '/pdf/split', '/pdf/compress',
  '/pdf/lock', '/pdf/unlock', '/pdf/create', '/pdf/edit',
  '/pdf/to-image', '/pdf/to-word', '/pdf/to-ppt', '/pdf/to-excel',
  '/image/compress', '/image/convert', '/image/resize', '/image/ocr',
  '/word/create', '/word/edit', '/word/compress', '/word/to-ppt', '/word/to-excel',
  '/excel/create', '/excel/edit', '/excel/compress', '/excel/to-word',
  '/ppt/create', '/ppt/edit', '/ppt/templates', '/ppt/compress', '/ppt/to-word', '/ppt/to-image',
  '/scan/camera', '/scan/gallery', '/scan/enhance', '/scan/ocr'
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${routes.map(route => `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully!');
