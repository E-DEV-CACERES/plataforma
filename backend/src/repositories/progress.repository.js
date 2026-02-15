const db = require('../db');

async function findByUserAndCourse(userId, courseId) {
  const [rows] = await db.query(
    `SELECT id, user_id AS userId, course_id AS courseId,
            last_watched_video_id AS lastWatchedVideoId,
            progress_percentage AS progressPercentage,
            completed_at AS completedAt,
            created_at AS createdAt, updated_at AS updatedAt
     FROM progress WHERE user_id = ? AND course_id = ?`,
    [userId, courseId]
  );
  return rows[0] || null;
}

async function create(userId, courseId) {
  const [result] = await db.query(
    'INSERT INTO progress (user_id, course_id, progress_percentage) VALUES (?, ?, 0)',
    [userId, courseId]
  );
  return result.insertId;
}

async function findOrCreate(userId, courseId) {
  let progress = await findByUserAndCourse(userId, courseId);
  if (!progress) {
    await create(userId, courseId);
    progress = await findByUserAndCourse(userId, courseId);
  }
  return progress;
}

async function getAllByCourseId(courseId) {
  const [rows] = await db.query(
    `SELECT p.id, p.user_id AS userId, u.name AS userName, u.email AS userEmail,
            p.course_id AS courseId, p.progress_percentage AS progressPercentage,
            p.completed_at AS completedAt, p.created_at AS createdAt, p.updated_at AS updatedAt
     FROM progress p
     JOIN users u ON p.user_id = u.id
     WHERE p.course_id = ?
     ORDER BY p.progress_percentage DESC`,
    [courseId]
  );
  return rows;
}

async function findProgressVideo(progressId, videoId) {
  const [rows] = await db.query(
    'SELECT id FROM progress_videos WHERE progress_id = ? AND video_id = ?',
    [progressId, videoId]
  );
  return rows[0] || null;
}

async function addVideoWatched(progressId, videoId) {
  await db.query(
    'INSERT INTO progress_videos (progress_id, video_id) VALUES (?, ?)',
    [progressId, videoId]
  );
}

async function updateProgress(progressId, data) {
  const { lastWatchedVideoId, progressPercentage, completedAt } = data;
  await db.query(
    `UPDATE progress SET
      last_watched_video_id = ?, progress_percentage = ?, completed_at = ?
     WHERE id = ?`,
    [lastWatchedVideoId, progressPercentage, completedAt, progressId]
  );
}

async function countWatchedVideos(progressId) {
  const [[row]] = await db.query(
    'SELECT COUNT(*) AS total FROM progress_videos WHERE progress_id = ?',
    [progressId]
  );
  return row.total;
}

module.exports = {
  findByUserAndCourse,
  findOrCreate,
  create,
  getAllByCourseId,
  findProgressVideo,
  addVideoWatched,
  updateProgress,
  countWatchedVideos,
};
