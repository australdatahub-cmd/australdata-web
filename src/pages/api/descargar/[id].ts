export const prerender = false;

import { idValido, registrar } from '../../../lib/conteo';

// El botón "Descargar" pasa por aquí: se suma 1 descarga y se redirige a Drive.
export async function GET({ params, request }: { params: { id?: string }; request: Request }) {
  const id = params.id;

  if (!idValido(id)) {
    return new Response('Registro no encontrado', { status: 404 });
  }

  // Las precargas del navegador no son descargas reales: no se cuentan.
  const proposito = `${request.headers.get('sec-purpose') ?? ''} ${request.headers.get('purpose') ?? ''}`.toLowerCase();
  const esPrecarga = proposito.includes('prefetch') || proposito.includes('prerender');

  if (!esPrecarga) {
    await registrar(request, id, 'descarga');
  }

  return Response.redirect(`https://drive.google.com/uc?export=download&id=${id}`, 302);
}
