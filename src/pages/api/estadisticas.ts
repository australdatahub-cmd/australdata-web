export const prerender = false;

import { env } from 'cloudflare:workers';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

// Uso interno (n8n): devuelve los totales por registro.
// Requiere el encabezado "x-api-key" con el valor del secreto STATS_KEY.
//   /api/estadisticas          -> totales por registro
//   /api/estadisticas?pais=1   -> totales por registro y país
export async function GET({ request }: { request: Request }) {
  const clave = (env as any).STATS_KEY;
  if (!clave || request.headers.get('x-api-key') !== clave) {
    return json({ error: 'No autorizado' }, 401);
  }

  const db = (env as any).DB;
  if (!db) return json({ error: 'Base de datos no configurada' }, 500);

  const porPais = new URL(request.url).searchParams.get('pais') === '1';

  const sql = porPais
    ? `SELECT id, pais, SUM(vistas) AS vistas, SUM(descargas) AS descargas
       FROM conteos GROUP BY id, pais ORDER BY id, pais`
    : `SELECT id, SUM(vistas) AS vistas, SUM(descargas) AS descargas,
              MIN(dia) AS desde, MAX(dia) AS hasta
       FROM conteos GROUP BY id ORDER BY id`;

  try {
    const { results } = await db.prepare(sql).all();
    return json(results);
  } catch (error: any) {
    console.error('Error en estadisticas:', error?.message);
    return json({ error: 'Error al leer las estadísticas' }, 500);
  }
}
