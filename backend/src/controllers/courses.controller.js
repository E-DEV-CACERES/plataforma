const coursesService = require('../services/courses.service');
const ratingService = require('../services/rating.service');

async function getAll(req, res, next) {
  try {
    const search = req.query.search || req.query.q || '';
    const courses = await coursesService.getAll(search);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getEnrolled(req, res, next) {
  try {
    const courses = await coursesService.getEnrolled(req.user.id);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const userId = req.user?.id || null;
    const course = await coursesService.getById(req.params.id, userId);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const course = await coursesService.create(req.body, req.user.id);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const course = await coursesService.update(req.params.id, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await coursesService.remove(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function enroll(req, res, next) {
  try {
    const result = await coursesService.enroll(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function rate(req, res, next) {
  try {
    const result = await ratingService.rate(
      req.params.id,
      req.user.id,
      req.body.rating
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAll,
  getById,
  getEnrolled,
  create,
  update,
  remove,
  enroll,
  rate,
};
