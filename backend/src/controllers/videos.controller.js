const videosService = require('../services/videos.service');

async function getByCourseId(req, res, next) {
  try {
    const videos = await videosService.getByCourseId(req.params.courseId);
    res.json(videos);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const video = await videosService.getById(req.params.videoId);
    res.json(video);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const videoFile = req.files?.video?.[0];
    const subtitleFile = req.files?.subtitle?.[0];
    const video = await videosService.create(
      req.params.courseId,
      req.body,
      videoFile,
      subtitleFile
    );
    res.status(201).json(video);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const video = await videosService.update(req.params.videoId, req.body);
    res.json(video);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await videosService.remove(req.params.videoId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByCourseId,
  getById,
  create,
  update,
  remove,
};
