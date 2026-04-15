const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// En Vercel/Producción: usar /tmp; en desarrollo: usar ./uploads
const getUploadDir = () => {
  if (process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'uploads', 'files');
  }
  return path.join(process.cwd(), 'uploads', 'files');
};

const filesDir = getUploadDir();

// Solo crear directorios en desarrollo
if (process.env.NODE_ENV !== 'production') {
  if (!fs.existsSync(filesDir)) fs.mkdirSync(filesDir, { recursive: true });
}

const storage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage() // En Vercel: guardar en memoria
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // Crear directorio si no existe
        if (!fs.existsSync(filesDir)) {
          fs.mkdirSync(filesDir, { recursive: true });
        }
        cb(null, filesDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '';
        cb(null, 'file-' + uniqueSuffix + ext);
      },
    });

const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'image/png',
  'image/jpeg',
  'image/gif',
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Tipo de archivo no permitido. Use PDF, Word, Excel, texto o imágenes.'));
};

module.exports = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});
