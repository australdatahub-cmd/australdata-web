export const prerender = false;

import { idValido, registrar } from '../../lib/conteo';

// Recibe un aviso silencioso cuando alguien abre la página de un registro.
export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    if (idValido(body?.id)) {
      await registrar(request, body.id, 'vista');
    }
  } catch {
    // Nunca devolvemos error al visitante por un conteo.
  }
  return new Response(null, { status: 204 });
}
