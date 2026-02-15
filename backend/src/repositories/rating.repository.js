const db = require('../db');

async function upsert(courseId, userId, rating) {
  const ratingNum = Math.min(5, Math.max(1, Number(rating)));
  const [result] = await db.query(
    `INSERT INTO course_ratings (course_id, user_id, rating)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
    [courseId, userId, ratingNum]
  );
  return result.affectedRows > 0;
}

async function findByUserAndCourse(courseId, userId) {
  const [rows] = await db.query(
    'SELECT id, course_id AS courseId, user_id AS userId, rating, created_at AS createdAt FROM course_ratings WHERE course_id = ? AND user_id = ?',
    [courseId, userId]
  );
  return rows[0] || null;
}

async function getAverageAndCount(courseId) {
  const [[row]] = await db.query(
    'SELECT COALESCE(AVG(rating), 0) AS avgRating, COUNT(*) AS count FROM course_ratings WHERE course_id = ?',
    [courseId]
  );
  return {
    averageRating: Number(Number(row.avgRating).toFixed(1)),
    ratingsCount: Number(row.count ?? 0),
  };
}

module.exports = {
  upsert,
  findByUserAndCourse,
  getAverageAndCount,
};
