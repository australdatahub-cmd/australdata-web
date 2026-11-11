import { env } from 'cloudflare:workers';
import catalog from '../data/catalog.json';

// Solo se cuentan registros que existen en el catálogo (evita basura en la base).
const IDS = new Set(
  (catalog as Array<{ id?: string }>).map((i) => i?.id).filter(Boolean) as string[]
);

// Robots y rastreadores conocidos: no se cuentan.
const ROBOTS = /bot|crawl|spider|slurp|preview|headless|monitor|curl|wget|python|node-fetch|facebookexternalhit/i;

export function idValido(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{10,120}$/.test(id) && IDS.has(id);
}

// Suma 1 a la vista o a la descarga de un registro, por día y país.
// Nunca lanza error: si algo falla, la página o la descarga siguen funcionando.
export async function registrar(request: Request, id: string, tipo: 'vista' | 'descarga') {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (!ua || ROBOTS.test(ua)) return;

    const db = (env as any).DB;
    if (!db) return;

    const pais = (request.headers.get('cf-ipcountry') || 'XX').toUpperCase().slice(0, 2);
    const dia = new Date().toISOString().slice(0, 10); // fecha UTC (AAAA-MM-DD)
    const columna = tipo === 'vista' ? 'vistas' : 'descargas';

    await db
      .prepare(
        `INSERT INTO conteos (id, dia, pais, vistas, descargas)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id, dia, pais) DO UPDATE SET ${columna} = ${columna} + 1`
      )
      .bind(id, dia, pais, tipo === 'vista' ? 1 : 0, tipo === 'descarga' ? 1 : 0)
      .run();
  } catch (error: any) {
    console.error('Error al registrar conteo:', error?.message);
  }
}
