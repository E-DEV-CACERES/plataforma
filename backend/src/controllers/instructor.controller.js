const instructorService = require('../services/instructor.service');
const fs = require('fs');

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
    const filePath = `/uploads/instructors/profile/${req.file.filename}`;
    const profile = await instructorService.uploadProfileImage(req.user.id, filePath);
    res.json(profile);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(err);
  }
}

async function uploadCoverImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ninguna imagen.' });
    }
    const filePath = `/uploads/instructors/cover/${req.file.filename}`;
    const profile = await instructorService.uploadCoverImage(req.user.id, filePath);
    res.json(profile);
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
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
