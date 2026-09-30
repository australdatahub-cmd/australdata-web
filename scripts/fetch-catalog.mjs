import fs from 'node:fs';
import path from 'node:path';

// ID real de catalog.json generado por el workflow 02_Curaduria en n8n
const FILE_ID = '1PifUlXmFZqB7eylPVNZGxngGRyv3vqHs';
const CATALOG_URL = `https://drive.google.com/uc?export=download&id=${FILE_ID}`;

async function downloadCatalog() {
  const targetDir = path.join(process.cwd(), 'src', 'data');
  const targetPath = path.join(targetDir, 'catalog.json');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  try {
    console.log('🔄 Descargando catalog.json desde Google Drive...');
    const response = await fetch(CATALOG_URL);

    if (!response.ok) {
      throw new Error(`Error en la descarga: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('El catalog.json descargado no es un array. Verifica el ID del archivo y sus permisos de Drive (debe ser "Cualquier persona con el enlace - Lector").');
    }

    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2));
    console.log(`✅ catalog.json sincronizado (${data.length} registros).`);
  } catch (error) {
    console.error('❌ Error sincronizando el catálogo:', error.message);
    if (!fs.existsSync(targetPath)) {
      fs.writeFileSync(targetPath, '[]');
      console.warn('⚠️  Se dejó un catalog.json vacío para permitir que el build continúe.');
    } else {
      console.warn('⚠️  Se mantiene la copia local anterior de catalog.json.');
    }
  }
}

downloadCatalog();