const multer = require('multer');

const storage = multer.memoryStorage();

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
