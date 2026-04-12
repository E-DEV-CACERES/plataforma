const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');
const app = require('../src/app');
const db = require('../src/db');
const config = require('../src/config');

const USE_HTTPS = process.env.USE_HTTPS === 'true';

function getHttpsOptions() {
  const certsDir = path.join(__dirname, '..', 'certs');
  const keyPath = path.join(certsDir, 'key.pem');
  const certPath = path.join(certsDir, 'cert.pem');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }

  // Generar certificados autofirmados para desarrollo
  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const opts = { days: 365, algorithm: 'sha256', keySize: 2048 };
  const pems = selfsigned.generate(attrs, opts);

  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);
  console.log('Certificados HTTPS generados en ./certs/');

  return { key: pems.private, cert: pems.cert };
}

async function start() {
  try {
    const conn = await db.pool.getConnection();
    conn.release();
    console.log('Conectado a MySQL');

    const protocol = USE_HTTPS ? 'https' : 'http';
    const createServer = USE_HTTPS
      ? () => https.createServer(getHttpsOptions(), app)
      : () => http.createServer(app);

    const server = createServer().listen(config.port, () => {
      console.log(`Servidor backend escuchando en ${protocol}://localhost:${config.port}`);
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
