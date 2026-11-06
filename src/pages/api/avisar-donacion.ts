export const prerender = false;

const N8N_WEBHOOK_URL = 'http://20.163.242.252.sslip.io/webhook/77caa719-5908-45a8-b209-1caff3debbff';

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    // Campo trampa anti-spam: si viene lleno, es un robot. Respondemos "ok" sin hacer nada.
    if (body.web) {
      return json({ message: 'ok' });
    }

    // Validación de datos
    const monto = Number(body.monto);
    const fecha = String(body.fecha || '');
    const nombre = String(body.nombre || '').trim().slice(0, 100);
    const email = String(body.email || '').trim().slice(0, 120);
    const mensaje = String(body.mensaje || '').trim().slice(0, 500);

    if (!Number.isInteger(monto) || monto < 1 || monto > 100000000) {
      return json({ error: 'Monto inválido' }, 400);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return json({ error: 'Fecha inválida' }, 400);
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Correo inválido' }, 400);
    }
    if (body.acepta !== true) {
      return json({ error: 'Falta la aceptación' }, 400);
    }

    // Envío a n8n (vía hostname; Cloudflare Workers no permite fetch a IPs directas)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        canal: 'Transferencia',
        monto,
        fecha_transferencia: fecha,
        nombre,
        email,
        mensaje,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('n8n devolvió estado', response.status);
      return json({ error: 'No se pudo registrar el aviso' }, 502);
    }

    return json({ message: 'Aviso registrado' });
  } catch (error: any) {
    console.error('Error en avisar-donacion:', error?.message);
    return json({ error: 'Error al procesar el aviso' }, 500);
  }
}
