export const prerender = false;

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();

    console.log('Enviando datos a n8n:', body);

    // Petición a la IP de Azure en el puerto 80
    const response = await fetch('http://20.163.242.252/webhook/25d0ff7d-7537-4832-8892-a822100dbb37', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        autor: body.autor,
        terminos: body.terminos,
        timestamp: new Date().toISOString()
      }),
    });

    const textData = await response.text();
    console.log('Respuesta de n8n - Status:', response.status, 'Body:', textData);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `n8n devolvió estado ${response.status}: ${textData}` }),
        { status: response.status }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Solicitud procesada correctamente' }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error detallado en el backend de Astro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Error al conectar con n8n' }),
      { status: 500 }
    );
  }
}