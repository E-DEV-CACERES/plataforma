const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// En Vercel/Producción: usar /tmp; en desarrollo: usar ./uploads
const getUploadDir = () => {
  if (process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'uploads', 'instructors');
  }
  return path.join(process.cwd(), 'uploads', 'instructors');
};

const uploadBaseDir = getUploadDir();
const profileDir = path.join(uploadBaseDir, 'profile');
const coverDir = path.join(uploadBaseDir, 'cover');

// Solo crear directorios en desarrollo (diskStorage)
if (process.env.NODE_ENV !== 'production') {
  [profileDir, coverDir].forEach((dir) => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const profileStorage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage() // En Vercel: guardar en memoria
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // Crear directorio si no existe
        if (!fs.existsSync(profileDir)) {
          fs.mkdirSync(profileDir, { recursive: true });
        }
        cb(null, profileDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext : '.jpg';
        cb(null, `profile-${req.user.id}-${Date.now()}${safeExt}`);
      },
    });

const coverStorage = process.env.NODE_ENV === 'production'
  ? multer.memoryStorage() // En Vercel: guardar en memoria
  : multer.diskStorage({
      destination: (req, file, cb) => {
        // Crear directorio si no existe
        if (!fs.existsSync(coverDir)) {
          fs.mkdirSync(coverDir, { recursive: true });
        }
        cb(null, coverDir);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext : '.jpg';
        cb(null, `cover-${req.user.id}-${Date.now()}${safeExt}`);
      },
    });

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Solo se permiten imágenes: JPG, PNG, WebP o GIF.'));
};

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadCover = multer({
  storage: coverStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadProfile, uploadCover };
