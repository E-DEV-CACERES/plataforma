const courseFileService = require('../services/courseFile.service');

async function getByCourseId(req, res, next) {
  try {
    const files = await courseFileService.getByCourseId(req.params.courseId);
    res.json(files);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const file = req.file;
    const fileRecord = await courseFileService.create(
      req.params.courseId,
      req.body,
      file
    );
    res.status(201).json(fileRecord);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await courseFileService.remove(req.params.fileId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByCourseId,
  create,
  remove,
};
