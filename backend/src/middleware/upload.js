const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// En Vercel/Producción: usar /tmp; en desarrollo: usar ./uploads
const getUploadDir = () => {
  if (process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'uploads');
  }
  return path.join(process.cwd(), 'uploads');
};

const uploadBaseDir = getUploadDir();
const videosDir = path.join(uploadBaseDir, 'videos');
const subtitlesDir = path.join(uploadBaseDir, 'subtitles');

// Solo crear directorios en desarrollo
if (process.env.NODE_ENV !== 'production') {
  [videosDir, subtitlesDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

const storage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage() // En Vercel: guardar en memoria
  : multer.diskStorage({
      destination: (req, file, cb) => {
        const dir = file.fieldname === 'subtitle' ? subtitlesDir : videosDir;
        // Crear directorio si no existe
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.fieldname === 'subtitle' ? '.vtt' : '.mp4';
        const prefix = file.fieldname === 'subtitle' ? 'subtitle-' : 'video-';
        cb(null, prefix + uniqueSuffix + ext);
      },
    });

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'subtitle') {
    const allowed = ['text/vtt', 'application/x-subrip', 'text/plain'];
    const isVtt = file.originalname.toLowerCase().endsWith('.vtt');
    if (allowed.includes(file.mimetype) || isVtt) return cb(null, true);
    return cb(new Error('Subtítulos: solo archivos .vtt'));
  }
  const allowedMimes = ['video/mp4'];
  const isMp4 = file.originalname.toLowerCase().endsWith('.mp4') || file.originalname.toLowerCase().endsWith('.m4v');
  if (allowedMimes.includes(file.mimetype) || isMp4) return cb(null, true);
  cb(new Error('Solo se permiten archivos MP4 (H.264) para compatibilidad con todos los navegadores.'));
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter,
});

module.exports = upload;
