const db = require('../db');

async function findByCourseId(courseId) {
  const [rows] = await db.query(
    `SELECT id, title, description, duration, video_url AS videoUrl, subtitle_url AS subtitleUrl,
            course_id AS courseId, section_id AS sectionId, \`order\`, created_at AS createdAt, updated_at AS updatedAt
     FROM videos WHERE course_id = ? ORDER BY \`order\` ASC, id ASC`,
    [courseId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, title, description, duration, video_url AS videoUrl, subtitle_url AS subtitleUrl,
            course_id AS courseId, section_id AS sectionId, \`order\`, created_at AS createdAt, updated_at AS updatedAt
     FROM videos WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function existsInCourse(videoId, courseId) {
  const [rows] = await db.query(
    'SELECT id FROM videos WHERE id = ? AND course_id = ?',
    [videoId, courseId]
  );
  return rows.length > 0;
}

async function create(data) {
  const { title, description, duration, videoUrl, subtitleUrl, courseId, sectionId, order } = data;
  const [result] = await db.query(
    `INSERT INTO videos (title, description, duration, video_url, subtitle_url, course_id, section_id, \`order\`)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, description || null, duration || 0, videoUrl, subtitleUrl || null, courseId, sectionId || null, order || 0]
  );
  return result.insertId;
}

async function update(id, data) {
  const { title, description, duration, order, subtitleUrl, sectionId } = data;
  const updates = [];
  const params = [];
  if (title !== undefined) { updates.push('title = ?'); params.push(title); }
  if (description !== undefined) { updates.push('description = ?'); params.push(description); }
  if (duration !== undefined) { updates.push('duration = ?'); params.push(Number(duration)); }
  if (order !== undefined) { updates.push('`order` = ?'); params.push(Number(order)); }
  if (subtitleUrl !== undefined) { updates.push('subtitle_url = ?'); params.push(subtitleUrl); }
  if (sectionId !== undefined) { updates.push('section_id = ?'); params.push(sectionId || null); }
  if (updates.length === 0) return true;
  params.push(id);
  const [result] = await db.query(`UPDATE videos SET ${updates.join(', ')} WHERE id = ?`, params);
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM videos WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function countByCourseId(courseId) {
  const [[row]] = await db.query(
    'SELECT COUNT(*) AS total FROM videos WHERE course_id = ?',
    [courseId]
  );
  return row.total;
}

module.exports = {
  findByCourseId,
  findById,
  existsInCourse,
  create,
  update,
  remove,
  countByCourseId,
};
