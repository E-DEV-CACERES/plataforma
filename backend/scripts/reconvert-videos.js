/**
 * Reconvierte todos los videos existentes a H.264 para compatibilidad con navegadores.
 * Uso: node scripts/reconvert-videos.js
 * Requiere: ffmpeg instalado en el sistema
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const db = require('../src/db');
const { convertToH264 } = require('../src/utils/convertVideo');

async function reconvert() {
  try {
    const [videos] = await db.query('SELECT id, title, video_url FROM videos');
    const videosDir = path.join(process.cwd(), 'uploads', 'videos');
    let converted = 0;
    let skipped = 0;
    let failed = 0;

    for (const v of videos) {
      const filename = v.video_url?.replace('/uploads/videos/', '');
      if (!filename) continue;
      const filePath = path.join(videosDir, filename);
      if (!fs.existsSync(filePath)) {
        console.log(`  ⚠ ${v.title}: archivo no encontrado`);
        failed++;
        continue;
      }
      process.stdout.write(`  Procesando: ${v.title}... `);
      const ok = await convertToH264(filePath);
      if (ok) {
        console.log('OK');
        converted++;
      } else {
        console.log('omitido (ya compatible o error)');
        skipped++;
      }
    }

    console.log(`\n✅ Listo. Convertidos: ${converted}, Omitidos: ${skipped}, Fallidos: ${failed}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

console.log('Reconvirtiendo videos a H.264...\n');
reconvert();
