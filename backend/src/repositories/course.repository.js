const db = require('../db');

async function findAll(search = '') {
  const searchCondition = search.trim()
    ? 'AND (c.title LIKE ? OR c.description LIKE ?)'
    : '';
  const searchParams = search.trim()
    ? [`%${search.trim()}%`, `%${search.trim()}%`]
    : [];

  const [rows] = await db.query(
    `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE 1=1 ${searchCondition}
     ORDER BY c.created_at DESC`,
    searchParams
  );
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    createdAt: row.createdAt,
    createdById: row.createdById,
    createdByName: row.createdByName,
    createdByEmail: row.createdByEmail,
    studentsCount: Number(row.studentsCount ?? 0),
    averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
    ratingsCount: Number(row.ratingsCount ?? 0),
    totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
  }));
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, title, description, content, instructor_tagline AS instructorTagline, instructor_bio AS instructorBio,
            created_by AS createdBy, created_at AS createdAt,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = courses.id) AS studentsCount,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = courses.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = courses.id) AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = courses.id) AS totalDurationSeconds,
            (SELECT COALESCE(GREATEST(MAX(updated_at), MAX(created_at)), courses.created_at) FROM videos WHERE course_id = courses.id) AS lastUpdatedAt
     FROM courses WHERE id = ?`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  return {
    ...row,
    studentsCount: Number(row.studentsCount ?? 0),
    averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
    ratingsCount: Number(row.ratingsCount ?? 0),
    totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
    lastUpdatedAt: row.lastUpdatedAt ?? row.createdAt,
  };
}

async function exists(id) {
  const [rows] = await db.query('SELECT id FROM courses WHERE id = ?', [id]);
  return rows.length > 0;
}

async function create(data) {
  const { title, description, content, createdBy, instructorTagline, instructorBio } = data;
  const [result] = await db.query(
    'INSERT INTO courses (title, description, content, instructor_tagline, instructor_bio, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [title, description || null, content || null, instructorTagline || null, instructorBio || null, createdBy]
  );
  return result.insertId;
}

async function update(id, data) {
  const { title, description, content, instructorTagline, instructorBio } = data;
  const [result] = await db.query(
    `UPDATE courses SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      content = COALESCE(?, content),
      instructor_tagline = COALESCE(?, instructor_tagline),
      instructor_bio = COALESCE(?, instructor_bio)
     WHERE id = ?`,
    [title, description, content, instructorTagline, instructorBio, id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function isEnrolled(courseId, userId) {
  const [rows] = await db.query(
    'SELECT id FROM course_students WHERE course_id = ? AND user_id = ?',
    [courseId, userId]
  );
  return rows.length > 0;
}

async function enroll(courseId, userId) {
  await db.query(
    'INSERT INTO course_students (course_id, user_id) VALUES (?, ?)',
    [courseId, userId]
  );
}

async function findEnrolledByUser(userId) {
  const [rows] = await db.query(
    `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            (SELECT COUNT(*) FROM progress_videos pv
             JOIN progress p ON pv.progress_id = p.id AND p.user_id = ? AND p.course_id = c.id
             JOIN videos v ON pv.video_id = v.id AND v.course_id = c.id) AS watchedCount,
            (SELECT COUNT(*) FROM videos WHERE course_id = c.id) AS totalVideos,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
            (SELECT rating FROM course_ratings WHERE course_id = c.id AND user_id = ?) AS userRating,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     INNER JOIN course_students cs ON cs.course_id = c.id AND cs.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId, userId, userId]
  );
  return rows.map((row) => {
    const totalVideos = Number(row.totalVideos ?? 0);
    const watchedCount = Number(row.watchedCount ?? 0);
    const progressPercentage =
      totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      createdAt: row.createdAt,
      createdById: row.createdById,
      createdByName: row.createdByName,
      createdByEmail: row.createdByEmail,
      studentsCount: Number(row.studentsCount ?? 0),
      isEnrolled: true,
      progressPercentage,
      videosWatched: watchedCount,
      totalVideos,
      averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
      ratingsCount: Number(row.ratingsCount ?? 0),
      userRating: row.userRating ? Number(row.userRating) : null,
      totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
    };
  });
}

module.exports = {
  findAll,
  findById,
  exists,
  create,
  update,
  remove,
  isEnrolled,
  enroll,
  findEnrolledByUser,
};
