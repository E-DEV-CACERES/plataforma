const sectionService = require('../services/section.service');

async function getByCourseId(req, res, next) {
  try {
    const sections = await sectionService.getByCourseId(req.params.courseId);
    res.json(sections);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const section = await sectionService.create(req.params.courseId, req.body);
    res.status(201).json(section);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const section = await sectionService.update(req.params.sectionId, req.body);
    res.json(section);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await sectionService.remove(req.params.sectionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getByCourseId,
  create,
  update,
  remove,
};
