import type { APIRoute } from 'astro';

// Mapa del sitio para buscadores. Por ahora solo las páginas fijas;
// las páginas de cada registro (/archivo/...) se agregarán más adelante.
const SITIO = 'https://www.australdata.org';
const PAGINAS = ['/', '/biblioteca', '/subir', '/donaciones', '/contacto', '/documentos'];

export const GET: APIRoute = () => {
  const urls = PAGINAS.map((ruta) => `  <url><loc>${SITIO}${ruta}</loc></url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
