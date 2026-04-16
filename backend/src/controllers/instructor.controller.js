const instructorService = require('../services/instructor.service');
const { uploadImage } = require('../utils/cloudinary');

async function getProfile(req, res, next) {
  try {
    const profile = await instructorService.getProfile(req.params.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await instructorService.getMyProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile = await instructorService.updateMyProfile(req.user.id, req.body);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function uploadProfileImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }
    const result = await uploadImage(req.file, `instructors/profile`);
    const profile = await instructorService.uploadProfileImage(req.user.id, result.secure_url);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function uploadCoverImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }
    const result = await uploadImage(req.file, `instructors/cover`);
    const profile = await instructorService.uploadCoverImage(req.user.id, result.secure_url);
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  uploadCoverImage,
};
