const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profileDir = path.join(process.cwd(), 'uploads', 'instructors', 'profile');
const coverDir = path.join(process.cwd(), 'uploads', 'instructors', 'cover');
[profileDir, coverDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, profileDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext.toLowerCase()) ? ext : '.jpg';
    cb(null, `profile-${req.user.id}-${Date.now()}${safeExt}`);
  },
});

const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, coverDir),
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
