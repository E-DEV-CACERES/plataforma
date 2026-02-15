const app = require('../src/app');
const db = require('../src/db');
const config = require('../src/config');

async function start() {
  try {
    const conn = await db.pool.getConnection();
    conn.release();
    console.log('Conectado a MySQL');

    const server = app.listen(config.port, () => {
      console.log(`Servidor backend escuchando en puerto ${config.port}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n El puerto ${config.port} ya está en uso.`);
        console.error('   Cierra el otro proceso o ejecuta: Get-NetTCPConnection -LocalPort 4000 | % { Stop-Process -Id $_.OwningProcess -Force }\n');
      }
      throw err;
    });
  } catch (err) {
    console.error('Error de conexión a MySQL:', err);
    process.exit(1);
  }
}

start();
