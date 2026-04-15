const app = require('../src/app');
const db = require('../src/db');
const config = require('../src/config');

async function start() {
  try {
    const conn = await db.pool.getConnection();
    conn.release();
    console.log('✓ Conectado a MySQL');

    const port = process.env.PORT || config.port;

    const server = app.listen(port, () => {
      console.log(`✓ Servidor backend escuchando en puerto ${port}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Error: Puerto ${port} ya está en uso.`);
      }
      throw err;
    });
  } catch (err) {
    console.error('Error de conexión a MySQL:', err);
    process.exit(1);
  }
}

if (process.env.VERCEL) {
  module.exports = app;
} else {
  start();
}
